import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useMe } from "../lib/useRole";
import { useStore } from "../lib/store";
import { API_URL } from "../lib/api";
import { mine } from "../lib/submissionsApi";
import { SubmitPanel } from "../components/SubmitPanel";
import { StudyNote } from "../components/StudyNote";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { Progress } from "../components/Progress";
import { EmptyState } from "../components/States";
import { DEVOPS_NOTES, DEVOPS_WEEKS, devopsDayKey, devopsTaskKey, getDevopsWeek } from "../data/devops";

const flags = (v: unknown, len: number): boolean[] => Array.from({ length: len }, (_, i) => Array.isArray(v) && v[i] === true);

/** One week of the DevOps study program. Separate from the FDE programme: its own keys, its own totals. */
export default function Devops() {
  const { n } = useParams();
  const week = getDevopsWeek(Number(n));
  const { entries, setEntry } = useStore();
  const { me, ready } = useMe();
  const { hash } = useLocation();
  const reviewerRole = me?.role === "reviewer";
  const [keys, setKeys] = useState<Set<string> | null>(null);
  const [listLoaded, setListLoaded] = useState(!API_URL);
  const hashDay = /^#wd(\d+)$/.exec(hash)?.[1];
  const [open, setOpen] = useState<Set<number>>(() => new Set(hashDay ? [Number(hashDay)] : [1]));

  useEffect(() => {
    if (!API_URL) return;
    if (reviewerRole) { setListLoaded(true); return; }
    mine().then((rows) => setKeys(new Set(rows.map((r) => r.task_key)))).catch(() => setKeys(null)).finally(() => setListLoaded(true));
  }, [reviewerRole]);
  useEffect(() => { if (hashDay) setOpen((s) => (s.has(Number(hashDay)) ? s : new Set(s).add(Number(hashDay)))); }, [hashDay]);
  useEffect(() => { setOpen(new Set(hashDay ? [Number(hashDay)] : [1])); }, [n]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!n) return <Navigate to="/devops/week/1" replace />;
  if (!week) {
    return (
      <>
        <PageHeader overline="DevOps" title="Week not found" />
        <EmptyState icon="book" title={`There is no DevOps week ${n}`} action={<div className="row center">{DEVOPS_WEEKS.map((w) => <Link key={w.n} className="btn secondary" to={`/devops/week/${w.n}`}>Week {w.n}</Link>)}</div>}>Pick one of the weeks.</EmptyState>
      </>
    );
  }

  const total = week.days.reduce((a, d) => a + d.done.length, 0);
  const got = week.days.reduce((a, d) => a + flags(entries[devopsDayKey(week.n, d.n)], d.done.length).filter(Boolean).length, 0);
  const pct = total ? Math.round((got / total) * 100) : 0;
  const toggle = (day: number, len: number, i: number) => {
    const cur = flags(entries[devopsDayKey(week.n, day)], len);
    cur[i] = !cur[i];
    setEntry(devopsDayKey(week.n, day), cur);
  };
  const flip = (d: number) => setOpen((s) => { const x = new Set(s); if (x.has(d)) x.delete(d); else x.add(d); return x; });
  const allOpen = open.size === week.days.length;

  return (
    <>
      <PageHeader overline="DevOps program" title={`DevOps, Week ${week.n}`} sub={week.title} />
      <nav className="weeksw" aria-label="DevOps weeks">{DEVOPS_WEEKS.map((w) => <Link key={w.n} to={`/devops/week/${w.n}`} aria-current={w.n === week.n ? "page" : undefined}>{w.n === 5 ? "Capstone" : `Week ${w.n}`}</Link>)}</nav>
      <p className="callout ok weekbar-note" role="note">A separate study track next to the FDE programme: its progress is counted on its own and does not change your FDE numbers. The day-by-day split is a first version made from the DevOps plan document.</p>

      <section className="card weekbar" aria-labelledby="dw-h">
        <div className="grow">
          <h2 id="dw-h" style={{ fontSize: "var(--fs-lg)" }}>Week progress</h2>
          <p className="meta tnum">{got} of {total} points done &middot; {pct}%</p>
          <Progress value={pct} label="DevOps week progress" />
        </div>
        <button type="button" className="btn secondary" aria-pressed={allOpen} onClick={() => setOpen(allOpen ? new Set() : new Set(week.days.map((d) => d.n)))}>
          <Icon name="layers" size={16} />{allOpen ? "Fold all days" : "Open all days"}
        </button>
      </section>

      <div className="daylist">
        {week.days.map((d) => {
          const f = flags(entries[devopsDayKey(week.n, d.n)], d.done.length);
          const done = f.filter(Boolean).length;
          const task = devopsTaskKey(week.n, d.n);
          const notes = DEVOPS_NOTES[week.n]?.find((x) => x.day === d.n);
          const isOpen = open.has(d.n);
          return (
            <section key={task} id={`wd${d.n}`} className={"card daycard" + (isOpen ? " open" : "")} aria-labelledby={`wd${d.n}-h`}>
              <h2 id={`wd${d.n}-h`} style={{ fontSize: "inherit" }}>
                <button type="button" className="daycard-head" aria-expanded={isOpen} aria-controls={`wd${d.n}-body`} onClick={() => flip(d.n)}>
                  <span className={"daynum " + (done === d.done.length ? "done" : "")} aria-hidden="true">{done === d.done.length ? <Icon name="check" size={20} /> : d.n}</span>
                  <span className="daytitle">
                    <b><span className="sr">Day {d.n}: </span>{d.title}</b>
                    <span className="meta tnum"><span>Day {d.n}</span><span>{done} of {d.done.length} points</span></span>
                  </span>
                  <span className="daychips"><span className="daymini">{done}/{d.done.length}</span></span>
                  <span className="daychev"><Icon name="down" size={18} /></span>
                </button>
              </h2>
              <div id={`wd${d.n}-body`} className="daycard-body" hidden={!isOpen}>
                <div className="daycols two-col">
                  <div className="panel theory" aria-labelledby={`th${d.n}`}>
                    <h3 id={`th${d.n}`}><span className="pi"><Icon name="book" size={16} /></span>Theory: what to learn</h3>
                    {notes ? (
                      <>
                        <p>{notes.intro}</p>
                        <p className="muted small">Open a topic for a plain-English explanation, an example and where to read more.</p>
                        <div className="stackcards tight" style={{ marginTop: "var(--s-2)" }}>{notes.notes.map((nt, i) => <StudyNote key={nt.topic} note={nt} collapsible id={`d${d.n}t${i + 1}`} />)}</div>
                      </>
                    ) : <ul className="plain">{d.topics.map((t) => <li key={t}>{t}</li>)}</ul>}
                  </div>
                  <div className="panel practical" aria-labelledby={`pr${d.n}`}>
                    <h3 id={`pr${d.n}`}><span className="pi"><Icon name="tasks" size={16} /></span>Practical: what to build</h3>
                    <p>{d.task}</p>
                    <p className="muted small">{d.resources}</p>
                    <h4>Done when</h4>
                    {d.done.map((t, i) => (
                      <label key={t} className="check"><input type="checkbox" checked={f[i]} onChange={() => toggle(d.n, d.done.length, i)} /><span>{t}</span></label>
                    ))}
                    {reviewerRole
                      ? <p className="callout ok small">A learner hands in proof here. Reviewers decide on it in <Link to="/review">Review</Link>.</p>
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
