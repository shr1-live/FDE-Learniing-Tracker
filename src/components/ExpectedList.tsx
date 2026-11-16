import { WEEK_DAYS } from "../data/weekPlan";
import { EXPECT, RATING_GUIDE } from "../data/weekExpect";

/** What each acceptance point means, and what proof to attach: the standard a learner works to and a reviewer checks against. */
export function ExpectedList({ day, open = false }: { day: number; open?: boolean }) {
  const d = WEEK_DAYS.find((x) => x.n === day);
  const e = EXPECT[day];
  if (!d || !e) return null;
  return (
    <details open={open}>
      <summary>What is expected for each point, and what proof to attach</summary>
      <p className="muted">{e.goal}</p>
      <dl className="kv">
        {d.done.map((point, i) => (
          <div key={point}>
            <dt>{point}</dt>
            <dd>{e.items[i]?.means}<br /><b>Proof to attach:</b> {e.items[i]?.proof}</dd>
          </div>
        ))}
      </dl>
      <p className="muted small"><b>How to rate yourself (1 to 5):</b> {RATING_GUIDE.map(([n, t]) => `${n} = ${t}`).join(" ")}</p>
    </details>
  );
}
