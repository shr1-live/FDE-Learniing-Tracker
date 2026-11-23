import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useWork } from "../lib/work";
import { useStore } from "../lib/store";
import { buildReminders, eodHour, eodKey, EOD_HOURS, groupOf, mutedKey } from "../lib/reminders";
import { useDailyLogReminder } from "../lib/dailyLogApi";
import { useServerNotifications } from "../lib/notificationsApi";
import { PageHeader } from "../components/PageHeader";
import { Chip } from "../components/Chip";
import { EmptyState } from "../components/States";

const KIND: Record<string, string> = { bad: "Missed", warn: "Today", info: "Note", ok: "Done", none: "Note" };
const GROUPS: [string, string, string][] = [
  ["missed", "Missed days", "A day passed its due date."],
  ["due", "Due today", "A day is due today."],
  ["proof", "Proof reminders", "A proof is saved but not submitted, or a reviewer asked for changes."],
  ["start", "Start date", "Reminder to set your start date."],
  ["log", "Daily log", "After 10:00, if you have not logged any hours today."],
  ["week", "Week submitted and weekly digest", "A learner submitted their daily log, and the Monday summary (reviewers and admin)."],
  ["eod", "End-of-day wrap-up", "A summary after your chosen hour."],
  ["feed", "Feed and review queue", "New feed posts, shared links and submissions waiting for review."],
];

/** All reminders in one place, with the choice of which kinds to see. */
export default function Notifications() {
  const w = useWork();
  const { entries, setEntry } = useStore();
  const hour = eodHour(entries);
  const muted = new Set(Array.isArray(entries[mutedKey]) ? (entries[mutedKey] as string[]) : []);
  const logRem = useDailyLogReminder(w.now, w.learner);
  const srv = useServerNotifications();
  const all = useMemo(() => [...srv.items, ...logRem, ...buildReminders(w, hour)], [w, hour, logRem, srv.items]);
  const list = all.filter((r) => !muted.has(groupOf(r.id)));
  const toggle = (g: string) => { const n = new Set(muted); if (n.has(g)) n.delete(g); else n.add(g); setEntry(mutedKey, [...n]); };
  return (
    <>
      <PageHeader overline="Reminders" title="Notifications" sub="What needs you right now. Reminders show here and in the bell when you open the app." />
      <div className="home-grid">
        <div className="home-main">
          {list.length === 0 ? <EmptyState icon="check" title="Nothing needs you">You are up to date{muted.size ? ", for the kinds you chose to see" : ""}.</EmptyState> : (
            <ul className="notifs card">
              {list.map((r) => (
                <li key={r.id}>
                  <div className="row tight"><Chip tone={r.tone}>{KIND[r.tone]}</Chip><b>{r.title}</b></div>
                  <p className="muted small">{r.body}</p>
                  <div className="row tight"><Link to={r.to}>{r.toLabel}</Link>{r.catchUp && <Link to={r.catchUp.notesTo}>Study notes</Link>}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <aside className="home-side" aria-label="Preferences">
          <section className="card" aria-labelledby="np-h">
            <h2 id="np-h">What to show me</h2>
            {GROUPS.map(([g, label, hint]) => (
              <label key={g} className="check-row"><input type="checkbox" checked={!muted.has(g)} onChange={() => toggle(g)} /><span><b>{label}</b><small className="meta"> {hint}</small></span></label>
            ))}
            {w.learner && (
              <div className="field" style={{ marginTop: "var(--s-4)" }}>
                <label htmlFor="np-eod">End-of-day wrap-up from</label>
                <div className="select-wrap"><select id="np-eod" value={hour} onChange={(e) => setEntry(eodKey, Number(e.target.value))}>{EOD_HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}</select></div>
              </div>
            )}
            <p className="meta">Email and Slack or Teams alerts are sent only when the server has them set up.</p>
          </section>
        </aside>
      </div>
    </>
  );
}
