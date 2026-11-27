import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { canReview, useMe } from "../lib/useRole";
import { useStore } from "../lib/store";
import { API_URL } from "../lib/api";
import { mine, reviewList, Row } from "../lib/submissionsApi";
import { SubmitPanel } from "../components/SubmitPanel";
import { ExpectedList } from "../components/ExpectedList";
import { PROGRAMME, dayKey, getWeek, taskKey } from "../data/programme";
import { WEEKS, EXPECT, ESSENTIAL, WORKING, NOT_MANDATORY, FORMAT } from "../data/outline";
import { notesFor } from "../data/studyNotes";
import { useWork } from "../lib/work";
import { dayStatus, fmtDate } from "../lib/backlog";
import { Chip } from "../components/Chip";
import { useView } from "../lib/viewAs";
import { StartDate } from "../components/StartDate";
import { StudyNote } from "../components/StudyNote";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { Progress } from "../components/Progress";
import { useToast } from "../components/Toast";
import { EmptyState } from "../components/States";
import { builtFor } from "../data/builtWork";
import { TrackTabs } from "../components/TrackTabs";

const flags = (v: unknown, len: number): boolean[] => Array.from({ length: len }, (_, i) => Array.isArray(v) && v[i] === true);
const ST: Record<string, [string, "ok" | "warn" | "bad" | "info" | "none"]> = { submitted: ["Waiting for review", "info"], changes_requested: ["Changes asked", "bad"], approved: ["Approved", "ok"], draft: ["Saved, not submitted", "warn"] };

/** Reviewer view: who handed in this day, and where each hand-in stands, with a way into the review. */
function CohortSummary({ task, rows }: { task: string; rows: Row[] }) {
  const here = rows.filter((r) => r.task_key === task);
  const n = (s: string) => here.filter((r) => r.status === s).length;
  return (
    <div className="submitpanel">
      <h3>Learners on this day</h3>
      <p>{n("submitted")} waiting for review, {n("changes_requested")} sent back, {n("approved")} approved. <Link to="/review">Open Review</Link></p>
      {here.length > 0 && (
        <ul className="plain">{here.map((r) => { const [l, t] = ST[r.status] ?? [r.status, "none"]; return (
          <li key={r.id}><b>{r.author}</b> <Chip tone={t}>{l}</Chip>{r.submitted_at ? <span className="muted small"> &middot; handed in {fmtDate(new Date(r.submitted_at))}</span> : null}{r.item_count ? <span className="muted small"> &middot; {r.item_count} proof</span> : null}</li>); })}</ul>
      )}
    </div>
  );
}

/** The six-week outline, folded in as an overview: each week's expected output, plus what is expected and which skills count. */
function Overview({ current, open, onToggle }: { current: number; open: boolean; onToggle: (o: boolean) => void }) {
  const { entries, setEntry } = useStore();
  const done = WEEKS.filter((w) => entries["wk:" + w.n]).length;
  return (
    <details className="card ovr" id="overview" open={open} onToggle={(e) => onToggle((e.currentTarget as HTMLDetailsElement).open)}>
      <summary>
        <span className="pi-tile kpi-ic" aria-hidden="true"><Icon name="layers" size={18} /></span>
        <span>Six-week overview <span className="meta">&middot; {done} of {WEEKS.length} weeks ticked</span></span>
        <span className="chev"><Icon name="down" size={18} /></span>
      </summary>
      <div className="ovr-body">
        <p className="muted small" style={{ marginBottom: "var(--s-4)" }}>The standard company outline: 3 hours a day, 90 hours. Tick each week's expected output as you reach it. <a href="/docs/FDE-Training-Outline-6-week.pdf" target="_blank" rel="noopener noreferrer">Open the original PDF<span className="sr"> (opens in a new tab)</span></a>.</p>
        <ul className="ovr-weeks">
          {WEEKS.map((w) => (
            <li key={w.n} className={"ovr-week" + (w.n === current ? " now" : "")}>
              <div className="wk"><b>Week {w.n}</b>{getWeek(w.n) && <Link to={`/week/${w.n}`} className="small">Open tasks</Link>}</div>
              <span className="small"><b>{w.focus}</b></span>
              <label className="check"><input type="checkbox" checked={!!entries["wk:" + w.n]} onChange={(e) => setEntry("wk:" + w.n, e.target.checked)} /><span>{w.output}</span></label>
            </li>
          ))}
        </ul>
        <div className="ovr-cols">
          <div>
            <section><h3>What is expected of you</h3><ul className="plain">{EXPECT.map((x) => <li key={x}>{x}</li>)}</ul></section>
            <section><h3>Format</h3><dl className="kv">{FORMAT.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}</dl></section>
          </div>
          <div>
            <section><h3>Essential skills</h3><dl className="kv">{ESSENTIAL.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}</dl></section>
            <section><h3>Working knowledge</h3><ul className="plain">{WORKING.map((x) => <li key={x}>{x}</li>)}</ul></section>
            <section><h3>Not mandatory</h3><ul className="plain">{NOT_MANDATORY.map((x) => <li key={x}>{x}</li>)}</ul></section>
          </div>
        </div>
      </div>
    </details>
  );
}

