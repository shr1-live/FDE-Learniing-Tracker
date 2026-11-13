import { Link, useParams, Navigate } from "react-router-dom";
import Celebrate from "../components/Celebrate";
import { useState } from "react";
import { DAYS, checkKeys } from "../data/types";
import { useStore } from "../lib/store";
import { stackById } from "../data/stacks";
import { CheckItem, DayChips, ResourceList, dayProgress } from "../components/Bits";

export function PlanList() {
  const { entries } = useStore();
  return (
    <>
      <header className="ph"><h1>Ten-day plan</h1><p className="muted">Six hours a day. One layer a day. Start the next layer only when the previous one is done.</p></header>
      <ul className="daylist">
        {DAYS.map((d) => { const p = dayProgress(entries, d.n); return (
          <li key={d.n}><Link to={`/plan/${d.n}`}>
            <span className="dn">Day {d.n}</span>
            <span className="dt"><b>{d.name}</b><small>{d.layer} · {d.outline}</small></span>
            <span className="meter small"><i style={{ width: p.pct * 100 + "%" }} /></span>
            <span className="lc">{p.pct === 1 ? "Done" : `${p.done}/${p.total}`}</span>
          </Link></li>); })}
      </ul>
    </>
  );
}

export function DayPage() {
  const { n } = useParams(); const num = Number(n);
  const d = DAYS.find((x) => x.n === num);
  const { profile, entries, setEntry } = useStore();
  const [allStacks, setAllStacks] = useState(false);
  const [party, setParty] = useState(0);
  if (!d) return <Navigate to="/plan" replace />;
  const st = stackById(profile.stack); const net = st.id === "dotnet";
  const show = (r: { any: boolean }) => net || allStacks || r.any;
  const prog = dayProgress(entries, d.n); const complete = prog.total > 0 && prog.done === prog.total;
  const setAll = (v: boolean) => checkKeys(d).forEach((k) => setEntry("chk:" + k, v));
  const hours = entries["hours:" + d.n]; const note = (entries["note:" + d.n] as string) ?? "";
  return (
    <>
      {party > 0 && <Celebrate id={party} text={`Day ${d.n} complete. Nicely done!`} onDone={() => setParty(0)} />}
      <div className="sticky"><div className="meter"><i style={{ width: prog.pct * 100 + "%" }} /></div></div>
      <DayChips current={d.n} />
      <header className="ph">
        <p className="crumb"><Link to="/plan">Plan</Link> / Day {d.n} of {DAYS.length}</p>
        <h1>{d.name}</h1>
        <p className="muted">{d.layer} · {d.outline}</p>
        <p className="goal">{d.goal}</p>
        <div className="row">
          {complete && <span className="tag done">Completed</span>}
          <button type="button" className={"btn" + (complete ? " ghost" : "")} onClick={() => { setAll(!complete); if (!complete) setParty(Date.now()); }}>{complete ? "Reopen this day" : "Mark day as completed"}</button>
          <span className="muted small">{prog.done}/{prog.total} checks</span>
        </div>
      </header>
      {!net && <p className="banner">Steps below are written for .NET. Use the <Link to="/stack">Stack guide</Link> for {st.label} equivalents. <label className="inl"><input type="checkbox" checked={allStacks} onChange={(e) => setAllStacks(e.target.checked)} /> Show .NET-specific videos and reading</label></p>}
      <div className="two">
        <section>
          <h2>Learn <small>1.5 h</small></h2>
          <p>{d.learn}</p>
          <h3>Watch</h3><ResourceList kind="Video" items={d.watch.filter(show)} />
          <h3>Read</h3><ResourceList kind="Read" items={d.read.filter(show)} />
        </section>
        <section>
          {net ? (<>
            <div className="track ta"><h3>Track A: Azure</h3><p>{d.trackA}</p></div>
            <div className="track tb"><h3>Track B: no Azure</h3><p>{d.trackB}</p></div>
          </>) : (
            <div className="track tb"><h3>Provider options</h3><p>Use a hosted API key from any provider, or run a small model locally with Ollama. Keep the provider behind one interface so you can switch without touching the rest of the code.</p></div>
          )}
          <h2>Build <small>3 h</small></h2>
          <ul className="plain">{d.build.map((b) => <li key={b}>{b}</li>)}</ul>
        </section>
      </div>
      <div className="two">
        <section>
          <h2>Practice <small>1 h</small></h2>
          <ul className="checks">{d.drills.map((t, i) => <CheckItem key={i} k={`d${d.n}-p${i}`} text={t} />)}</ul>
        </section>
        <section>
          <h2>Done when</h2>
          <ul className="checks">{d.done.map((t, i) => <CheckItem key={i} k={`d${d.n}-d${i}`} text={t} />)}</ul>
          <p className="muted small"><b>Cut if behind:</b> {d.cut}</p>
        </section>
      </div>
      <section className="card">
        <h2>Teach-back and hours</h2>
        <label htmlFor="note">Five lines: what I built, why it is needed, what failed, how I would explain it, what I am unsure about.</label>
        <textarea id="note" rows={6} value={note} onChange={(e) => setEntry("note:" + d.n, e.target.value)} />
        <label htmlFor="hrs">Hours spent today</label>
        <input id="hrs" type="number" min={0} max={16} step={0.5} value={typeof hours === "number" ? hours : ""} onChange={(e) => setEntry("hours:" + d.n, e.target.value === "" ? 0 : Number(e.target.value))} />
      </section>
      <nav className="pn">
        {d.n > 1 ? <Link to={`/plan/${d.n - 1}`}>Day {d.n - 1}</Link> : <span />}
        {d.n < DAYS.length ? <Link to={`/plan/${d.n + 1}`}>Day {d.n + 1}</Link> : <span />}
      </nav>
    </>
  );
}
export const totalFor = (n: number) => { const d = DAYS.find((x) => x.n === n); return d ? checkKeys(d).length : 0; };
