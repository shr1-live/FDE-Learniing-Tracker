import { useEffect, useState } from "react";
import { getWeek } from "../data/programme";

/**
 * A reviewer's checklist for one day: each acceptance point is Met or Not met. The score ("4 of 6 met") is shown, and
 * "Add unmet points to the comment" writes the unmet ones into the comment box, ready to edit and send back.
 */
export function Rubric({ week, day, resetKey, onUnmet }: { week: number; day: number; resetKey: string; onUnmet: (lines: string[]) => void }) {
  const points = getWeek(week)?.days.find((d) => d.n === day)?.done ?? [];
  const [met, setMet] = useState<Record<number, boolean>>({});
  useEffect(() => setMet({}), [resetKey]);
  if (points.length === 0) return null;
  const n = points.filter((_, i) => met[i]).length;
  return (
    <fieldset className="rubric">
      <legend><b>Checklist</b> <span className="meta">{n} of {points.length} met</span></legend>
      <ul className="plain">
        {points.map((p, i) => (
          <li key={i}><label className="check-row"><input type="checkbox" checked={!!met[i]} onChange={() => setMet((m) => ({ ...m, [i]: !m[i] }))} /><span>{p}</span></label></li>
        ))}
      </ul>
      <button type="button" className="fchip" onClick={() => onUnmet(points.filter((_, i) => !met[i]).map((p) => `Not met: ${p}`))} disabled={n === points.length}>Add unmet points to the comment</button>
    </fieldset>
  );
}
