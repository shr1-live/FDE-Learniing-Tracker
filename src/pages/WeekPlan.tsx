import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { canReview, useMe } from "../lib/useRole";
import { useStore } from "../lib/store";
import { API_URL } from "../lib/api";
import { mine } from "../lib/submissionsApi";
import { Progress } from "../components/Progress";
import { SubmitPanel } from "../components/SubmitPanel";
import { ExpectedList } from "../components/ExpectedList";
import { reviewList, Row } from "../lib/submissionsApi";
import { WEEK_DAYS, WEEK_TITLE, dayKey } from "../data/weekPlan";

const flags = (v: unknown, len: number): boolean[] => Array.from({ length: len }, (_, i) => Array.isArray(v) && v[i] === true);

/** For reviewers: where learners stand on one day, with a way into the review queue. */
function CohortSummary({ taskKey, rows }: { taskKey: string; rows: Row[] }) {
  const mine = rows.filter((r) => r.task_key === taskKey);
  const n = (s: string) => mine.filter((r) => r.status === s).length;
  return (
    <div className="submitpanel">
      <h3>Learners on this day</h3>
      <p>{n("submitted")} waiting for review, {n("changes_requested")} sent back, {n("approved")} approved. <Link to="/review">Open Review submissions</Link></p>
    </div>
  );
}

export default function WeekPlan() {
  const { entries, setEntry } = useStore();
  const { me, ready } = useMe();
  const reviewer = me?.role === "reviewer"; // reviewers review; they do not submit
  const [cohort, setCohort] = useState<Row[]>([]);
  useEffect(() => { if (reviewer) reviewList("all").then(setCohort).catch(() => setCohort([])); }, [reviewer]);
  const [keys, setKeys] = useState<Set<string> | null>(null); // null = unknown: each panel asks the server itself
  const [listLoaded, setListLoaded] = useState(!API_URL);
  useEffect(() => {
    if (!API_URL) return;
    // Which days already have a submission. A person who is not signed in to the API simply has none.
    if (reviewer) { setListLoaded(true); return; } // a reviewer has no submissions of their own to look up
    mine().then((rows) => setKeys(new Set(rows.map((r) => r.task_key)))).catch(() => setKeys(null)).finally(() => setListLoaded(true));
  }, [reviewer]);
  const total = WEEK_DAYS.reduce((a, d) => a + d.done.length, 0);
  const got = WEEK_DAYS.reduce((a, d) => a + flags(entries[dayKey(d.n)], d.done.length).filter(Boolean).length, 0);
  const pct = total ? Math.round((got / total) * 100) : 0;
  const toggle = (n: number, len: number, i: number) => {
    const cur = flags(entries[dayKey(n)], len);
    cur[i] = !cur[i];
    setEntry(dayKey(n), cur);
  };

  return (
    <>
      <header className="ph"><h1>{WEEK_TITLE}</h1>
        <p className="muted">One task a day. Read what to study, build the practical task, then tick each point once it is true for your work. Build the tasks in their own project folder or repo with your own LLM key; ticking is your own check. When a day is done, submit your proof (a link, a screenshot or a file) under it so a reviewer can approve it.</p></header>
      {canReview(me) && (
        <div className="callout ok" role="note">
          {reviewer
            ? <><b>You are signed in as a reviewer.</b> Reviewers do not submit work. Under each day you can see where learners stand; to read their proof and give feedback, open <Link to="/review">Review submissions</Link>.</>
            : <><b>You are signed in as an admin.</b> You can submit your own work here too. To check other people's work, open <Link to="/review">Review submissions</Link>.</>}
        </div>
      )}
      <div className="card"><h3>Week progress</h3><Progress value={pct} label="Week progress" /><p className="muted small">{got} of {total} points done</p></div>
      {WEEK_DAYS.map((d) => {
        const f = flags(entries[dayKey(d.n)], d.done.length);
        const n = f.filter(Boolean).length;
        return (
          <section key={d.n} className="card" aria-labelledby={`wd${d.n}`}>
            <h2 id={`wd${d.n}`}>Day {d.n}: {d.title} <small>{n} of {d.done.length} done</small></h2>
            <p><b>Practical task.</b> {d.task}</p>
            <details><summary>What to study</summary>
              <ul className="plain">{d.topics.map((t) => <li key={t}>{t}</li>)}</ul></details>
            <details><summary>How to do it</summary>
              <ol className="plain">{d.how.map((t) => <li key={t}>{t}</li>)}</ol></details>
            <h3>Done when</h3>
            {d.done.map((t, i) => (
              <label key={t} className="check"><input type="checkbox" checked={f[i]} onChange={() => toggle(d.n, d.done.length, i)} /><span>{t}</span></label>
            ))}
            <ExpectedList day={d.n} />
            {reviewer
              ? <CohortSummary taskKey={`week1-day${d.n}`} rows={cohort} />
              : ready && <SubmitPanel taskKey={`week1-day${d.n}`} exists={keys ? keys.has(`week1-day${d.n}`) : undefined} listLoaded={listLoaded} />}
          </section>
        );
      })}
    </>
  );
}
