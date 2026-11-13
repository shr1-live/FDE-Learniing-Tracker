import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { STACKS } from "../data/stacks";
import { DAYS, TOTAL_CHECKS } from "../data/types";
import { LayerStack, dayProgress } from "../components/Bits";

export default function Dashboard() {
  const { profile, setProfile, pct, entries } = useStore();
  const next = DAYS.find((d) => dayProgress(entries, d.n).pct < 1) ?? DAYS[DAYS.length - 1];
  const hours = DAYS.reduce((a, d) => a + (Number(entries["hours:" + d.n]) || 0), 0);
  const done = Math.round((pct / 100) * TOTAL_CHECKS);
  return (
    <>
      <header className="ph">
        <h1>{profile.display_name ? `Hello, ${profile.display_name.split(" ")[0]}` : "Dashboard"}</h1>
        <p className="muted">{done} of {TOTAL_CHECKS} checks done. {hours.toFixed(1)} hours logged.</p>
      </header>
      <div className="dash">
        <section>
          <h2>Layers built</h2>
          <LayerStack />
        </section>
        <aside>
          <div className="card">
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
            <div className="meter" aria-label={`${pct} percent`}><i style={{ width: pct + "%" }} /></div>
            <p className="muted small">{pct}% of the ten-day plan</p>
          </div>
        </aside>
      </div>
    </>
  );
}
