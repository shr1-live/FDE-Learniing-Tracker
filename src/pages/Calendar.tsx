import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useWork } from "../lib/work";
import { fmtDate, isoDay } from "../lib/backlog";
import { PageHeader } from "../components/PageHeader";
import { Icon } from "../components/Icon";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const first = (y: number, m: number) => (new Date(y, m, 1).getDay() + 6) % 7; // Monday = 0

/** A month grid of due dates: done, missed, due today or coming up. Needs a start date (batch or your own) to place days. */
export default function Calendar() {
  const w = useWork();
  const [cursor, setCursor] = useState(() => new Date(w.now.getFullYear(), w.now.getMonth(), 1));
  const y = cursor.getFullYear(), m = cursor.getMonth();
  const byDate = useMemo(() => {
    const map = new Map<string, typeof w.items>();
    for (const it of w.items) { if (!it.state.due) continue; const k = isoDay(it.state.due); map.set(k, [...(map.get(k) ?? []), it]); }
    return map;
  }, [w.items]);
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first(y, m)).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const today = isoDay(w.now);
  const undated = w.items.filter((i) => !i.state.due).length;
  const step = (n: number) => setCursor(new Date(y, m + n, 1));
  return (
    <>
      <PageHeader overline="Calendar" title="Programme calendar" sub="Each day of the programme on its due date. Weekends are not working days." />
      {undated > 0 && <p className="banner" role="status">{undated} days have no due date yet. <Link to="/#catch-up">Set your start date</Link> to place them.</p>}
      <div className="card cal">
        <div className="cal-head">
          <button type="button" className="iconbtn" aria-label="Previous month" onClick={() => step(-1)}><Icon name="left" /></button>
          <h2>{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
          <button type="button" className="iconbtn" aria-label="Next month" onClick={() => step(1)}><Icon name="right" /></button>
        </div>
        <div className="cal-grid" role="grid" aria-label="Month">
          {DOW.map((d) => <div key={d} className="cal-dow" role="columnheader">{d}</div>)}
          {cells.map((c, i) => {
            if (c === null) return <div key={i} className="cal-cell empty" role="gridcell" />;
            const key = isoDay(new Date(y, m, c));
            const items = byDate.get(key) ?? [];
            return (
              <div key={i} role="gridcell" className={"cal-cell" + (key === today ? " today" : "") + (i % 7 > 4 ? " off" : "")}>
                <span className="cal-n">{c}</span>
                {items.map((it) => (
                  <Link key={it.state.task} to={`/week/${it.week.n}#wd${it.state.day.n}`} className={"cal-ev " + (it.state.finished ? "done" : it.state.missed ? "missed" : key === today ? "today" : "")} title={`${it.state.day.title}${it.state.finished ? " (done)" : it.state.missed ? " (missed)" : ""}`}>
                    W{it.week.n} D{it.state.day.n}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
        <p className="meta">Green = finished, orange = missed, outlined = due today. Next due: {(() => { const n = w.items.find((i) => i.state.due && !i.state.finished); return n?.state.due ? `${fmtDate(n.state.due)} (Week ${n.week.n}, Day ${n.state.day.n})` : "nothing"; })()}</p>
      </div>
    </>
  );
}
