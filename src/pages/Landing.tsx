import { FormEvent, useState } from "react";
import { useStore } from "../lib/store";
import { ALLOWED_DOMAIN } from "../lib/supabase";
import { WEEKS } from "../data/outline";
import ThemeSwitch from "../components/ThemeSwitch";
import { Logo } from "../components/Logo";
import { Icon } from "../components/Icon";

export default function Landing() {
  const { mode, signIn, signInPassword, guestSignIn, localSignIn } = useStore();
  const [email, setEmail] = useState(""); const [msg, setMsg] = useState(""); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState(""); const [usePw, setUsePw] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    if (mode === "supabase" && usePw) { const err = await signInPassword(email, pw); if (err) setMsg(err); }
    else if (mode === "supabase") { const err = await signIn(email); if (err) setMsg(err); else setSent(true); }
    else { const err = localSignIn(email); if (err) setMsg(err); }
    setBusy(false);
  }
  return (
    <div className="landing">
      <header className="landing-top">
        <div className="brand"><Logo /><span className="brand-name">FDE Training</span></div>
        <ThemeSwitch />
      </header>
      <main className="landing-main" id="main">
        <section className="landing-hero" aria-labelledby="hero-h">
          <p className="eyebrow">FiftyFive Technologies · Forward-deployed engineering</p>
          <h1 id="hero-h" style={{ marginTop: "var(--s-4)" }}>Build the AI skills your role needs, one layer a day</h1>
          <p className="lead">The company FDE programme as a working tracker: the six-week outline, a guide for your stack, and your own plan. Tick what you finish, keep your notes, and see your progress build up.</p>
          <ol className="weeks" aria-label="The six weeks">{WEEKS.map((w) => (<li key={w.n}><b>Week {w.n}</b><span>{w.focus}</span></li>))}</ol>
        </section>
        <section className="card signin" aria-labelledby="signin-h">
          <h2 id="signin-h">Sign in with your office email</h2>
          <p className="muted">Use the address your programme invitation was sent to.</p>
          {sent ? (
            <div className="sent" role="status"><Icon name="check" /><p>Check your inbox at <b>{email}</b>. The link signs you in on this device.</p></div>
          ) : (
            <form onSubmit={submit}>
              <div className="field">
                <label htmlFor="email">Office email</label>
                <input id="email" type="email" required autoComplete="email" placeholder={`you@${ALLOWED_DOMAIN}`} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {usePw && (<div className="field"><label htmlFor="pw">Password</label><input id="pw" type="password" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>)}
              <button className="btn" disabled={busy}><Icon name="right" size={16} />{mode !== "supabase" ? "Continue" : usePw ? "Sign in" : "Email me a sign-in link"}</button>
              {mode === "supabase" && import.meta.env.VITE_ENABLE_GUEST !== "0" && <button type="button" className="btn secondary wide" onClick={guestSignIn}>Continue as guest (this browser only)</button>}
              {mode === "supabase" && <button type="button" className="linkbtn alt" onClick={() => { setUsePw(!usePw); setMsg(""); }}>{usePw ? "Use an email link instead" : "Email not arriving? Sign in with a password"}</button>}
              {msg && <p className="field-error" role="alert">{msg}</p>}
            </form>
          )}
          <p className="meta signin-note">Only @{ALLOWED_DOMAIN} addresses can sign in. The first 3 people get in straight away; after that the admin approves each request.{mode === "local" && " This deployment has no database connected yet, so progress is saved in this browser only."}</p>
        </section>
      </main>
    </div>
  );
}
