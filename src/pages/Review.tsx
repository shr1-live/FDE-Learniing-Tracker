import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { API_URL, ApiError } from "../lib/api";
import * as api from "../lib/submissionsApi";
import { canReview, useMe } from "../lib/useRole";
import { Kpi } from "../components/Kpi";
import { ProofList } from "../components/ProofList";
import { StatusTag } from "../components/StatusTag";
import { useDevPersona } from "../lib/devPersona";
import { ExpectedList } from "../components/ExpectedList";
import { Rubric } from "../components/Rubric";
import { parseTask, taskTitle } from "../data/programme";

/** Reply templates: one click puts a common comment in the box, to edit before sending. */
const TEMPLATES: [string, string][] = [
  ["Looks good", "Looks good. The proof shows what the day asks for."],
  ["Add a screenshot", "Please add a screenshot or a link that shows the result running."],
  ["Explain more", "Please explain in more detail what you did and why you chose that approach."],
  ["Missing evidence", "Some of the expected proof is missing. Check the list of expected evidence and add what is not there yet."],
  ["Rating too high", "The proof does not yet support that self-rating. Compare it with the rating guide and adjust it, or add evidence."],
];
const FILTERS: [string, string][] = [["submitted", "Waiting for review"], ["changes_requested", "Changes requested"], ["approved", "Approved"], ["all", "All"]];

/** Whole days since a proof was handed in; 2 or more is "overdue" for a reviewer. */
const waitDays = (iso: string | null) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : 0);
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "-");

