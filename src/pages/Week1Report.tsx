import { useMemo, useState } from "react";
import { DELIVERY, WEEK1_STATUS } from "../data/week1Status";
import { DAY_EXPLAIN, ONE_MINUTE } from "../data/week1Explain";
import { Icon, IconName } from "../components/Icon";

type Row = { Model: string; CaseId: string; Kind: string; Passed: boolean; Answer: string; LatencyMs: number; InputTokens: number; OutputTokens: number; Error: string | null };

// Every file in src/data/runs is one evaluation run (written by the Evals tool). Drop a new file in and it appears here.
const RUNS = Object.entries(import.meta.glob("../data/runs/*.json", { eager: true, import: "default" }) as Record<string, Row[]>)
  .map(([path, rows]) => ({ id: path.split("/").pop()!.replace(".json", ""), rows }))
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })); // day2 before day10
const runLabel = (id: string) => { const m = /^day(\d+)-(.*)$/.exec(id); return m ? `Day ${m[1]} · ${m[2]}` : id; };

function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  if (s.length === 0) return 0;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
const dayState = (done: number, total: number) => {
  if (done === total) return "done";
  return done === 0 ? "not started" : "in progress";
};
const cellText = (r: Row | undefined) => {
  if (!r) return "-";
  if (r.Error) return "error";
  return r.Passed ? "pass" : "FAIL";
};

function Kpi({ icon, label, value, sub }: { icon: IconName; label: string; value: string; sub: string }) {
  return (
    <div className="kpi"><div className="kh"><Icon name={icon} />{label}</div><div className="kv">{value}</div><div className="ks">{sub}</div></div>
  );
}

