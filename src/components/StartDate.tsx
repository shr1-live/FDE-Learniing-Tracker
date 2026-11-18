import { useId } from "react";
import { useStore } from "../lib/store";
import { parseDay, startKey } from "../lib/backlog";

/** The learner's own start date for a week. With it, day N is due N-1 working days later and missed days are found for them. */
export function StartDate({ week, compact = false }: { week: number; compact?: boolean }) {
  const { entries, setEntry } = useStore();
  const id = useId();
  const raw = entries[startKey(week)];
  const value = typeof raw === "string" && parseDay(raw) ? raw : "";
  return (
    <div className={"startdate" + (compact ? " compact" : "")}>
      <label htmlFor={id}>I started week {week} on</label>
      <input id={id} type="date" value={value} onChange={(e) => setEntry(startKey(week), parseDay(e.target.value) ? e.target.value : "")} />
    </div>
  );
}