export default function Review() {
  const persona = useDevPersona();
  const { me, ready } = useMe();
  const [status, setStatus] = useState("submitted");
  const [rows, setRows] = useState<api.Row[]>([]);
  const [counts, setCounts] = useState<api.Counts | null>(null);
  const [open, setOpen] = useState<api.Submission | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const listReq = useRef(0);
  const openReq = useRef(0);
  const parsed = open ? parseTask(open.task_key) : null;
  const refresh = useCallback(async () => {
    const mine = ++listReq.current;
    try {
      const [list, c] = await Promise.all([api.reviewList(status), api.reviewCounts()]);
      if (mine !== listReq.current) return; // a newer request has started: ignore this late answer
      setRows(list); setCounts(c); setError("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Could not load the submissions."); }
  }, [status]);

  useEffect(() => { if (canReview(me)) refresh(); }, [me, refresh]);
  useEffect(() => { setOpen(null); }, [persona]);

  async function openRow(id: string) {
    setError(""); setMessage(""); setComment("");
    const mine = ++openReq.current;
    try { const d = await api.reviewDetail(id); if (mine === openReq.current) setOpen(d); } catch (e) { setError(e instanceof ApiError ? e.message : "Could not open it."); }
  }

  async function choose(e: FormEvent, decision: "approve" | "request_changes") {
    e.preventDefault();
    if (!open) return;
    if (decision === "request_changes" && !comment.trim()) { setError("Say what needs to change."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      setOpen(await api.decide(open.id, decision, comment));
      setComment(""); setMessage(decision === "approve" ? "Approved." : "Sent back with your comment.");
      await refresh();
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not save your decision."); }
    finally { setBusy(false); }
  }

  async function approveMany() {
    setBusy(true); setError(""); setMessage("");
    let ok = 0, skipped = 0;
    for (const id of picked) { try { await api.decide(id, "approve", ""); ok++; } catch { skipped++; } }
    setPicked(new Set()); setMessage(`Approved ${ok}${skipped ? `, skipped ${skipped}` : ""}.`);
    await refresh(); setBusy(false);
  }

  if (!API_URL) return <><header className="ph"><h1>Review submissions</h1></header><div className="card"><p className="muted">The backend is not connected for this site.</p></div></>;
  if (!ready) return <p className="muted">Loading</p>;
  if (!canReview(me)) {
    return (
      <>
        <header className="ph"><h1>Review submissions</h1></header>
        <div className="card" role="status"><p>Only reviewers and admins can see this page.</p>
          <p className="muted small">If you should be a reviewer, ask an admin to change your role.</p></div>
      </>
    );
  }

  return (
    <>
      <header className="ph"><h1>Review submissions</h1>
        <p className="muted">Everyone's submitted work, newest decisions first. Open one to see the proof, then approve it or send it back with a comment. You cannot review your own work.</p></header>

      <div className="kpis" aria-label="Review summary">
        <Kpi icon="clock" label="Waiting for review" value={String(counts?.submitted ?? 0)} sub="submitted, no decision yet" />
        <Kpi icon="alert" label="Changes requested" value={String(counts?.changes_requested ?? 0)} sub="sent back to the person" />
        <Kpi icon="check" label="Approved" value={String(counts?.approved ?? 0)} sub="done" />
      </div>

      <div className="card">
        <label htmlFor="filter">Show</label>
        <select id="filter" value={status} onChange={(e) => { setStatus(e.target.value); setOpen(null); openReq.current++; }}>
          {FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {error && <p className="banner err" role="alert">{error}</p>}

      {status === "submitted" && rows.length > 0 && (
        <div className="row" style={{ marginBottom: "var(--s-2)" }}>
          <button type="button" className="btn secondary" onClick={() => setPicked(picked.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)))}>{picked.size === rows.length ? "Clear selection" : "Select all"}</button>
          <button type="button" className="btn" disabled={busy || picked.size === 0} onClick={() => void approveMany()}>Approve {picked.size || ""} selected</button>
          <span className="meta">Bulk approval skips your own work and anything that changed meanwhile.</span>
        </div>
      )}
      <div className="tablewrap gap" tabIndex={0} role="region" aria-label="Submissions, scrolls sideways on small screens">
        <table>
          <thead><tr>{status === "submitted" && <th><span className="sr">Select</span></th>}<th>Person</th><th>Task</th><th>Status</th><th>Proofs</th><th>Sent</th><th><span className="sr">Action</span></th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="muted">Nothing here.</td></tr>}
            {[...rows].sort((a, b) => (status === "submitted" ? (a.submitted_at ?? "").localeCompare(b.submitted_at ?? "") : 0)).map((r) => (
              <tr key={r.id}>
                {status === "submitted" && <td><input type="checkbox" aria-label={`Select ${r.author}, ${taskTitle(r.task_key)}`} checked={picked.has(r.id)} onChange={() => setPicked((p) => { const n = new Set(p); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} /></td>}<td>{r.author}</td><td>{taskTitle(r.task_key)}</td><td><StatusTag status={r.status} /></td><td>{r.item_count}</td><td>{when(r.submitted_at)}{r.status === "submitted" && waitDays(r.submitted_at) >= 2 && <span className="sla" title="Waiting more than 2 days"> · waiting {waitDays(r.submitted_at)} days</span>}</td>
                <td><button type="button" className="copy" onClick={() => openRow(r.id)} aria-label={`Open ${r.author}'s ${taskTitle(r.task_key)}`}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <section className="card gap" aria-labelledby="detail-h">
          <h2 id="detail-h">{open.author}: {taskTitle(open.task_key)} <StatusTag status={open.status} /></h2>
          <p className="muted small">Sent {when(open.submitted_at)}</p>
          {open.note && <><h3>What they did</h3><p className="wrap">{open.note}</p></>}
          {open.learned && <><h3>What they learned</h3><p className="wrap">{open.learned}</p></>}
          {open.rating != null && <p><b>Their own rating:</b> {open.rating} of 5</p>}
          <h3>Proof</h3>
          <ProofList items={open.items} />
          {parsed && <ExpectedList week={parsed.week} day={parsed.day} open />}
          {parsed && open.status === "submitted" && <Rubric week={parsed.week} day={parsed.day} resetKey={open.id} onUnmet={(lines) => setComment((c) => (c ? c + "\n" : "") + lines.join("\n"))} />}

          {open.reviews.length > 0 && (
            <>
              <h3>History</h3>
              <ul className="plain">
                {open.reviews.map((r, i) => (
                  <li key={i}><b>{r.decision === "approve" ? "Approved" : "Changes requested"}</b> by {r.reviewer}, {when(r.created_at)}{r.comment ? `: ${r.comment}` : ""}</li>
                ))}
              </ul>
            </>
          )}

          {open.status === "submitted" ? (
            <form onSubmit={(e) => choose(e, "approve")}>
              <h3>Your decision</h3>
              <label htmlFor="comment">Comment (needed if you send it back)</label>
              <div className="tpl-row" role="group" aria-label="Reply templates">{TEMPLATES.map(([l, t]) => <button key={l} type="button" className="fchip" onClick={() => setComment((c) => (c ? c + "\n" : "") + t)}>{l}</button>)}</div>
              <textarea id="comment" rows={3} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} />
              <div className="row">
                <button className="btn" disabled={busy}>Approve</button>
                <button type="button" className="copy" disabled={busy} onClick={(e) => choose(e, "request_changes")}>Request changes</button>
              </div>
            </form>
          ) : <p className="muted">This submission is {open.status === "approved" ? "approved" : "waiting for the person to resubmit"}.</p>}
          <p className="small" role="status" aria-live="polite">{message}</p>
        </section>
      )}
    </>
  );
}
