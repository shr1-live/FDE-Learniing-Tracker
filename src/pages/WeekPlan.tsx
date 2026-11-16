import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { canReview, useMe } from "../lib/useRole";
import { useStore } from "../lib/store";
import { API_URL } from "../lib/api";
import { mine } from "../lib/submissionsApi";
import { Progress } from "../components/Progress";
import { SubmitPanel } from "../components/SubmitPanel";
import { WEEK_DAYS, WEEK_TITLE, dayKey } from "../data/weekPlan";

const flags = (v: unknown, len: number): boolean[] => Array.from({ length: len }, (_, i) => Array.isArray(v) && v[i] === true);

export default function WeekPlan() {
  const { entries, setEntry } = useStore();
  const { me } = useMe();
  const [keys, setKeys] = useState<Set<string> | null>(null); // null = unknown: each panel asks the server itself
  const [listLoaded, setListLoaded] = useState(!API_URL);
  useEffect(() => {
    if (!API_URL) return;
    // Which days already have a submission. A person who is not signed in to the API simply has none.
    mine().then((rows) => setKeys(new Set(rows.map((r) => r.task_key)))).catch(() => setKeys(null)).finally(() => setListLoaded(true));
  }, []);
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
          <b>You are signed in as {me?.role === "admin" ? "an admin" : "a reviewer"}.</b> The proof panels below show <i>your own</i> work. To check other people's work, open <Link to="/review">Review submissions</Link>.
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
            <SubmitPanel taskKey={`week1-day${d.n}`} exists={keys ? keys.has(`week1-day${d.n}`) : undefined} listLoaded={listLoaded} />
          </section>
        );
      })}
    </>
  );
}
