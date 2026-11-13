import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { STACKS } from "../data/stacks";
import { DAYS, TOTAL_CHECKS } from "../data/types";
import { LayerStack, dayProgress } from "../components/Bits";
import Ring from "../components/Ring";
import { WEEKS } from "../data/outline";

const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

function AdminDashboard() {
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

function MemberDashboard() {
  const { profile, setProfile, pct, entries, setEntry } = useStore();
  const doneWeeks = WEEKS.filter((w) => entries["wk:" + w.n]).length;
  const next = WEEKS.find((w) => !entries["wk:" + w.n]);
  return (
    <>
      <header className="ph">
        <h1>{greet()}{profile.display_name ? `, ${profile.display_name.split(" ")[0]}` : ""}</h1>
        <p className="muted">Work through the six-week programme and tick each week's output as you reach it.</p>
      </header>
      <div className="stats">
        <div className="stat"><b>{pct}%</b><span>Programme complete</span></div>
        <div className="stat"><b>{doneWeeks}/{WEEKS.length}</b><span>Weeks done</span></div>
        <div className="stat"><b>{Math.max(0, WEEKS.length - doneWeeks) * 15}</b><span>Learning hours left</span></div>
      </div>
      <div className="dash">
        <section>
          <h2>Your six weeks</h2><p className="muted small">Tick a week when you have produced its expected output.</p>
          <ul className="weeklist">
            {WEEKS.map((w) => (
              <li key={w.n} className="card">
                <label className="check"><input type="checkbox" checked={!!entries["wk:" + w.n]} onChange={(e) => setEntry("wk:" + w.n, e.target.checked)} />
                  <span><b>Week {w.n}: {w.focus}</b><br />{w.output}</span></label>
              </li>
            ))}
          </ul>
        </section>
        <aside>
          <div className="card nextup">
            <h3>Next up</h3>
            {next ? (<><p><b>Week {next.n}: {next.focus}</b></p><p className="muted">{next.output}</p><Link className="btn" to="/outline">Open the programme</Link> <Link className="btn ghost" to="/myplan">Build my own plan</Link></>) : <p>All six weeks done. Brilliant.</p>}
          </div>
          <div className="card">
            <h3>Your stack</h3>
            <label htmlFor="stack" className="sr">Stack</label>
            <select id="stack" value={profile.stack} onChange={(e) => setProfile({ stack: e.target.value })}>
              {STACKS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <p className="muted small">The Stack guide follows this choice.</p>
            <label htmlFor="dn">Display name</label>
            <input id="dn" value={profile.display_name} onChange={(e) => setProfile({ display_name: e.target.value })} />
          </div>
          <div className="card"><h3>Overall</h3><div className="ringrow"><Ring pct={pct} /><p className="muted small">{doneWeeks} of {WEEKS.length} weeks complete</p></div></div>
        </aside>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { isAdmin } = useStore();
  return isAdmin ? <AdminDashboard /> : <MemberDashboard />;
}
