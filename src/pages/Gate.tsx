import { useStore } from "../lib/store";
import { Icon } from "../components/Icon";
import { Logo } from "../components/Logo";

export default function Gate() {
  const { access, user, signOut, recheck } = useStore();
  const pending = access === "pending";
  return (
    <main className="center-page" id="main">
      <section className="card center-card" aria-labelledby="gate-h">
        <div className="brand"><Logo /><span className="brand-name">FDE Training</span></div>
        <span className={"center-icon" + (pending ? "" : " warn")} aria-hidden="true"><Icon name={pending ? "clock" : "alert"} size={22} /></span>
        <h1 id="gate-h">{pending ? "Waiting for approval" : access === "rejected" ? "Access not granted" : "Something went wrong"}</h1>
        <p className="muted">
          {pending && <>The free seats are taken, so your request was sent to the admin. This page opens by itself as soon as you are approved.</>}
          {access === "rejected" && <>The admin did not approve this account. Contact them if you think this is a mistake.</>}
          {access === "error" && <>We could not check your access. Make sure the database setup has been run, then try again.</>}
        </p>
        <p className="meta">Signed in as {user?.email}</p>
        <div className="row center">
          <button className="btn" onClick={recheck}><Icon name="refresh" size={16} />Check again</button>
          <button className="btn secondary" onClick={signOut}>Sign out</button>
        </div>
      </section>
    </main>
  );
}
