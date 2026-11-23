import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { useWork } from "../lib/work";
import { useView } from "../lib/viewAs";
import { STACKS } from "../data/stacks";
import { Kpi } from "../components/Kpi";
import { Icon } from "../components/Icon";
import { Ring } from "../components/Ring";
import { WorkToday } from "../components/WorkToday";
import { CatchUp } from "../components/CatchUp";
import { MySteps } from "../components/MySteps";
import { LearningHeatmap } from "../components/LearningHeatmap";
import { fmtDate } from "../lib/backlog";
import { youTubeId } from "../components/Bits";
import { notesPath } from "../data/studyNotes";

/** Working days from the batch start to today, as "day N" of the programme (Monday to Friday). */
function programmeDay(start: Date, today: Date): number {
  if (today < start) return 0;
  let n = 0;
  for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) if (d.getDay() !== 0 && d.getDay() !== 6) n++;
  return n;
}

function greeting(h: number) { return h < 5 ? "Good evening" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; }

/** Home: what to do now, the numbers that matter, the days to catch up on, your own steps and what is new in the feed. */
export default function Home() {
  const { profile, setProfile, pct } = useStore();
  const w = useWork();
  const { reviewerView: reviewer } = useView();
  const first = profile.display_name ? profile.display_name.split(" ")[0] : "";
  const day = w.batch ? programmeDay(w.batch.startsOn, w.now) : 0;
  const totalDays = w.totals.days;
  const latest = w.newInFeed.slice(0, 3);
  const line = w.batch
    ? <>{w.batch.name} · started {fmtDate(w.batch.startsOn)} · {day === 0 ? "starts soon" : day > totalDays ? "programme days are over: catch up and finish" : `day ${day} of ${totalDays}`}</>
    : "One day of the programme per working day: learn the theory, build the practical task, hand in your proof.";
  return (
    <>
      <section className="hero" aria-label="Welcome">
        <div className="hero-text">
          <p className="eyebrow">{new Date(w.now).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1>{greeting(w.now.getHours())}{first ? `, ${first}` : ""}</h1>
          <p className="sub">{line}</p>
          <div className="row">
            {reviewer
              ? <Link className="btn" to="/review"><Icon name="inbox" size={16} />Open the review queue</Link>
              : w.focus && <Link className="btn" to={`/week/${w.focus.week.n}#wd${w.focus.state.day.n}`}><Icon name="book" size={16} />Continue Day {w.focus.state.day.n}</Link>}
            {!reviewer && w.focus && <Link className="btn secondary" to={notesPath(w.focus.week.n, w.focus.state.day.n)}>Study notes</Link>}
            <Link className="btn ghost" to="/feed"><Icon name="link" size={16} />Share a link</Link>
          </div>
        </div>
        <Ring value={pct} label="Overall progress" size={112} stroke={10} caption="of points" />
      </section>

      <div className="kpis" aria-label="Key numbers">
        <Kpi icon="target" label="Programme" value={`${w.totals.finished} of ${totalDays}`} sub={`days done · ${pct}% of points`} />
        {w.learner && <Kpi icon="calendar" label="Catch-up" value={String(w.missed.length)} sub={w.missed.length ? "missed days to catch up" : w.dueToday.length ? `${w.dueToday.length} due today` : "you are not behind"} tone={w.missed.length ? "bad" : "ok"} />}
        {w.learner && w.proofTracked && <Kpi icon="file" label="Proof handed in" value={`${w.handedIn} of ${totalDays}`} sub={w.proofActions.length ? `${w.proofActions.length} need you` : "nothing waiting on you"} />}
        <Kpi icon="rss" label="New in the feed" value={String(w.newInFeed.length)} sub="since your last visit" />
        {reviewer && <Kpi icon="inbox" label="Proof to review" value={w.counts ? String(w.counts.submitted) : "-"} sub={w.counts ? `${w.counts.approved} approved so far` : "loading"} />}
        {reviewer && <Kpi icon="link" label="Shares to approve" value={w.sharesWaiting === null ? "-" : String(w.sharesWaiting)} sub="links waiting for the feed" />}
      </div>

      <div className="home-grid">
        <div className="home-main">
          <WorkToday />

          {w.learner && <LearningHeatmap />}

          {w.learner && (
            <section id="catch-up" aria-labelledby="cu-h">
              <div className="sec-head"><h2 id="cu-h">Catch up {w.missed.length > 0 && <small>{w.missed.length} missed</small>}</h2></div>
              <CatchUp />
            </section>
          )}

          <section id="steps" aria-labelledby="st-h">
            <div className="sec-head"><h2 id="st-h">My steps</h2></div>
            <MySteps />
          </section>
        </div>

        <aside className="home-side" aria-label="Side notes">
          <section aria-labelledby="feed-h">
            <div className="sec-head"><h2 id="feed-h">New in the feed</h2><Link to="/feed">Open the feed</Link></div>
            {latest.length === 0
              ? <div className="card"><p className="muted">Nothing new since your last visit. Found a good video or blog? <Link to="/feed">Share it</Link> so everyone sees it.</p></div>
              : (
                <ul className="stackcards tight">
                  {latest.map((i) => {
                    const id = i.url ? youTubeId(i.url) : null;
                    return (
                      <li key={i.id} className="card feedmini">
                        {id ? <img src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" loading="lazy" /> : <span className="ph-thumb" aria-hidden="true"><Icon name="link" size={22} /></span>}
                        <div><Link to="/feed">{i.title}</Link><p className="meta">{i.topic_title} · {i.author}{i.recommended ? " · recommended" : ""}</p></div>
                      </li>
                    );
                  })}
                </ul>
              )}
          </section>
          <section className="card" aria-labelledby="prof-h">
            <h3 id="prof-h">Your profile</h3>
            <p className="meta" style={{ marginTop: 4 }}>Saved as you type.</p>
            <div className="field" style={{ marginTop: "var(--s-4)" }}>
              <label htmlFor="stack">Your stack</label>
              <div className="select-wrap"><select id="stack" value={profile.stack} onChange={(e) => setProfile({ stack: e.target.value })}>
                {STACKS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select></div>
              <p className="meta" style={{ marginTop: 6 }}>The Stack guide in Resources follows this choice.</p>
            </div>
            <div className="field">
              <label htmlFor="dn">Display name</label>
              <input id="dn" value={profile.display_name} onChange={(e) => setProfile({ display_name: e.target.value })} />
            </div>
          </section>
          <section className="card" aria-labelledby="prog-h">
            <h3 id="prog-h">Programme</h3>
            <p className="meta" style={{ marginTop: 4 }}>Weeks of five working days: topic, theory, practical task, proof and a rating.</p>
            <div className="row" style={{ marginTop: "var(--s-3)" }}>
              <Link className="btn secondary" to="/week/1">Week 1 tasks</Link>
              <Link className="btn secondary" to="/week/2">Week 2 tasks</Link>
              <Link className="btn ghost" to="/week/1#overview">All six weeks</Link>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
