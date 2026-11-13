import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { ALLOWED_DOMAIN } from "../lib/supabase";
import { WEEKS } from "../data/outline";
import { DAYS } from "../data/types";
import ThemeSwitch from "../components/ThemeSwitch";

export function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <span className="blob b1" /><span className="blob b2" /><span className="blob b3" /><span className="grid" />
    </div>
  );
}

/** Fades children in when they scroll into view. Content stays visible if IntersectionObserver is missing. */
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const el = ref.current; if (!el || on) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, [on]);
  return <div ref={ref} className={`reveal${on ? " in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const FEATURES: [string, string, string][] = [
  ["01", "One layer a day", "Ten focused days. Each builds on the last, so you finish with a working capstone, not a pile of notes."],
  ["02", "Tick it, it saves", "Check off practice and done-when items, mark a whole day complete, and log your hours. Everything is saved."],
  ["03", "Private by design", "Your progress is yours alone. Nobody else on the programme can see it."],
  ["04", "Your stack, your path", ".NET, Node, Java or Python. Resources follow the stack you pick."],
];

export default function Landing() {
  const { mode, signIn, signInPassword, localSignIn } = useStore();
  const [pw, setPw] = useState(""); const [usePw, setUsePw] = useState(false);
  const [email, setEmail] = useState(""); const [msg, setMsg] = useState(""); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    if (mode === "supabase" && usePw) { const err = await signInPassword(email, pw); if (err) setMsg(err); }
    else if (mode === "supabase") { const err = await signIn(email); if (err) setMsg(err); else setSent(true); }
    else { const err = localSignIn(email); if (err) setMsg(err); }
    setBusy(false);
  }
  return (
    <div className="land">
      <Aurora />
      <header className="lnav">
        <div className="brand"><span className="mark" aria-hidden="true"><i /><i /><i /></span>FDE Tracker</div>
        <div className="ltheme"><ThemeSwitch /></div>
      </header>

      <main>
        <section className="hero">
          <div className="hcopy">
            <p className="eyebrow"><span className="dot" />Forward Deployed Engineer programme</p>
            <h1>Build the AI skills your role needs, <em>one layer a day.</em></h1>
            <p className="lead">The company FDE programme as a working tracker: a ten-day fast track, the six-week outline, and your own stack. Tick it off, keep your notes, watch your layers stack up.</p>
            <a className="btn big" href="#signin">Get started</a>
            <ul className="trust"><li>Office email only</li><li>Private progress</li><li>Free for the first 3 people</li></ul>
          </div>
          <div className="tower" aria-hidden="true">
            {DAYS.slice(0, 7).map((d, i) => (
              <div key={d.n} className="tlayer" style={{ animationDelay: `${0.25 + i * 0.18}s`, ["--w" as string]: `${100 - i * 7}%` }}>
                <span>Day {d.n}</span><b>{d.name}</b>
              </div>
            ))}
            <div className="glow" />
          </div>
        </section>

        <section className="band">
          <Reveal className="stats3">
            <div><b>10</b><span>days, one layer each</span></div>
            <div><b>6</b><span>week programme outline</span></div>
            <div><b>4</b><span>stacks supported</span></div>
          </Reveal>
        </section>

        <section className="feat">
          <Reveal><h2>Everything you need, nothing you do not</h2></Reveal>
          <div className="fgrid">
            {FEATURES.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 90}><article className="fcard"><span className="fn">{n}</span><h3>{t}</h3><p>{d}</p></article></Reveal>
            ))}
          </div>
        </section>

        <section className="path">
          <Reveal><h2>The six-week road</h2></Reveal>
          <ol className="road">
            {WEEKS.map((w, i) => (
              <li key={w.n}><Reveal delay={i * 80}><span className="wk">Week {w.n}</span><span>{w.focus}</span></Reveal></li>
            ))}
          </ol>
        </section>

        <section className="signin" id="signin">
          <Reveal>
            <div className="card lform">
              <h2>Sign in with your office email</h2>
              {sent ? (
                <p role="status">Check your inbox at <b>{email}</b>. The link signs you in on this device.</p>
              ) : (
                <form onSubmit={submit}>
                  <label htmlFor="email">Office email</label>
                  <input id="email" type="email" required autoComplete="email" placeholder={`you@${ALLOWED_DOMAIN}`} value={email} onChange={(e) => setEmail(e.target.value)} />
                  {usePw && (<><label htmlFor="pw">Password</label><input id="pw" type="password" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></>)}
                  <button className="btn big" disabled={busy}>{mode !== "supabase" ? "Continue" : usePw ? "Sign in" : "Email me a sign-in link"}</button>
                  {mode === "supabase" && <button type="button" className="linkbtn alt" onClick={() => { setUsePw(!usePw); setMsg(""); }}>{usePw ? "Use an email link instead" : "Email not arriving? Sign in with a password"}</button>}
                  {msg && <p className="err" role="alert">{msg}</p>}
                </form>
              )}
              <p className="muted small">Only @{ALLOWED_DOMAIN} addresses. The first 3 people get in straight away; after that the admin approves each request.{mode === "local" && " This deployment has no database connected yet, so progress is saved in this browser only."}</p>
            </div>
          </Reveal>
        </section>
      </main>
      <footer className="lfoot">FDE Learning Tracker</footer>
    </div>
  );
}
