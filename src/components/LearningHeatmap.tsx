import { Link } from "react-router-dom";
import { useWork } from "../lib/work";
import { WEEKS } from "../data/outline";
import { sameDay } from "../lib/backlog";

/** 0 = nothing ticked yet; 1 to 4 = a quarter of the day's "done when" points each. */
const level = (ticked: number, total: number) => (total === 0 || ticked === 0 ? 0 : Math.min(4, Math.ceil((ticked / total) * 4)));

/**
 * The learning heatmap: one row per programme week, one square per working day (Mon to Fri). The darker the square,
 * the more of that day's points are ticked. Orange = missed, ringed = today. Weeks that are not published yet are empty.
 */
export function LearningHeatmap() {
  const w = useWork();
  const byWeek = new Map(w.weeks.map((x) => [x.week.n, x]));
  const ticked = w.totals.ticked, points = w.totals.points;
  return (
    <section className="card heat" aria-labelledby="heat-h">
      <div className="heat-head">
        <h2 id="heat-h">Learning heatmap</h2>
        <p className="meta">{ticked} of {points} points ticked · {w.totals.finished} of {w.totals.days} days finished</p>
      </div>
      <div className="heat-grid" role="table" aria-label="Points ticked per day, by week">
        <div className="heat-row heat-days" role="row">
          <span role="columnheader" className="heat-lab"><span className="sr">Week</span></span>
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => <span key={d} role="columnheader" className="heat-dow">{d}</span>)}
        </div>
        {WEEKS.map((wk) => {
          const ww = byWeek.get(wk.n);
          return (
            <div key={wk.n} className="heat-row" role="row">
              <span role="rowheader" className="heat-lab">Week {wk.n}</span>
              {[0, 1, 2, 3, 4].map((i) => {
                const st = ww?.states[i];
                if (!st || !ww) return <span key={i} role="cell" className="heat-cell soon" title={`Week ${wk.n} is not published yet`}><span className="sr">Week {wk.n}, day {i + 1}: not published yet</span></span>;
                const lv = level(st.ticked, st.day.done.length);
                const today = !!st.due && sameDay(st.due, w.now);
                const label = `Week ${wk.n}, day ${st.day.n}, ${st.day.title}: ${st.ticked} of ${st.day.done.length} points${st.finished ? ", finished" : st.missed ? ", missed" : ""}${today ? ", due today" : ""}`;
                return (
                  <Link key={i} role="cell" to={`/week/${wk.n}#wd${st.day.n}`} className={`heat-cell l${lv}${st.finished ? " done" : ""}${st.missed ? " missed" : ""}${today ? " today" : ""}`} title={label} aria-label={label} />
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="heat-legend" aria-hidden="true">
        <span>Less</span>{[0, 1, 2, 3, 4].map((l) => <span key={l} className={`heat-cell l${l}`} />)}<span>More</span>
        <span className="heat-cell l0 missed" /><span>Missed</span>
        <span className="heat-cell l0 today" /><span>Today</span>
      </div>
    </section>
  );
}
