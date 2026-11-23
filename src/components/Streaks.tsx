import { useWork } from "../lib/work";
import { badges, streaks } from "../lib/streak";
import { Icon } from "./Icon";

/** Days in a row and the badges earned so far. */
export function Streaks() {
  const w = useWork();
  const s = streaks(w);
  const list = badges(w);
  const got = list.filter((b) => b.earned).length;
  return (
    <section className="card streaks" aria-labelledby="str-h">
      <div className="heat-head">
        <h2 id="str-h">Streak and badges</h2>
        <p className="meta">{got} of {list.length} badges</p>
      </div>
      <div className="streak-nums">
        <div><b className="tnum">{s.current}</b><span>day{s.current === 1 ? "" : "s"} in a row</span></div>
        <div><b className="tnum">{s.longest}</b><span>longest run</span></div>
      </div>
      <ul className="badges">
        {list.map((b) => (
          <li key={b.id} className={"badge-it" + (b.earned ? " on" : "")} title={b.hint}>
            <Icon name={b.earned ? "check" : "target"} size={16} /><span>{b.title}</span>
            <span className="sr">{b.earned ? ", earned" : `, not yet: ${b.hint}`}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
