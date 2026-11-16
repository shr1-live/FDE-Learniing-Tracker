import { DELIVERY, WEEK1_STATUS } from "../data/week1Status";
import raw from "../data/day1-results.json";

type Row = { Model: string; CaseId: string; Kind: string; Passed: boolean; Answer: string; LatencyMs: number; InputTokens: number; OutputTokens: number; Error: string | null };
const rows = raw as Row[];
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0; };

export default function Week1Report() {
  const total = WEEK1_STATUS.reduce((a, d) => a + d.criteria.length, 0);
  const done = WEEK1_STATUS.reduce((a, d) => a + d.criteria.filter((c) => c.done).length, 0);
  const pct = Math.round((done / total) * 100);

  const models = [...new Set(rows.map((r) => r.Model))];
  const cases = [...new Set(rows.map((r) => r.CaseId))];
  const stats = models.map((m) => {
    const mine = rows.filter((r) => r.Model === m); const ok = mine.filter((r) => !r.Error);
    return { m, passed: mine.filter((r) => r.Passed).length, n: mine.length, errors: mine.length - ok.length, med: median(ok.map((r) => r.LatencyMs)), tin: mine.reduce((a, r) => a + r.InputTokens, 0), tout: mine.reduce((a, r) => a + r.OutputTokens, 0) };
  });
  // Same rule as the report tool: models with errors are ruled out first, then most passes, then lower median latency.
  const pool = stats.some((s) => s.errors === 0) ? stats.filter((s) => s.errors === 0) : stats;
  const best = [...pool].sort((a, b) => b.passed - a.passed || a.med - b.med)[0];
  const failed = rows.filter((r) => !r.Passed);

  return (
    <>
      <header className="ph"><h1>Week 1 report</h1>
        <p className="muted">Where the Week 1 project work stands against each acceptance criterion, plus the Day 1 model comparison. "Done" means built and checked on its branch; delivery to the live site is listed separately.</p></header>

      <div className="card"><h3>Criteria met</h3>
        <div className="meter" aria-label={`${pct} percent`}><i style={{ width: pct + "%" }} /></div>
        <p className="muted small">{done} of {total} criteria met ({pct}%)</p></div>

      <h2>Status by day</h2>
      {WEEK1_STATUS.map((d) => {
        const n = d.criteria.filter((c) => c.done).length;
        const state = n === d.criteria.length ? "done" : n === 0 ? "not started" : "in progress";
        return (
          <section key={d.n} className="card" aria-labelledby={`r${d.n}`}>
            <h3 id={`r${d.n}`}>Day {d.n}: {d.title} <span className={"tag " + (state === "done" ? "done" : "st-pending")}>{state}</span> <small>{n} of {d.criteria.length}</small></h3>
            <ul className="plain">
              {d.criteria.map((c) => (
                <li key={c.text}>{c.done ? "Done" : "To do"}: {c.text}{!c.done && c.ticket ? <span className="muted small"> (ticket {c.ticket})</span> : null}</li>
              ))}
            </ul>
          </section>
        );
      })}

      <h2>Delivery</h2>
      <div className="card"><ul className="plain">{DELIVERY.map((x) => <li key={x.text}><b>{x.text}</b>: {x.state}</li>)}</ul></div>

      <h2>Day 1: model comparison</h2>
      <p className="muted">The same {cases.length} prompts, system prompt and settings for each model, scored by simple repeatable rules. Both models ran on a local computer through Ollama.</p>
      <div className="tablewrap"><table>
        <thead><tr><th>Model</th><th>Passed</th><th>Errors</th><th>Median time</th><th>Input tokens</th><th>Output tokens</th></tr></thead>
        <tbody>{stats.map((s) => (<tr key={s.m}><td>{s.m}</td><td>{s.passed} of {s.n}</td><td>{s.errors}</td><td>{(s.med / 1000).toFixed(1)} s</td><td>{s.tin}</td><td>{s.tout}</td></tr>))}</tbody>
      </table></div>

      <div className="tablewrap" style={{ marginTop: 16 }}><table>
        <thead><tr><th>Prompt</th><th>Kind</th>{models.map((m) => <th key={m}>{m}</th>)}</tr></thead>
        <tbody>{cases.map((c) => (
          <tr key={c}><td>{c}</td><td>{rows.find((r) => r.CaseId === c)?.Kind}</td>
            {models.map((m) => { const r = rows.find((x) => x.Model === m && x.CaseId === c); return <td key={m}>{!r ? "-" : r.Error ? "error" : r.Passed ? "pass" : "FAIL"}</td>; })}</tr>
        ))}</tbody>
      </table></div>

      {failed.length > 0 && <div className="card"><h3>Failed answers</h3>
        <ul className="plain">{failed.map((f) => <li key={f.Model + f.CaseId}><b>{f.Model} / {f.CaseId}</b>: {f.Error ?? f.Answer}</li>)}</ul></div>}

      {best && <div className="card"><h3>Recommendation</h3>
        <p>Use <b>{best.m}</b>. It passed {best.passed} of {best.n} prompts with a median time of {(best.med / 1000).toFixed(1)} s{stats.filter((s) => s.m !== best.m).map((o) => `, against ${o.m} at ${o.passed} of ${o.n} and ${(o.med / 1000).toFixed(1)} s`).join("")}.</p>
        <p className="muted small">Why: answer quality comes first because a wrong answer costs more than a slow one; speed breaks ties; a model with errors is ruled out first. Limits: 10 prompts is a small sample and the checks are simple keyword rules. The first call to each model includes loading it, and a hosted model will differ in speed and cost. One answer ("not specified in the given information") may be a fair refusal that the accepted phrases missed; the rules were not changed after seeing the results.</p></div>}
    </>
  );
}
