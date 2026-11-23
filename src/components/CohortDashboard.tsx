import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../lib/api";
import * as rep from "../lib/reportsApi";
import { downloadCsv } from "../lib/csv";
import { PROGRAMME } from "../data/programme";
import { Kpi } from "./Kpi";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";
import { EmptyState, ErrorState, TableSkeleton } from "./States";

const TOTAL = PROGRAMME.reduce((a, w) => a + w.days.length, 0);
const DAY_MS = 86400000;
const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);

/** The cohort at a glance for reviewers and the admin: who is ahead, who is behind, who has gone quiet, and an Excel export. */
export function CohortDashboard() {
  const [rows, setRows] = useState<rep.PersonRow[] | null>(null);
  const [err, setErr] = useState("");
  const [batch, setBatch] = useState("");
  const load = () => { setErr(""); setRows(null); rep.people().then(setRows).catch((e) => { setErr(e instanceof ApiError ? e.message : "Could not load the cohort."); setRows([]); }); };
  useEffect(load, []);
  const batches = [...new Set((rows ?? []).map((r) => r.batch_name).filter(Boolean))] as string[];
  const shown = useMemo(() => (rows ?? []).filter((r) => !batch || r.batch_name === batch), [rows, batch]);
  const done = (r: rep.PersonRow) => r.approved + r.submitted;
  const quiet = (r: rep.PersonRow) => !r.last_activity || Date.now() - new Date(r.last_activity).getTime() > 3 * DAY_MS;
  const behind = shown.filter((r) => done(r) === 0 || quiet(r));
  const ahead = [...shown].sort((a, b) => done(b) - done(a)).slice(0, 3).filter((r) => done(r) > 0);
  const ratings = shown.map((r) => r.avg_rating).filter((x): x is number => x !== null);

  const exportCsv = () => downloadCsv(`fde-cohort-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Name", "Batch", "Approved", "Waiting for review", "Changes asked", "Saved not submitted", "Days handed in", "Of", "Average self-rating", "Last activity"],
    shown.map((r) => [r.name, r.batch_name ?? "", r.approved, r.submitted, r.changes_requested, r.drafts, done(r), TOTAL, r.avg_rating ?? "", r.last_activity ? r.last_activity.slice(0, 10) : ""]));

  if (err) return <ErrorState title="Could not load the cohort" message={err} onRetry={load} />;
  if (rows === null) return <TableSkeleton cols={5} />;
  if (rows.length === 0) return <EmptyState icon="users" title="No one yet">The dashboard fills in once people are in a batch and hand in work.</EmptyState>;
  return (
    <>
      <div className="toolbar">
        {batches.length > 0 && <div className="select-wrap"><label htmlFor="co-b" className="sr">Batch</label><select id="co-b" value={batch} onChange={(e) => setBatch(e.target.value)}><option value="">All batches</option>{batches.map((b) => <option key={b}>{b}</option>)}</select></div>}
        <span className="grow" />
        <button type="button" className="btn secondary" onClick={exportCsv}><Icon name="download" size={16} />Export to Excel (CSV)</button>
      </div>
      <div className="kpis" aria-label="Cohort totals">
        <Kpi icon="users" label="People" value={String(shown.length)} sub={batch || "all batches"} />
        <Kpi icon="check" label="Days approved" value={String(shown.reduce((a, r) => a + r.approved, 0))} sub={`out of ${shown.length * TOTAL} possible`} tone="ok" />
        <Kpi icon="inbox" label="Waiting for review" value={String(shown.reduce((a, r) => a + r.submitted, 0))} sub="handed in, no decision" />
        <Kpi icon="target" label="Average self-rating" value={String(avg(ratings) ?? "-")} sub="out of 5" />
      </div>
      <div className="home-grid">
        <div className="home-main">
          <section className="card" aria-labelledby="co-h">
            <h2 id="co-h">Completion by person</h2>
            <ul className="co-bars">
              {[...shown].sort((a, b) => done(b) - done(a)).map((r) => (
                <li key={r.id}>
                  <Link to={`/progress/${r.id}`} className="people-name"><Avatar name={r.name} size="sm" />{r.name}</Link>
                  <div className="co-track" role="img" aria-label={`${r.name}: ${r.approved} approved, ${r.submitted} waiting, of ${TOTAL} days`}>
                    <span className="a" style={{ width: `${(r.approved / TOTAL) * 100}%` }} /><span className="s" style={{ width: `${(r.submitted / TOTAL) * 100}%` }} />
                  </div>
                  <span className="tnum meta">{done(r)}/{TOTAL}</span>
                </li>
              ))}
            </ul>
            <p className="meta">Dark = approved, light = waiting for review. Of {TOTAL} published days.</p>
          </section>
        </div>
        <aside className="home-side">
          <section className="card" aria-labelledby="bh-h">
            <h2 id="bh-h">Needs a nudge {behind.length > 0 && <small>{behind.length}</small>}</h2>
            {behind.length === 0 ? <p className="muted">Everyone has been active in the last 3 days.</p> : (
              <ul className="plain">{behind.map((r) => <li key={r.id}><Link to={`/progress/${r.id}`}>{r.name}</Link> <small className="meta">{done(r) === 0 ? "nothing handed in" : `last active ${new Date(r.last_activity!).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`}</small></li>)}</ul>
            )}
          </section>
          {ahead.length > 0 && (
            <section className="card" aria-labelledby="ah-h"><h2 id="ah-h">Ahead</h2>
              <ul className="plain">{ahead.map((r) => <li key={r.id}><Link to={`/progress/${r.id}`}>{r.name}</Link> <small className="meta">{done(r)} days handed in</small></li>)}</ul>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
