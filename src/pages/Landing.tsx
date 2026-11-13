import { FormEvent, useState } from "react";
import { useStore } from "../lib/store";
import { ALLOWED_DOMAIN } from "../lib/supabase";
import { WEEKS } from "../data/outline";

export default function Landing() {
  const { mode, signIn, localSignIn } = useStore();
  const [email, setEmail] = useState(""); const [msg, setMsg] = useState(""); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    if (mode === "supabase") { const err = await signIn(email); if (err) setMsg(err); else setSent(true); }
    else { const err = localSignIn(email); if (err) setMsg(err); }
    setBusy(false);
  }
  return (
    <main className="landing">
      <section className="lhero">
        <h1>Build the AI skills your role needs, one layer a day</h1>
        <p className="lead">The company FDE programme as a working tracker: the six-week outline, a ten-day fast track, and your own stack. Tick what you finish, keep your notes, and see your layers stack up.</p>
        <ol className="weeks">{WEEKS.map((w) => (<li key={w.n}><b>Week {w.n}</b><span>{w.focus}</span></li>))}</ol>
      </section>
      <section className="lform card">
        <h2>Sign in with your office email</h2>
        {sent ? (
          <p role="status">Check your inbox at <b>{email}</b>. The link signs you in on this device.</p>
        ) : (
          <form onSubmit={submit}>
            <label htmlFor="email">Office email</label>
            <input id="email" type="email" required autoComplete="email" placeholder={`you@${ALLOWED_DOMAIN}`} value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn" disabled={busy}>{mode === "supabase" ? "Email me a sign-in link" : "Continue"}</button>
            {msg && <p className="err" role="alert">{msg}</p>}
          </form>
        )}
        <p className="muted small">Only @{ALLOWED_DOMAIN} addresses can sign in.{mode === "local" && " This deployment has no database connected yet, so progress is saved in this browser only."}</p>
      </section>
    </main>
  );
}
