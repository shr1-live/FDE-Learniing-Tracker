import { Link, useParams, Navigate } from "react-router-dom";
import Celebrate from "../components/Celebrate";
import { useEffect, useState } from "react";
import Ring from "../components/Ring";
import { PRIMERS } from "../data/primers";
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

type Tab = "learn" | "build" | "practice" | "notes";

export function DayPage() {
  const { n } = useParams(); const num = Number(n);
  const d = DAYS.find((x) => x.n === num);
  const { profile, entries, setEntry } = useStore();
  const [allStacks, setAllStacks] = useState(false);
  const [party, setParty] = useState(0);
  const [tab, setTab] = useState<Tab>("learn");
  useEffect(() => { setTab("learn"); }, [num]);
  if (!d) return <Navigate to="/plan" replace />;
  const st = stackById(profile.stack); const net = st.id === "dotnet";
  const show = (r: { any: boolean }) => net || allStacks || r.any;
  const prog = dayProgress(entries, d.n); const complete = prog.total > 0 && prog.done === prog.total;
  const resKeys = [...d.watch.map((_, i) => `res:d${d.n}-v${i}`), ...d.read.map((_, i) => `res:d${d.n}-r${i}`)];
  const resDone = resKeys.filter((k) => entries[k]).length;
  const withKeys = (list: typeof d.watch, p: string) => list.map((r, i) => ({ r, k: `res:d${d.n}-${p}${i}` })).filter(({ r }) => show(r));
  const setAll = (v: boolean) => { checkKeys(d).forEach((k) => setEntry("chk:" + k, v)); resKeys.forEach((k) => setEntry(k, v)); };
  const hours = entries["hours:" + d.n]; const note = (entries["note:" + d.n] as string) ?? "";
  const pct = Math.round(prog.pct * 100);
  const TABS: [Tab, string, string][] = [["learn", "Learn", `${resDone}/${resKeys.length}`], ["build", "Build", "3 h"], ["practice", "Practice", `${prog.done}/${prog.total}`], ["notes", "Notes", note ? "saved" : ""]];
  return (
    <div className="daypage">
      {party > 0 && <Celebrate id={party} text={`Day ${d.n} complete. Nicely done!`} onDone={() => setParty(0)} />}
      <DayChips current={d.n} />
      <header className="dayhero card">
        <div className="dh-main">
          <p className="eyebrow"><Link to="/plan">Plan</Link><span aria-hidden="true">/</span>Day {d.n} of {DAYS.length}<span aria-hidden="true">·</span>{d.layer}</p>
          <h1>{d.name}</h1>
          <p className="goal">{d.goal}</p>
          <p className="muted small">{d.outline}</p>
        </div>
        <div className="dh-side">
          <Ring pct={pct} size={112} />
          <button type="button" className={"btn" + (complete ? " ghost" : "")} onClick={() => { setAll(!complete); if (!complete) setParty(Date.now()); }}>{complete ? "Reopen this day" : "Mark day as completed"}</button>
          <span className="muted small">{prog.done} of {prog.total} checks</span>
        </div>
      </header>

      {!net && <p className="banner">Steps below are written for .NET. Use the <Link to="/stack">Stack guide</Link> for {st.label} equivalents. <label className="inl"><input type="checkbox" checked={allStacks} onChange={(e) => setAllStacks(e.target.checked)} /> Show .NET-specific videos and reading</label></p>}

      <div className="tabs" role="tablist" aria-label="Day sections">
        {TABS.map(([k, label, meta]) => (
          <button key={k} type="button" role="tab" id={"tab-" + k} aria-selected={tab === k} aria-controls={"panel-" + k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
            {label}{meta && <small>{meta}</small>}
          </button>
        ))}
      </div>

      <div className="panel" role="tabpanel" id={"panel-" + tab} aria-labelledby={"tab-" + tab} key={tab}>
        {tab === "learn" && (<>
          <section className="card"><h2>What to learn</h2><p>{d.learn}</p></section>
          {PRIMERS[d.n] && (
            <details className="card primer" open>
              <summary><h2>Read this first: the ideas in plain English</h2></summary>
              <p className="big">{PRIMERS[d.n].big}</p>
              <dl className="terms">{PRIMERS[d.n].terms.map(([t, x]) => (<div key={t}><dt>{t}</dt><dd>{x}</dd></div>))}</dl>
              <h3>Common mistakes</h3>
              <ul className="plain">{PRIMERS[d.n].mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
            </details>
          )}
          <div className="two">
            <section className="card"><h2>Watch</h2><ResourceList kind="Video" items={withKeys(d.watch, "v")} /></section>
            <section className="card"><h2>Read</h2><ResourceList kind="Read" items={withKeys(d.read, "r")} /></section>
          </div>
        </>)}

        {tab === "build" && (<>
          {net ? (
            <div className="two">
              <div className="track ta"><h3>Track A: Azure</h3><p>{d.trackA}</p></div>
              <div className="track tb"><h3>Track B: no Azure</h3><p>{d.trackB}</p></div>
            </div>
          ) : (
            <div className="track tb"><h3>Provider options</h3><p>Use a hosted API key from any provider, or run a small model locally with Ollama. Keep the provider behind one interface so you can switch without touching the rest of the code.</p></div>
          )}
          <section className="card"><h2>Build steps</h2>
            <ol className="steps">{d.build.map((b) => <li key={b}>{b}</li>)}</ol>
          </section>
        </>)}

        {tab === "practice" && (
          <div className="two">
            <section className="card"><h2>Practice <small>1 h</small></h2>
              <ul className="checks">{d.drills.map((t, i) => <CheckItem key={i} k={`d${d.n}-p${i}`} text={t} />)}</ul>
            </section>
            <section className="card"><h2>Done when</h2>
              <ul className="checks">{d.done.map((t, i) => <CheckItem key={i} k={`d${d.n}-d${i}`} text={t} />)}</ul>
              <p className="cut"><b>Cut if behind:</b> {d.cut}</p>
            </section>
          </div>
        )}

        {tab === "notes" && (
          <section className="card"><h2>Teach-back and hours</h2>
            <label htmlFor="note">Five lines: what I built, why it is needed, what failed, how I would explain it, what I am unsure about.</label>
            <textarea id="note" rows={7} value={note} onChange={(e) => setEntry("note:" + d.n, e.target.value)} />
            <label htmlFor="hrs">Hours spent today</label>
            <input id="hrs" type="number" min={0} max={16} step={0.5} value={typeof hours === "number" ? hours : ""} onChange={(e) => setEntry("hours:" + d.n, e.target.value === "" ? 0 : Number(e.target.value))} />
          </section>
        )}
      </div>

      <nav className="pn" aria-label="Previous and next day">
        {d.n > 1 ? <Link to={`/plan/${d.n - 1}`} className="pncard"><small>Previous</small><b>Day {d.n - 1}: {DAYS[d.n - 2].name}</b></Link> : <span />}
        {d.n < DAYS.length ? <Link to={`/plan/${d.n + 1}`} className="pncard next"><small>Next</small><b>Day {d.n + 1}: {DAYS[d.n].name}</b></Link> : <span />}
      </nav>
    </div>
  );
}
export const totalFor = (n: number) => { const d = DAYS.find((x) => x.n === n); return d ? checkKeys(d).length : 0; };
