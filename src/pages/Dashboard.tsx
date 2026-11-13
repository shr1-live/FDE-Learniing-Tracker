import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { STACKS } from "../data/stacks";
import { DAYS, TOTAL_CHECKS } from "../data/types";
import { LayerStack, dayProgress } from "../components/Bits";
import Ring from "../components/Ring";

const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

export default function Dashboard() {
  const { profile, setProfile, pct, entries } = useStore();
  const next = DAYS.find((d) => dayProgress(entries, d.n).pct < 1) ?? DAYS[DAYS.length - 1];
  const hours = DAYS.reduce((a, d) => a + (Number(entries["hours:" + d.n]) || 0), 0);
  const done = Math.round((pct / 100) * TOTAL_CHECKS);
  return (
    <>
      <header className="ph">
        <h1>{greet()}{profile.display_name ? `, ${profile.display_name.split(" ")[0]}` : ""}</h1>
        <p className="muted">Keep stacking layers. One a day.</p>
      </header>
      <div className="stats">
        <div className="stat"><b>{pct}%</b><span>Plan complete</span></div>
        <div className="stat"><b>{done}/{TOTAL_CHECKS}</b><span>Checks done</span></div>
        <div className="stat"><b>{hours.toFixed(1)}</b><span>Hours logged</span></div>
      </div>
      <div className="dash">
        <section>
          <h2>Your ten layers</h2><p className="muted small">Start at Day 1 and work down. Each bar fills as you tick its checks.</p>
          <LayerStack />
        </section>
        <aside>
          <div className="card nextup">
            <h3>Next up</h3>
            <p><b>Day {next.n}: {next.name}</b></p>
            <p className="muted">{next.goal}</p>
            <Link className="btn" to={`/plan/${next.n}`}>Open Day {next.n}</Link>
          </div>
          <div className="card">
            <h3>Your stack</h3>
            <label htmlFor="stack" className="sr">Stack</label>
            <select id="stack" value={profile.stack} onChange={(e) => setProfile({ stack: e.target.value })}>
              {STACKS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <p className="muted small">Resources and the Stack guide follow this choice.</p>
            <label htmlFor="dn">Display name</label>
            <input id="dn" value={profile.display_name} onChange={(e) => setProfile({ display_name: e.target.value })} />
          </div>
          <div className="card">
            <h3>Overall</h3>
            <div className="ringrow"><Ring pct={pct} /><p className="muted small">{pct === 100 ? "All ten layers done. Brilliant." : `${DAYS.filter((d) => dayProgress(entries, d.n).pct === 1).length} of ${DAYS.length} days complete`}</p></div>
          </div>
        </aside>
      </div>
    </>
  );
}
