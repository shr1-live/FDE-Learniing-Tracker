import { Link } from "react-router-dom";
import { useWork, WorkItem } from "../lib/work";
import { useStore } from "../lib/store";
import { dayStatus, fmtDate } from "../lib/backlog";
import { buildReminders, eodHour } from "../lib/reminders";
import { dayKey } from "../data/programme";
import { Icon } from "./Icon";
import { Progress } from "./Progress";
import { LiveBadge } from "./LiveBadge";
import { StartDate } from "./StartDate";
import { Chip } from "./Chip";
import { useToast } from "./Toast";
import { notesPath } from "../data/studyNotes";

const dayTitle = (i: WorkItem) => `Week ${i.week.n}, Day ${i.state.day.n}`;
const dayLink = (i: WorkItem) => `/week/${i.week.n}#wd${i.state.day.n}`;
const flags = (v: unknown, len: number): boolean[] => Array.from({ length: len }, (_, i) => Array.isArray(v) && v[i] === true);

/** Today's day as a live card: the points can be ticked right here, without opening the day. */
function Focus({ item, today }: { item: WorkItem; today: Date }) {
  const { entries, setEntry } = useStore();
  const toast = useToast();
  const s = item.state;
  const st = dayStatus(s, today);
  const total = s.day.done.length;
  const dueToday = st.label === "Due today";
  const f = flags(entries[dayKey(item.week.n, s.day.n)], total);
  const tick = (i: number) => {
    const next = [...f]; next[i] = !next[i];
    setEntry(dayKey(item.week.n, s.day.n), next);
    if (next.every(Boolean) && !f.every(Boolean)) toast.success(`Every point is ticked for Day ${s.day.n}.${s.proof === "none" ? " Next: hand in your proof." : ""}`);
  };
  const proofNote = s.proof === "none" ? "Hand in your proof (a link, a screenshot or a file) for a reviewer."
    : s.proof === "draft" ? "Your proof is saved but not submitted: press Submit for review."
    : s.proof === "changes_requested" ? "The reviewer asked for changes: read the comment, fix, and submit again." : "";
  return (
    <article className={"wcard focus" + (dueToday ? " warn" : "")} aria-labelledby="w-focus">
      <p className="eyebrow">{dueToday ? "Do this today" : "Up next"}</p>
      <h3 id="w-focus">{dayTitle(item)}: {s.day.title}</h3>
      <div className="row tight">
        <Chip tone={st.tone}>{st.label}</Chip>
        {s.due && !dueToday && <span className="meta">Due {fmtDate(s.due)}</span>}
        <span className="meta tnum">{s.ticked} of {total} points ticked</span>
      </div>
      <Progress value={total ? (s.ticked / total) * 100 : 0} label={`${dayTitle(item)} points done`} />
      <ul className="todo" aria-label="Points for this day">
        {s.day.done.map((t, i) => (
          <li key={t}><label className="check"><input type="checkbox" checked={f[i]} onChange={() => tick(i)} /><span>{t}</span></label></li>
        ))}
      </ul>
      {proofNote && <p className="callout warn small" role="note"><Icon name="alert" size={14} /> {proofNote}</p>}
      <div className="row">
        <Link className="btn" to={dayLink(item)}><Icon name="book" size={16} />Open Day {s.day.n}</Link>
        <Link className="btn secondary" to={notesPath(item.week.n, s.day.n)}>Study notes</Link>
      </div>
    </article>
  );
}

function ReviewerWork() {
  const w = useWork();
  const c = w.counts;
  return (
    <article className={"wcard focus " + ((c?.submitted ?? 0) > 0 ? "warn" : "ok")} aria-labelledby="w-queue">
      <p className="eyebrow">Your work as a reviewer</p>
      <h3 id="w-queue">{c ? (c.submitted > 0 ? `${c.submitted} waiting for your review` : "Nothing waiting for review") : "Loading the review queue"}</h3>
      {c && <p className="muted tnum">{c.changes_requested} sent back for changes, {c.approved} approved so far.</p>}
      <div className="row"><Link className="btn" to="/review"><Icon name="inbox" size={16} />Open the review queue</Link></div>
    </article>
  );
}

/** What this person has to do: live cards at the top of Home, for learners, reviewers and the admin. */
export function WorkToday() {
  const w = useWork();
  const { entries } = useStore();
  const wrap = buildReminders(w, eodHour(entries)).find((r) => r.id.startsWith("eod:"));
  return (
    <section className="work" aria-labelledby="work-h">
      <div className="work-head"><h2 id="work-h">Your work today</h2><LiveBadge /></div>

      {!w.learner ? <div className="wgrid"><ReviewerWork /></div> : (
        <>
          {w.weeksWithoutStart.length > 0 && !w.allDone && (
            <div className="callout warn" role="note">
              <b>Set your start date.</b> Every day then gets a due date, and a missed day is found for you.
              <StartDate week={w.weeksWithoutStart[0]!} compact />
            </div>
          )}
          {wrap?.catchUp && (
            <article className="wcard wrapup" aria-labelledby="w-eod">
              <p className="eyebrow">End of day</p>
              <h3 id="w-eod">Before you stop: {wrap.catchUp.dayTitle}</h3>
              <p>{wrap.catchUp.summary}</p>
              {wrap.catchUp.keyIdeas && <ul className="plain">{wrap.catchUp.keyIdeas.map((k) => <li key={k}>{k}</li>)}</ul>}
              <div className="row"><Link className="btn" to={wrap.catchUp.notesTo}>Read the study notes for this day</Link></div>
            </article>
          )}
          <div className="wgrid">
            {w.allDone && (
              <article className="wcard ok focus">
                <p className="eyebrow">All caught up</p>
                <h3>Every day of the programme is done</h3>
                <p className="muted">New weeks appear here when they are added.</p>
              </article>
            )}
            {w.focus && <Focus item={w.focus} today={w.now} />}

            <article className={"wcard " + (w.missed.length ? "bad" : "ok")} aria-labelledby="w-backlog">
              <p className="eyebrow">Catch-up</p>
              <h3 id="w-backlog"><span className="bignum tnum">{w.missed.length}</span> missed day{w.missed.length === 1 ? "" : "s"}</h3>
              {w.missed.length === 0
                ? <p className="muted">You are not behind. Keep going.</p>
                : <ul className="plain">{w.missed.slice(0, 3).map((i) => <li key={dayTitle(i)}>{dayTitle(i)}: {i.state.why}</li>)}</ul>}
              <div className="row"><Link className={w.missed.length ? "btn secondary" : "btn ghost"} to="/#catch-up">{w.missed.length ? "See what is missing" : "Open catch-up"}</Link></div>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
