import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { canReview, useMe } from "../lib/useRole";
import { useStore } from "../lib/store";
import { API_URL } from "../lib/api";
import { mine, reviewList, Row } from "../lib/submissionsApi";
import { Progress } from "../components/Progress";
import { SubmitPanel } from "../components/SubmitPanel";
import { ExpectedList } from "../components/ExpectedList";
import { PROGRAMME, dayKey, getWeek, taskKey } from "../data/programme";

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
      {week.days.map((d) => {
        const f = flags(entries[dayKey(week.n, d.n)], d.done.length);
        const done = f.filter(Boolean).length;
        const task = taskKey(week.n, d.n);
        return (
          <section key={taskKey(week.n, d.n)} className="card" aria-labelledby={`wd${d.n}`}>
            <h2 id={`wd${d.n}`}>Day {d.n}: {d.title} <small>{done} of {d.done.length} done</small></h2>
            <p><b>Practical task.</b> {d.task}</p>
            <details><summary>What to study</summary>
              <ul className="plain">{d.topics.map((t) => <li key={t}>{t}</li>)}</ul></details>
            <details><summary>How to do it</summary>
              <ol className="plain">{d.how.map((t) => <li key={t}>{t}</li>)}</ol></details>
            <h3>Done when</h3>
            {d.done.map((t, i) => (
              <label key={t} className="check"><input type="checkbox" checked={f[i]} onChange={() => toggle(d.n, d.done.length, i)} /><span>{t}</span></label>
            ))}
            <ExpectedList week={week.n} day={d.n} />
            {reviewer
              ? <CohortSummary task={task} rows={cohort} />
              : ready && <SubmitPanel taskKey={task} exists={keys ? keys.has(task) : undefined} listLoaded={listLoaded} />}
          </section>
        );
      })}
    </>
  );
}
