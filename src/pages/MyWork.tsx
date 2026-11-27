import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, ApiError } from "../lib/api";
import * as sub from "../lib/submissionsApi";
import { useMe } from "../lib/useRole";
import { PageHeader } from "../components/PageHeader";
import { TrackTabs } from "../components/TrackTabs";
import { Kpi } from "../components/Kpi";
import { StatusTag } from "../components/StatusTag";
import { ProofList } from "../components/ProofList";
import { Icon } from "../components/Icon";
import { EmptyState } from "../components/States";
import { PROGRAMME, parseTask, taskTitle } from "../data/programme";
import { DEVOPS_TOTAL_DAYS, parseDevopsTask } from "../data/devops";
import { BUILT } from "../data/builtWork";
import { downloadJson } from "../lib/csv";

const TOTAL_DAYS = PROGRAMME.reduce((a, w) => a + w.days.length, 0) + DEVOPS_TOTAL_DAYS;
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "");

/** Where a task lives in the programme, for sorting and for the link back to its day. */
function where(key: string): { track: number; week: number; day: number; to: string } {
  const f = parseTask(key); if (f) return { track: 0, week: f.week, day: f.day, to: `/week/${f.week}#wd${f.day}` };
  const d = parseDevopsTask(key); if (d) return { track: 1, week: d.week, day: d.day, to: `/devops/week/${d.week}#wd${d.day}` };
  return { track: 2, week: 0, day: 0, to: "/" };
}

/** One hand-in: its status, rating and proof. The proof is fetched when the card is opened. */
function Card({ row }: { row: sub.Row }) {
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState<sub.Submission | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!open || full) return;
    sub.get(row.task_key).then((s) => setFull(s)).catch((e) => setErr(e instanceof ApiError ? e.message : "Could not load this hand-in."));
  }, [open, full, row.task_key]);
  const w = where(row.task_key);
  return (
    <li className="card gap">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>{taskTitle(row.task_key)}</h3>
        <StatusTag status={row.status} />
      </div>
      <p className="meta tnum">{row.item_count} proof{row.item_count === 1 ? "" : "s"}{row.submitted_at ? ` · handed in ${when(row.submitted_at)}` : " · not handed in yet"}{row.last_comment ? " · has a reviewer comment" : ""}</p>
      <div className="row">
        <button type="button" className="copy" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Hide the work" : "Show the work"}</button>
        <Link className="small" to={w.to}>Open the day</Link>
      </div>
      {open && (
        <div>
          {err && <p className="banner err" role="alert">{err}</p>}
          {!full && !err && <p className="muted">Loading</p>}
          {full && (
            <>
              {full.note && <><h4>What I did</h4><p className="wrap">{full.note}</p></>}
              {full.learned && <><h4>What I learned</h4><p className="wrap">{full.learned}</p></>}
              {full.rating != null && <p><b>My rating:</b> {full.rating} of 5</p>}
              <h4>Proof</h4>
              <ProofList items={full.items} />
              {full.reviews.length > 0 && (<><h4>Review</h4>
                <ul className="plain">{full.reviews.map((r, i) => <li key={i}><b>{r.decision === "approve" ? "Approved" : "Changes requested"}</b> by {r.reviewer}{r.met != null && r.total ? ` · checklist ${r.met} of ${r.total}` : ""}{r.comment ? `: ${r.comment}` : ""}</li>)}</ul></>)}
            </>
          )}
        </div>
      )}
    </li>
  );
}

