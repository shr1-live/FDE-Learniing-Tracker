import { useStore } from "../lib/store";
import { WEEK_DAYS, WEEK_TITLE, dayKey } from "../data/weekPlan";

const flags = (v: unknown, len: number): boolean[] => Array.from({ length: len }, (_, i) => Array.isArray(v) && v[i] === true);

export default function WeekPlan() {
  const { entries, setEntry } = useStore();
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
        <p className="muted">One task a day. Read what to study, build the practical task, then tick each point once it is true for your work. Build the tasks in their own project folder or repo with your own LLM key; this page only tracks your progress.</p></header>
      <div className="card"><h3>Week progress</h3><div className="meter" aria-label={`${pct} percent`}><i style={{ width: pct + "%" }} /></div><p className="muted small">{got} of {total} points done</p></div>
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
          </section>
        );
      })}
    </>
  );
}
