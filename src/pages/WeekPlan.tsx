import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { canReview, useMe } from "../lib/useRole";
import { useStore } from "../lib/store";
import { API_URL } from "../lib/api";
import { mine, reviewList, Row } from "../lib/submissionsApi";
import { Progress } from "../components/Progress";
import { SubmitPanel } from "../components/SubmitPanel";
import { ExpectedList } from "../components/ExpectedList";
import { PROGRAMME, dayKey, getWeek, taskKey } from "../data/programme";
import { notesFor, notesPath } from "../data/studyNotes";
import { useWork } from "../lib/work";
import { dayStatus, fmtDate } from "../lib/backlog";
import { Chip } from "../components/Chip";
import { StartDate } from "../components/StartDate";
import { StudyNote } from "../components/StudyNote";
import { Icon } from "../components/Icon";

const flags = (v: unknown, len: number): boolean[] => Array.from({ length: len }, (_, i) => Array.isArray(v) && v[i] === true);

/** For reviewers: where learners stand on one day, with a way into the review queue. */
function CohortSummary({ task, rows }: { task: string; rows: Row[] }) {
  const here = rows.filter((r) => r.task_key === task);
  const n = (s: string) => here.filter((r) => r.status === s).length;
  return (
    <div className="submitpanel">
      <h3>Learners on this day</h3>
      <p>{n("submitted")} waiting for review, {n("changes_requested")} sent back, {n("approved")} approved. <Link to="/review">Open Review submissions</Link></p>
    </div>
  );
}

/** One week of the programme, read from the registry: any registered week works at /week/<number>. */
export default function WeekPlan() {
  const { n } = useParams();
  const week = getWeek(Number(n));
  const { entries, setEntry } = useStore();
  const { me, ready } = useMe();
  const work = useWork();
  const { hash } = useLocation();
  const reviewer = me?.role === "reviewer"; // reviewers review; they do not submit
  const [cohort, setCohort] = useState<Row[]>([]);
  const [keys, setKeys] = useState<Set<string> | null>(null); // null = unknown: each panel asks the server itself
  const [listLoaded, setListLoaded] = useState(!API_URL);

  useEffect(() => { if (reviewer) reviewList("all").then(setCohort).catch(() => setCohort([])); }, [reviewer]);
  useEffect(() => {
    if (!API_URL) return;
    if (reviewer) { setListLoaded(true); return; } // a reviewer has no submissions of their own to look up
    // Which days already have a submission. A person who is not signed in to the API simply has none.
    mine().then((rows) => setKeys(new Set(rows.map((r) => r.task_key)))).catch(() => setKeys(null)).finally(() => setListLoaded(true));
  }, [reviewer]);

  // a link such as /week/1#wd3 scrolls to that day once the page is drawn
  // (once now, and once more after the panels have laid out)
  useEffect(() => {
    if (!hash) return;
    const go = () => document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
    go();
    const t = window.setTimeout(go, 250);
    return () => window.clearTimeout(t);
  }, [hash, n]);

  if (!week) {
    return (
      <>
        <header className="ph"><h1>Week not found</h1></header>
        <div className="card"><p>There is no week {n} in the programme yet.</p>
          <p>{PROGRAMME.map((w) => <span key={w.n}><Link to={`/week/${w.n}`}>Week {w.n}</Link>{" "}</span>)}</p></div>
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
  };

  return (
    <>
      <header className="ph"><h1>{week.title}</h1>
        <p className="muted">One task a day. Read what to study, build the practical task, then tick each point once it is true for your work. Build the tasks in their own project folder or repo with your own LLM key; ticking is your own check. When a day is done, submit your proof (a link, a screenshot or a file) under it so a reviewer can approve it.</p></header>
      {canReview(me) && (
        <div className="callout ok" role="note">
          {reviewer
            ? <><b>You are signed in as a reviewer.</b> Reviewers do not submit work. Under each day you can see where learners stand; to read their proof and give feedback, open <Link to="/review">Review submissions</Link>.</>
            : <><b>You are signed in as an admin.</b> You can submit your own work here too. To check other people's work, open <Link to="/review">Review submissions</Link>.</>}
        </div>
      )}
      <div className="card"><h3>Week progress</h3><Progress value={pct} label="Week progress" /><p className="muted small">{got} of {total} points done</p></div>
      {!reviewer && (
        <div className="card weekmeta">
          <StartDate week={week.n} />
          {work.missed.filter((m) => m.week.n === week.n).length > 0 && (
            <p className="callout warn" role="note"><Icon name="alert" /> <b>You are behind on {work.missed.filter((m) => m.week.n === week.n).length} day{work.missed.filter((m) => m.week.n === week.n).length === 1 ? "" : "s"}.</b> <Link to="/backlog">Open the backlog</Link> to see what is missing and read a short summary.</p>
          )}
        </div>
      )}
      {week.days.map((d) => {
        const f = flags(entries[dayKey(week.n, d.n)], d.done.length);
        const done = f.filter(Boolean).length;
        const task = taskKey(week.n, d.n);
        const state = work.weeks.find((x) => x.week.n === week.n)?.states.find((x) => x.day.n === d.n);
        const st = state ? dayStatus(state, work.now) : null;
        const notes = notesFor(week.n, d.n);
        return (
          <section key={task} id={`wd${d.n}`} className="card dayc" aria-labelledby={`wd${d.n}-h`}>
            <div className="dayc-head">
              <h2 id={`wd${d.n}-h`}>Day {d.n}: {d.title}</h2>
              {!reviewer && st && <div className="row tight"><Chip tone={st.tone}>{st.label}</Chip>{state?.due && <span className="muted small tnum">due {fmtDate(state.due)}</span>}<span className="muted small tnum">{done} of {d.done.length} points</span></div>}
            </div>

            <div className="panel theory" aria-labelledby={`th${d.n}`}>
              <h3 id={`th${d.n}`}><Icon name="book" /> Theory: what to learn</h3>
              {d.summary && <p>{d.summary}</p>}
              {d.keyIdeas && <ul className="plain">{d.keyIdeas.map((k) => <li key={k}>{k}</li>)}</ul>}
              {notes
                ? (
                  <>
                    <p className="muted small">Open a topic for a plain-English explanation, an example and where to read more.</p>
                    <div className="stackcards tight">{notes.notes.map((n, i) => <StudyNote key={n.topic} note={n} collapsible id={`d${d.n}t${i + 1}`} />)}</div>
                    <p className="small"><Link to={notesPath(week.n, d.n)}>All study notes for Day {d.n}</Link></p>
                  </>
                )
                : <details><summary>What to study</summary><ul className="plain">{d.topics.map((t) => <li key={t}>{t}</li>)}</ul></details>}
            </div>

            <div className="panel practical" aria-labelledby={`pr${d.n}`}>
              <h3 id={`pr${d.n}`}><Icon name="tasks" /> Practical: what to build</h3>
              <p>{d.task}</p>
              <details><summary>How to do it</summary>
                <ol className="plain">{d.how.map((t) => <li key={t}>{t}</li>)}</ol></details>
              <h4>Done when</h4>
              {d.done.map((t, i) => (
                <label key={t} className="check"><input type="checkbox" checked={f[i]} onChange={() => toggle(d.n, d.done.length, i)} /><span>{t}</span></label>
              ))}
              <ExpectedList week={week.n} day={d.n} />
              {reviewer
                ? <CohortSummary task={task} rows={cohort} />
                : ready && <SubmitPanel taskKey={task} exists={keys ? keys.has(task) : undefined} listLoaded={listLoaded} />}
            </div>
          </section>
        );
      })}
    </>
  );
}
