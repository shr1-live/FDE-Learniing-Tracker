// Day 4: 30 fixed cases, scored automatically, with the checks switched on one set at a time. Reads src/data/runs/day4-*.json (written by the Evals tool).
type Row = {
  Model: string; Config: string; Prompt: string; CaseId: string; Category: string; Parsed: boolean; Pass: boolean; Reason: string; Fit: string;
  UnsupportedClaims: number; Obeyed: boolean; InstructionsFlagged: boolean;
};

const isRows = (v: unknown): v is Row[] =>
  Array.isArray(v) && v.length > 0 && v.every((r) => !!r && typeof r === "object" && typeof (r as Row).Config === "string" && typeof (r as Row).CaseId === "string" && typeof (r as Row).Pass === "boolean");

const RUNS = Object.entries(import.meta.glob("../data/runs/day4-*.json", { eager: true, import: "default" }) as Record<string, unknown>)
  .filter(([, rows]) => isRows(rows))
  .map(([path, rows]) => ({ id: path.split("/").pop()!.replace(".json", ""), rows: rows as Row[] }))
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

const CONFIGS: { id: string; label: string; what: string }[] = [
  { id: "baseline", label: "Before: no checks", what: "The model's answer as it came (prompt v2)." },
  { id: "existing", label: "Earlier checks", what: "Quotes must be real; a rating needs one real quote." },
  { id: "all-v2", label: "All checks", what: "Plus: orders hidden in a profile are ignored, and a top rating needs half of the job's skills." },
  { id: "final", label: "After: all checks + prompt v4", what: "What the API runs now." },
];
const CATEGORIES = ["normal", "incomplete", "ambiguous", "injection", "edge"];
const pct = (a: number, b: number) => (b === 0 ? "-" : `${Math.round((100 * a) / b)}%`);

export function Day4Results() {
  const run = RUNS[RUNS.length - 1];
  if (!run) return null;
  const models = [...new Set(run.rows.map((r) => r.Model))];
  return (
    <>
      <h2>Day 4: evaluation and guardrails, before and after</h2>
      <p className="muted">Thirty fixed cases (10 normal, 5 incomplete, 5 ambiguous, 5 with an order hidden in the profile, 5 odd inputs). The model answered each case once per prompt version; every row below applies its own checks to that same answer, so the difference comes from the checks, not from luck.</p>
      {models.map((m) => {
        const mine = run.rows.filter((r) => r.Model === m);
        const by = (id: string) => mine.filter((r) => r.Config === id);
        const base = by("baseline"), fin = by("final");
        const fixedIds = fin.filter((f) => f.Pass && !base.find((b) => b.CaseId === f.CaseId)?.Pass).map((f) => f.CaseId);
        const brokeIds = fin.filter((f) => !f.Pass && base.find((b) => b.CaseId === f.CaseId)?.Pass).map((f) => f.CaseId);
        const still = fin.filter((f) => !f.Pass);
        return (
          <section key={m} className="card" aria-labelledby={`d4-${m}`}>
            <h3 id={`d4-${m}`}>Model: {m}</h3>
            <div className="tablewrap" tabIndex={0} role="region" aria-label={`Day 4 results for ${m}, scrolls sideways on small screens`}>
              <table>
                <thead><tr><th>Configuration</th><th>Cases passed</th><th>Unsupported claims shown</th><th>Hidden order obeyed</th></tr></thead>
                <tbody>{CONFIGS.map((c) => {
                  const r = by(c.id); const inj = r.filter((x) => x.Category === "injection");
                  return <tr key={c.id}><td><b>{c.label}</b><br /><span className="muted small">{c.what}</span></td><td>{r.filter((x) => x.Pass).length}/{r.length} ({pct(r.filter((x) => x.Pass).length, r.length)})</td><td>{r.reduce((a, x) => a + x.UnsupportedClaims, 0)}</td><td>{inj.filter((x) => x.Obeyed).length}/{inj.length}</td></tr>;
                })}</tbody>
              </table>
            </div>
            <h4>Passed per category</h4>
            <div className="tablewrap" tabIndex={0} role="region" aria-label="Passed per category, scrolls sideways on small screens">
              <table>
                <thead><tr><th>Category</th>{CONFIGS.map((c) => <th key={c.id}>{c.label}</th>)}</tr></thead>
                <tbody>{CATEGORIES.map((cat) => (
                  <tr key={cat}><td>{cat}</td>{CONFIGS.map((c) => { const r = by(c.id).filter((x) => x.Category === cat); return <td key={c.id}>{r.filter((x) => x.Pass).length}/{r.length}</td>; })}</tr>
                ))}</tbody>
              </table>
            </div>
            <p><b>Fixed:</b> {fixedIds.length ? fixedIds.join(", ") : "none"}. <b>Got worse:</b> {brokeIds.length ? brokeIds.join(", ") : "none"}.</p>
            <h4>Failures that remain</h4>
            {still.length === 0 ? <p>None.</p> : (
              <ul className="plain">{still.map((f) => <li key={f.CaseId}><b>{f.CaseId}</b> ({f.Category}): {f.Reason || "failed"}</li>)}</ul>
            )}
          </section>
        );
      })}
      <p className="muted small">One run per prompt version on a small local model, so a pass is not a promise. The new checks were written after seeing earlier failures, so a fresh set of attacks is the real test. A hosted model has not been run yet.</p>
    </>
  );
}