export default function Week1Report() {
  const [runId, setRunId] = useState(RUNS[RUNS.length - 1]?.id ?? "");
  const [picked, setPicked] = useState<string[] | null>(null);
  const rows = useMemo(() => RUNS.find((r) => r.id === runId)?.rows ?? [], [runId]);

  const total = WEEK1_STATUS.reduce((a, d) => a + d.criteria.length, 0);
  const done = WEEK1_STATUS.reduce((a, d) => a + d.criteria.filter((c) => c.done).length, 0);
  const daysDone = WEEK1_STATUS.filter((d) => d.criteria.every((c) => c.done)).length;
  const pct = Math.round((done / total) * 100);

  const allModels = [...new Set(rows.map((r) => r.Model))];
  const models = (picked ?? allModels).filter((m) => allModels.includes(m));
  const cases = [...new Set(rows.map((r) => r.CaseId))];
  const shown = rows.filter((r) => models.includes(r.Model));
  const stats = models.map((m) => {
    const mine = shown.filter((r) => r.Model === m); const ok = mine.filter((r) => !r.Error);
    return { m, passed: mine.filter((r) => r.Passed).length, n: mine.length, errors: mine.length - ok.length, med: median(ok.map((r) => r.LatencyMs)), tin: mine.reduce((a, r) => a + r.InputTokens, 0), tout: mine.reduce((a, r) => a + r.OutputTokens, 0) };
  });
  // Same rule as the Evals tool: models with errors are ruled out first, then most passes, then lower median time.
  const pool = stats.some((s) => s.errors === 0) ? stats.filter((s) => s.errors === 0) : stats;
  const best = [...pool].sort((a, b) => b.passed - a.passed || a.med - b.med)[0];
  const fastest = [...stats.filter((s) => s.errors < s.n)].sort((a, b) => a.med - b.med)[0];
  const failed = shown.filter((r) => !r.Passed);
  const tokens = stats.reduce((a, s) => a + s.tin + s.tout, 0);
  const errors = stats.reduce((a, s) => a + s.errors, 0);
  const toggle = (m: string) => setPicked(models.includes(m) ? models.filter((x) => x !== m) : [...models, m]);

  return (
    <>
      <header className="ph"><h1>Week 1 report</h1>
        <p className="muted">What was built, what is proven, and what is still to do, against each acceptance criterion, plus a model comparison you can filter. "Done" means built and checked on its branch; delivery to the live site is listed separately.</p></header>

      <div className="kpis" aria-label="Programme summary">
        <Kpi icon="target" label="Criteria met" value={`${pct}%`} sub={`${done} of ${total} acceptance criteria`} />
        <Kpi icon="trend" label="Days complete" value={`${daysDone} of ${WEEK1_STATUS.length}`} sub="every criterion for the day met" />
        <Kpi icon="chip" label="Models compared" value={String(allModels.length)} sub={runId ? runLabel(runId) : "no run yet"} />
        <Kpi icon="list" label="Prompts per run" value={String(cases.length)} sub="same questions for every model" />
      </div>

      <h2>In one minute</h2>
      <div className="card"><ul className="plain">{ONE_MINUTE.map((t) => <li key={t}>{t}</li>)}</ul></div>

      <h2>Status by day</h2>
      {WEEK1_STATUS.map((d) => {
        const n = d.criteria.filter((c) => c.done).length;
        const state = dayState(n, d.criteria.length);
        const ex = DAY_EXPLAIN.find((e) => e.n === d.n);
        return (
          <section key={d.n} className="card" aria-labelledby={`r${d.n}`}>
            <h3 id={`r${d.n}`}>Day {d.n}: {d.title} <span className={"tag " + (state === "done" ? "done" : "st-pending")}>{state}</span> <small>{n} of {d.criteria.length}</small></h3>
            <ul className="plain">
              {d.criteria.map((c) => (
                <li key={c.text}>{c.done ? "Done" : "To do"}: {c.text}{!c.done && c.ticket ? <span className="muted small"> (ticket {c.ticket})</span> : null}</li>
              ))}
            </ul>
            {ex && (
              <details><summary>What was done, in plain words</summary>
                <dl className="kv">
                  <div><dt>What we built</dt><dd>{ex.built}</dd></div>
                  <div><dt>How it works</dt><dd>{ex.how}</dd></div>
                  <div><dt>What proves it</dt><dd>{ex.proof}</dd></div>
                  <div><dt>Not done yet</dt><dd>{ex.notYet}</dd></div>
                </dl>
              </details>
            )}
          </section>
        );
      })}

      <h2>Delivery</h2>
      <div className="card"><ul className="plain">{DELIVERY.map((x) => <li key={x.text}><b>{x.text}</b>: {x.state}</li>)}</ul></div>

      <h2>Model comparison</h2>
      {RUNS.length === 0 ? <div className="card"><p className="muted">No evaluation run yet. Run the Evals tool in the backend repo and copy its results file into src/data/runs.</p></div> : (
        <>
          <p className="muted">The same prompts, system prompt and settings for every model, scored by simple repeatable rules. Any model or provider can be added in the backend's <code>evals/targets.json</code>; results files placed in <code>src/data/runs</code> show up in the run list below.</p>
          <div className="card">
            <label htmlFor="run">Run</label>
            <select id="run" value={runId} onChange={(e) => { setRunId(e.target.value); setPicked(null); }}>{RUNS.map((r) => <option key={r.id} value={r.id}>{runLabel(r.id)}</option>)}</select>
            <fieldset className="pick"><legend className="small muted">Models to show</legend>
              {allModels.map((m) => <label key={m} className="check"><input type="checkbox" checked={models.includes(m)} onChange={() => toggle(m)} /><span>{m}</span></label>)}
            </fieldset>
          </div>

          {stats.length === 0 ? <div className="card"><p className="muted">Pick at least one model.</p></div> : (
            <>
              <div className="kpis" aria-label="Comparison summary">
                {best && <Kpi icon="check" label="Best answers" value={best.m} sub={`${best.passed} of ${best.n} passed (${Math.round((best.passed / best.n) * 100)}%)`} />}
                {fastest && <Kpi icon="clock" label="Fastest typical answer" value={`${(fastest.med / 1000).toFixed(1)} s`} sub={`${fastest.m}, median`} />}
                <Kpi icon="layers" label="Tokens used" value={tokens.toLocaleString()} sub="input plus output, all shown models" />
                <Kpi icon="alert" label="Failed calls" value={String(errors)} sub="timeouts or provider errors" />
              </div>

              <div className="tablewrap"><table>
                <thead><tr><th>Model</th><th>Passed</th><th>Errors</th><th>Median time</th><th>Input tokens</th><th>Output tokens</th></tr></thead>
                <tbody>{stats.map((s) => (<tr key={s.m}><td>{s.m}</td><td>{s.passed} of {s.n}</td><td>{s.errors}</td><td>{(s.med / 1000).toFixed(1)} s</td><td>{s.tin}</td><td>{s.tout}</td></tr>))}</tbody>
              </table></div>

              <div className="tablewrap gap"><table>
                <thead><tr><th>Prompt</th><th>Kind</th>{models.map((m) => <th key={m}>{m}</th>)}</tr></thead>
                <tbody>{cases.map((c) => (
                  <tr key={c}><td>{c}</td><td>{rows.find((r) => r.CaseId === c)?.Kind}</td>
                    {models.map((m) => { const r = shown.find((x) => x.Model === m && x.CaseId === c); return <td key={m}>{cellText(r)}</td>; })}</tr>
                ))}</tbody>
              </table></div>

              {failed.length > 0 && <div className="card"><h3>Failed answers</h3>
                <ul className="plain">{failed.map((f) => <li key={f.Model + f.CaseId}><b>{f.Model} / {f.CaseId}</b>: {f.Error ?? f.Answer}</li>)}</ul></div>}

              {best && <div className="card"><h3>Recommendation</h3>
                <p>Use <b>{best.m}</b>. It passed {best.passed} of {best.n} prompts with a median time of {(best.med / 1000).toFixed(1)} s{stats.filter((s) => s.m !== best.m).map((o) => `, against ${o.m} at ${o.passed} of ${o.n} and ${(o.med / 1000).toFixed(1)} s`).join("")}.</p>
                <p className="muted small">Why: answer quality comes first because a wrong answer costs more than a slow one; speed breaks ties; a model with errors is ruled out first. Limits: a small sample scored by simple keyword rules. The first call to each model includes loading it, and speed and cost depend on where a model runs. A fair refusal can be marked wrong when its wording is not in the accepted list; rules were not changed after seeing results.</p></div>}
            </>
          )}
        </>
      )}
    </>
  );
}
