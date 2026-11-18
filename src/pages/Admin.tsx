import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useStore } from "../lib/store";
import { stackById } from "../data/stacks";

type Req = { email: string; status: "pending" | "approved" | "rejected"; requested_at: string };
type Prog = { email: string | null; display_name: string | null; stack: string; pct: number; updated_at: string };

export default function Admin() {
  const { isAdmin } = useStore();
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [prog, setProg] = useState<Prog[]>([]);
  const [err, setErr] = useState("");
  const load = useCallback(async () => {
    if (!supabase) return;
    const [a, b] = await Promise.all([
      supabase.from("access_requests").select("email,status,requested_at").order("requested_at", { ascending: false }),
      supabase.from("profiles").select("email,display_name,stack,pct,updated_at").order("pct", { ascending: false }),
    ]);
    if (a.error) setErr(a.error.message);
    setReqs((a.data as Req[]) ?? []); setProg((b.data as Prog[]) ?? []);
  }, []);
  useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);
  if (!isAdmin) return <Navigate to="/" replace />;
  async function decide(email: string, status: "approved" | "rejected") {
    if (!supabase) return;
    const { error } = await supabase.from("access_requests").update({ status, decided_at: new Date().toISOString() }).eq("email", email);
    if (error) setErr(error.message); else void load();
  }
  const pend = (reqs ?? []).filter((r) => r.status === "pending");
  return (
    <>
      <header className="ph"><h1>Admin</h1><p className="muted">Only you can see this page. The first three people get in automatically; everyone after that waits here for your tap.</p></header>
      {err && <p className="banner err" role="alert">{err}</p>}
      <h2>Waiting for approval <small>{pend.length}</small></h2>
      {reqs === null ? <p className="muted">Loading</p> : pend.length === 0 ? <p className="muted">No one is waiting.</p> : (
        <ul className="reqs">{pend.map((r) => (
          <li key={r.email} className="card">
            <div><b>{r.email}</b><br /><small className="muted">asked {new Date(r.requested_at).toLocaleString()}</small></div>
            <div className="row"><button className="btn" onClick={() => decide(r.email, "approved")}>Approve</button><button className="btn ghost" onClick={() => decide(r.email, "rejected")}>Reject</button></div>
          </li>))}</ul>
      )}
      <h2>Everyone</h2>
      <div className="tablewrap"><table>
        <thead><tr><th>Email</th><th>Status</th><th>Progress</th><th /></tr></thead>
        <tbody>{(reqs ?? []).map((r) => { const p = prog.find((x) => x.email?.toLowerCase() === r.email); return (
          <tr key={r.email}><td>{r.email}</td><td><span className={"tag st-" + r.status}>{r.status}</span></td>
            <td>{p ? <><span className="meter small" aria-hidden="true"><i style={{ width: p.pct + "%" }} /></span> {p.pct}% · {stackById(p.stack).label}</> : <span className="muted">-</span>}</td>
            <td>{r.status === "approved" ? <button className="copy" onClick={() => decide(r.email, "rejected")}>Revoke</button> : <button className="copy" onClick={() => decide(r.email, "approved")}>Approve</button>}</td></tr>); })}</tbody>
      </table></div>
    </>
  );
}
