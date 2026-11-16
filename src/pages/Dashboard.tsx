import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { STACKS } from "../data/stacks";
import { DAYS, TOTAL_CHECKS } from "../data/types";
import { LayerStack, dayProgress } from "../components/Bits";
import { WEEKS } from "../data/outline";
import { WEEK_DAYS, dayKey } from "../data/weekPlan";
import { Kpi } from "../components/Kpi";
import { Progress } from "../components/Progress";

function AdminDashboard() {
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
      <div className="kpis" aria-label="Your progress">
        <Kpi icon="target" label="Ten-day plan" value={`${pct}%`} sub={`${done} of ${TOTAL_CHECKS} checks done`} />
        <Kpi icon="clock" label="Hours logged" value={hours.toFixed(1)} sub="across all days" />
        <Kpi icon="trend" label="Next up" value={`Day ${next.n}`} sub={next.name} />
      </div>
      <div className="dash">
        <section>
          <h2>Your ten layers</h2><p className="muted small">Start at Day 1 and work down. Each bar fills as you tick its checks.</p>
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
            <Progress value={pct} label="Ten-day plan progress" />
            <p className="muted small">{pct}% of the ten-day plan</p>
          </div>
        </aside>
      </div>
    </>
  );
}

function MemberDashboard() {
  const { profile, setProfile, pct, entries, setEntry } = useStore();
  const doneWeeks = WEEKS.filter((w) => entries["wk:" + w.n]).length;
  const mine = Array.isArray(entries["myplan"]) ? (entries["myplan"] as { d: boolean }[]) : [];
  const weekTotal = WEEK_DAYS.reduce((a, d) => a + d.done.length, 0);
  const weekDone = WEEK_DAYS.reduce((a, d) => { const f = entries[dayKey(d.n)]; return a + (Array.isArray(f) ? f.filter((x) => x === true).length : 0); }, 0);
  const nextWeek = WEEKS.find((w) => !entries["wk:" + w.n]);
  return (
    <>
      <header className="ph">
        <h1>{profile.display_name ? `Hello, ${profile.display_name.split(" ")[0]}` : "Dashboard"}</h1>
        <p className="muted">{doneWeeks} of {WEEKS.length} weeks done. Work through the six-week programme and tick each week's output as you reach it.</p>
      </header>
      <div className="kpis" aria-label="Your progress">
        <Kpi icon="target" label="Programme" value={`${pct}%`} sub={`${doneWeeks} of ${WEEKS.length} weeks done`} />
        <Kpi icon="tasks" label="Week 1 tasks" value={`${weekDone} of ${weekTotal}`} sub="acceptance points ticked" />
        <Kpi icon="list" label="My plan" value={`${mine.filter((i) => i.d).length} of ${mine.length}`} sub={mine.length ? "steps done" : "no steps yet"} />
        <Kpi icon="trend" label="Next up" value={nextWeek ? `Week ${nextWeek.n}` : "All done"} sub={nextWeek ? nextWeek.focus : "every week ticked"} />
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
          <div className="card">
            <h3>Your own plan</h3>
            <p className="muted">Add the steps you want to work through, in your own order.</p>
            <Link className="btn" to="/myplan">Open My plan</Link>
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
          <div className="card">
            <h3>Overall</h3>
            <Progress value={pct} label="Six-week programme progress" />
            <p className="muted small">{pct}% of the six-week programme</p>
          </div>
        </aside>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { isAdmin } = useStore();
  return isAdmin ? <AdminDashboard /> : <MemberDashboard />;
}