/** One week of the programme, read from the registry: any registered week works at /week/<number>. */
export default function Programme() {
  const { n } = useParams();
  const week = getWeek(Number(n));
  const { entries, setEntry } = useStore();
  const { me, ready } = useMe();
  const work = useWork();
  const toast = useToast();
  const { hash } = useLocation();
  const reviewerRole = me?.role === "reviewer"; // reviewers review; the server does not let them hand in proof
  const { reviewerView: reviewer } = useView(); // what the screen shows: learner view or reviewer view
  const [cohort, setCohort] = useState<Row[]>([]);
  const [keys, setKeys] = useState<Set<string> | null>(null); // null = unknown: each panel asks the server itself
  const [listLoaded, setListLoaded] = useState(!API_URL);
  const [ovOpen, setOvOpen] = useState(hash === "#overview");
  const focusDay = work.focus && work.focus.week.n === week?.n ? work.focus.state.day.n : null;
  const hashDay = /^#wd(\d+)$/.exec(hash)?.[1];
  const [openDays, setOpenDays] = useState<Set<number>>(() => new Set(hashDay ? [Number(hashDay)] : focusDay ? [focusDay] : []));

  useEffect(() => { if (reviewer) reviewList("all").then(setCohort).catch(() => setCohort([])); }, [reviewer]);
  useEffect(() => {
    if (!API_URL) return;
    if (reviewerRole) { setListLoaded(true); return; } // a reviewer has no submissions of their own to look up
    // Which days already have a submission. A person who is not signed in to the API simply has none.
    mine().then((rows) => setKeys(new Set(rows.map((r) => r.task_key)))).catch(() => setKeys(null)).finally(() => setListLoaded(true));
  }, [reviewerRole]);
  // A link such as /week/1#wd3 opens that day; /week/1#overview opens the overview.
  useEffect(() => {
    const d = /^#wd(\d+)$/.exec(hash)?.[1];
    if (d) setOpenDays((s) => (s.has(Number(d)) ? s : new Set(s).add(Number(d))));
    if (hash === "#overview") setOvOpen(true);
  }, [hash]);
  // Once the live status arrives, today's day opens by itself when nothing else was chosen.
  useEffect(() => { if (focusDay && !hash) setOpenDays((s) => (s.size ? s : new Set([focusDay]))); }, [focusDay]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!week) {
    return (
      <>
        <PageHeader overline="Programme" title="Week not found" />
        <EmptyState icon="book" title={`There is no week ${n} in the programme yet`} action={<div className="row center">{PROGRAMME.map((w) => <Link key={w.n} className="btn secondary" to={`/week/${w.n}`}>Week {w.n}</Link>)}</div>}>Pick one of the weeks that is ready.</EmptyState>
      </>
    );
  }

  const total = week.days.reduce((a, d) => a + d.done.length, 0);
  const got = week.days.reduce((a, d) => a + flags(entries[dayKey(week.n, d.n)], d.done.length).filter(Boolean).length, 0);
  const pct = total ? Math.round((got / total) * 100) : 0;
  const toggle = (day: number, len: number, i: number) => {
    const cur = flags(entries[dayKey(week.n, day)], len);
    cur[i] = !cur[i];
    setEntry(dayKey(week.n, day), cur);
    if (cur.every(Boolean)) toast.success(`Day ${day}: every point is ticked.`);
  };
  const flip = (d: number) => setOpenDays((s) => { const x = new Set(s); if (x.has(d)) x.delete(d); else x.add(d); return x; });
  const allOpen = openDays.size === week.days.length;
  const behind = work.missed.filter((m) => m.week.n === week.n).length;

  return (
    <>
      <PageHeader overline="Programme" title={`Week ${week.n}`} sub={week.title} />
      <TrackTabs current="fde" />
      {PROGRAMME.length > 1 && (
        <nav className="weeksw" aria-label="Weeks">{PROGRAMME.map((w) => <Link key={w.n} to={`/week/${w.n}`} aria-current={w.n === week.n ? "page" : undefined}>Week {w.n}</Link>)}</nav>
      )}

      <Overview current={week.n} open={ovOpen} onToggle={setOvOpen} />

      {canReview(me) && (
        <div className="callout ok weekbar-note" role="note">
          {reviewer
            ? <><b>Reviewer view.</b> Under each day you see who handed in and where it stands. To read the proof and decide, open <Link to="/review">Review</Link>; for each person's report, open <Link to="/progress">Progress</Link>. Switch to the learner view in the top bar to see the page as a learner does.</>
            : <><b>Learner view.</b> This is the page as a learner sees it{reviewerRole ? " (reviewers cannot hand in proof themselves)" : ""}. Switch back to the reviewer view in the top bar.</>}
        </div>
      )}

      <section className="card weekbar" aria-labelledby="wk-h">
        <div className="grow">
          <h2 id="wk-h" style={{ fontSize: "var(--fs-lg)" }}>Week progress</h2>
          <p className="meta tnum">{got} of {total} points done &middot; {pct}%</p>
          <Progress value={pct} label="Week progress" />
        </div>
        <button type="button" className="btn secondary" aria-pressed={allOpen} onClick={() => setOpenDays(allOpen ? new Set() : new Set(week.days.map((d) => d.n)))}>
          <Icon name="layers" size={16} />{allOpen ? "Fold all days" : "Open all days"}
        </button>
      </section>
      {!reviewer && (
        <div className="weekmeta weekbar-note">
          <StartDate week={week.n} />
          {behind > 0 && (
            <p className="callout warn" role="note"><Icon name="alert" size={14} /> <b>You are behind on {behind} day{behind === 1 ? "" : "s"}.</b> <Link to="/#catch-up">Open catch-up</Link> to see what is missing and read a short summary.</p>
          )}
        </div>
      )}

      <div className="daylist">
        {week.days.map((d) => {
          const f = flags(entries[dayKey(week.n, d.n)], d.done.length);
          const done = f.filter(Boolean).length;
          const task = taskKey(week.n, d.n);
          const state = work.weeks.find((x) => x.week.n === week.n)?.states.find((x) => x.day.n === d.n);
          const st = state ? dayStatus(state, work.now) : null;
          const notes = notesFor(week.n, d.n);
          const open = openDays.has(d.n);
          const numTone = !reviewer && state?.finished ? "done" : !reviewer && state?.missed ? "bad" : focusDay === d.n ? "focus" : "";
          return (
            <section key={task} id={`wd${d.n}`} className={"card daycard" + (open ? " open" : "") + (focusDay === d.n && !reviewer ? " today" : "")} aria-labelledby={`wd${d.n}-h`}>
              <h2 id={`wd${d.n}-h`} style={{ fontSize: "inherit" }}>
                <button type="button" className="daycard-head" aria-expanded={open} aria-controls={`wd${d.n}-body`} onClick={() => flip(d.n)}>
                  <span className={"daynum " + numTone} aria-hidden="true">{state?.finished && !reviewer ? <Icon name="check" size={20} /> : d.n}</span>
                  <span className="daytitle">
                    <b><span className="sr">Day {d.n}: </span>{d.title}</b>
                    <span className="meta tnum">
                      <span>Day {d.n}</span>
                      {!reviewer && state?.due && <span>due {fmtDate(state.due)}</span>}
                      <span>{done} of {d.done.length} points</span>
                    </span>
                  </span>
                  <span className="daychips">
                    {!reviewer && st && <Chip tone={st.tone}>{st.label}</Chip>}
                    <span className="daymini">{done}/{d.done.length}</span>
                  </span>
                  <span className="daychev"><Icon name="down" size={18} /></span>
                </button>
              </h2>
              <div id={`wd${d.n}-body`} className="daycard-body" hidden={!open}>
                <div className="daycols two-col">
                  <div className="panel theory" aria-labelledby={`th${d.n}`}>
                    <h3 id={`th${d.n}`}><span className="pi"><Icon name="book" size={16} /></span>Theory: what to learn</h3>
                    {d.summary && <p>{d.summary}</p>}
                    {d.keyIdeas && <ul className="plain">{d.keyIdeas.map((k) => <li key={k}>{k}</li>)}</ul>}
                    {notes
                      ? (
                        <>
                          <p className="muted small" style={{ marginTop: "var(--s-3)" }}>Open a topic for a plain-English explanation, an example and where to read more.</p>
                          <div className="stackcards tight" style={{ marginTop: "var(--s-2)" }}>{notes.notes.map((nt, i) => <StudyNote key={nt.topic} note={nt} collapsible id={`d${d.n}t${i + 1}`} />)}</div>
                          <p className="small" style={{ marginTop: "var(--s-3)" }}><Link to={`/resources?tab=notes&w=${week.n}&day=${d.n}`}>Search all study notes</Link></p>
                        </>
                      )
                      : <details className="mini"><summary>What to study</summary><ul className="plain">{d.topics.map((t) => <li key={t}>{t}</li>)}</ul></details>}
                  </div>

                  <div className="panel practical" aria-labelledby={`pr${d.n}`}>
                    <h3 id={`pr${d.n}`}><span className="pi"><Icon name="tasks" size={16} /></span>Practical: what to build</h3>
                    <p>{d.task}</p>
                    <details className="mini"><summary>How to do it</summary>
                      <ol className="plain">{d.how.map((t) => <li key={t}>{t}</li>)}</ol></details>
                    <h4>Done when</h4>
                    {d.done.map((t, i) => (
                      <label key={t} className="check"><input type="checkbox" checked={f[i]} onChange={() => toggle(d.n, d.done.length, i)} /><span>{t}</span></label>
                    ))}
                    <ExpectedList week={week.n} day={d.n} />
                    {builtFor(week.n, d.n).map((b) => (
                      <div key={b.id} className="callout ok" role="note">
                        <p><b>Working example built for this day:</b> {b.title}</p>
                        <p className="small">{b.what}</p>
                        <div className="row"><Link className="btn secondary" to={b.open}>{b.openLabel}</Link><a className="small" href={b.evidence} target="_blank" rel="noopener noreferrer">Evidence page<span className="sr"> (opens in a new tab)</span></a>{b.notebook && <a className="small" href={b.notebook} target="_blank" rel="noopener noreferrer">Step-by-step notebook (Colab)<span className="sr"> (opens in a new tab)</span></a>}<Link className="small" to="/my-work">All my work</Link></div>
                      </div>
                    ))}
                    {reviewer
                      ? <CohortSummary task={task} rows={cohort} />
                      : reviewerRole
                        ? <p className="callout ok small">A learner hands in proof here: links, screenshots or files, what they learned and a 1 to 5 self-rating. Reviewers cannot hand in proof.</p>
                        : ready && <SubmitPanel taskKey={task} exists={keys ? keys.has(task) : undefined} listLoaded={listLoaded} />}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