/** My work: the tools that were built, running live in this app, and every hand-in with its proof, in one place. */
export default function MyWork() {
  const { me, ready } = useMe();
  const [rows, setRows] = useState<sub.Row[] | null>(null);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState("all");
  const reviewer = me?.role === "reviewer";
  useEffect(() => {
    if (!API_URL || !ready || reviewer) return;
    sub.mine().then(setRows).catch((e) => { setRows([]); setErr(e instanceof ApiError ? e.message : "Could not load your hand-ins."); });
  }, [ready, reviewer]);

  const sorted = useMemo(() => [...(rows ?? [])].sort((a, b) => { const x = where(a.task_key), y = where(b.task_key); return x.track - y.track || x.week - y.week || x.day - y.day; }), [rows]);
  const shown = sorted.filter((r) => status === "all" || r.status === status);
  const n = (s: sub.Status) => (rows ?? []).filter((r) => r.status === s).length;
  const handed = (rows ?? []).filter((r) => r.status !== "draft").length;

  async function exportAll() {
    const out = [];
    for (const r of sorted) {
      const s = await sub.get(r.task_key).catch(() => null);
      if (s) out.push({ task: taskTitle(s.task_key), status: s.status, rating: s.rating, what_i_did: s.note, what_i_learned: s.learned, handed_in: s.submitted_at, proofs: s.items.map((i) => ({ name: i.label, link: i.url, file: i.file_name })), reviews: s.reviews });
    }
    downloadJson("my-work.json", out);
  }

  return (
    <>
      <PageHeader overline="Programme" title="My work" sub="What you built and handed in, with the proof, in one place" />
      <TrackTabs current="work" />

      <h2>Built in this app</h2>
      <p className="muted small">Each of these runs live here. Open it to show the actual work, and read its evidence page for the task, the measured results and what is not done.</p>
      <ul className="plain" style={{ display: "grid", gap: "var(--s-3)" }}>
        {BUILT.map((b) => (
          <li key={b.id} className="card gap">
            <p className="eyebrow">{b.week}, {b.days}</p>
            <h3 style={{ margin: 0 }}>{b.title}</h3>
            <p>{b.what}</p>
            <div className="row">
              <Link className="btn" to={b.open}>{b.openLabel}</Link>
              <a className="btn secondary" href={b.evidence} target="_blank" rel="noopener noreferrer">Evidence page<span className="sr"> (opens in a new tab)</span></a>
              {b.notebook && <a className="btn secondary" href={b.notebook} target="_blank" rel="noopener noreferrer">Step-by-step notebook (Colab)<span className="sr"> (opens in a new tab)</span></a>}
            </div>
          </li>
        ))}
      </ul>

      <h2>My hand-ins</h2>
      {!API_URL ? <div className="card"><p className="muted">The backend is not connected for this site.</p></div>
        : !ready || (rows === null && !reviewer) ? <p className="muted">Loading</p>
        : reviewer ? <div className="card"><p>Reviewers do not hand in work. Open <Link to="/review">Review</Link> to see what learners handed in.</p></div>
        : (
          <>
            <div className="kpis" aria-label="My hand-ins">
              <Kpi icon="file" label="Handed in" value={`${handed} of ${TOTAL_DAYS}`} sub="days with a hand-in" />
              <Kpi icon="check" label="Approved" value={String(n("approved"))} sub="reviewed and accepted" tone="ok" />
              <Kpi icon="clock" label="Waiting for review" value={String(n("submitted"))} sub="no decision yet" />
              <Kpi icon="alert" label="Changes requested" value={String(n("changes_requested"))} sub="sent back to you" tone={n("changes_requested") ? "bad" : undefined} />
            </div>
            {err && <p className="banner err" role="alert">{err}</p>}
            {sorted.length === 0
              ? <EmptyState icon="file" title="Nothing handed in yet" action={<Link className="btn" to="/week/1">Open Week 1</Link>}>Add links, screenshots or files under any day and they appear here.</EmptyState>
              : (
                <>
                  <div className="row" style={{ flexWrap: "wrap" }}>
                    <label htmlFor="mw-s" className="sr">Show</label>
                    <select id="mw-s" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="all">All hand-ins</option><option value="approved">Approved</option><option value="submitted">Waiting for review</option><option value="changes_requested">Changes requested</option><option value="draft">Drafts</option>
                    </select>
                    <button type="button" className="btn secondary" onClick={() => void exportAll()}><Icon name="download" size={16} />Download my work (JSON)</button>
                  </div>
                  <ul className="plain" style={{ display: "grid", gap: "var(--s-3)" }}>{shown.map((r) => <Card key={r.id} row={r} />)}</ul>
                  {shown.length === 0 && <p className="muted">Nothing in this view.</p>}
                </>
              )}
          </>
        )}
    </>
  );
}
