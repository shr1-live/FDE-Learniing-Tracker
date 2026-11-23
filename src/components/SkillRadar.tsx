import { READINESS } from "../data/types";
import { useStore } from "../lib/store";

const num = (v: unknown) => (typeof v === "number" && v >= 1 && v <= 5 ? v : 0);

/** Day 1 against Day 10 for every skill as a radar chart, plus the skills to practise next (lowest first). */
export function SkillRadar() {
  const { entries } = useStore();
  const n = READINESS.length;
  const base = READINESS.map((_, i) => num(entries[`rate:base:${i}`]));
  const fin = READINESS.map((_, i) => num(entries[`rate:final:${i}`]));
  if (n < 3 || (!base.some(Boolean) && !fin.some(Boolean))) return null;
  const S = 260, c = S / 2, R = 92;
  const pt = (i: number, v: number) => { const a = -Math.PI / 2 + (i / n) * 2 * Math.PI; const r = (v / 5) * R; return [c + r * Math.cos(a), c + r * Math.sin(a)] as const; };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  const current = READINESS.map((r, i) => ({ skill: r.skill, v: fin[i] || base[i] || 0 })).filter((x) => x.v > 0).sort((a, b) => a.v - b.v).slice(0, 3);
  return (
    <section className="card radar" aria-labelledby="rad-h">
      <h2 id="rad-h">My skills, Day 1 and Day 10</h2>
      <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label={`Radar chart of ${n} skills. ${READINESS.map((r, i) => `${r.skill}: Day 1 ${base[i] || "not rated"}, Day 10 ${fin[i] || "not rated"}`).join("; ")}`}>
        {[1, 2, 3, 4, 5].map((k) => <polygon key={k} points={Array.from({ length: n }, (_, i) => pt(i, k).join(",")).join(" ")} fill="none" stroke="var(--border)" strokeWidth="1" />)}
        {READINESS.map((_, i) => { const [x, y] = pt(i, 5); return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />; })}
        <polygon points={poly(base)} fill="color-mix(in srgb, var(--text-2) 18%, transparent)" stroke="var(--text-2)" strokeWidth="1.5" strokeDasharray="4 3" />
        <polygon points={poly(fin)} fill="color-mix(in srgb, var(--accent) 26%, transparent)" stroke="var(--accent)" strokeWidth="2" />
        {READINESS.map((r, i) => { const [x, y] = pt(i, 5.9); return <text key={i} x={x} y={y} fontSize="8" textAnchor={x < c - 4 ? "end" : x > c + 4 ? "start" : "middle"} dominantBaseline="middle" fill="var(--text-2)">{i + 1}</text>; })}
      </svg>
      <p className="meta rd-legend"><span className="radar-key base" />Day 1 <span className="radar-key fin" />Day 10 · numbers are the skills in the table below</p>
      {current.length > 0 && <p><b>Practise next:</b> {current.map((x) => `${x.skill} (${x.v})`).join(" · ")}</p>}
    </section>
  );
}
