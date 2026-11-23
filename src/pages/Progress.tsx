import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { API_URL, ApiError } from "../lib/api";
import * as rep from "../lib/reportsApi";
import { useMe } from "../lib/useRole";
import { useView } from "../lib/viewAs";
import { PROGRAMME, taskKey } from "../data/programme";
import { RATING_GUIDE } from "../data/weekExpect";
import { dueDate, fmtDate, parseDay, type Tone } from "../lib/backlog";
import { Chip } from "../components/Chip";
import { Icon } from "../components/Icon";
import { Kpi } from "../components/Kpi";
import { PageHeader } from "../components/PageHeader";
import { CohortDashboard } from "../components/CohortDashboard";
import { Tabs, TabPanel, useTab } from "../components/Tabs";
import { Avatar } from "../components/Avatar";
import { ErrorState, Loading, PageSkeleton, Skeleton, TableSkeleton, EmptyState } from "../components/States";

const Week1Report = lazy(() => import("./Week1Report"));
const FILTERS: [string, string][] = [["all", "All days"], ["approved", "Approved"], ["submitted", "Waiting for review"], ["changes_requested", "Changes asked"], ["open", "Not handed in"]];

const msg = (e: unknown) => (e instanceof ApiError ? e.message : "Could not load the report. Try again.");
const day = (iso: string | null) => (iso ? fmtDate(new Date(iso)) : "");
const STATUS: Record<string, [string, "ok" | "warn" | "bad" | "info" | "none"]> = {
  approved: ["Approved", "ok"], submitted: ["Waiting for review", "info"], changes_requested: ["Changes asked", "bad"], draft: ["Saved, not submitted", "warn"],
};

/** Working days late (Monday to Friday) between the due date and when it was handed in; 0 = on time. */
function lateBy(due: Date, handedIn: Date): number {
  const d = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const h = new Date(handedIn.getFullYear(), handedIn.getMonth(), handedIn.getDate());
  let n = 0;
  while (d < h) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) n++; }
  return n;
}

/** One person's report: a summary per week (end of week) and a row per day (end of day). */
export function ReportView({ report, own }: { report: rep.PersonReport; own: boolean }) {
  const start = report.person.batch ? parseDay(report.person.batch.starts_on) : null;
  const today = new Date();
  const byKey = useMemo(() => new Map(report.days.map((d) => [d.task_key, d])), [report]);
  const [filter, setFilter] = useState("all");
  /** Closed sections would print empty, so open them for the print dialog and close them again afterwards. */
  const print = () => {
    const closed = [...document.querySelectorAll<HTMLDetailsElement>("main details:not([open])")];
    closed.forEach((d) => { d.open = true; });
    const restore = () => { closed.forEach((d) => { d.open = false; }); window.removeEventListener("afterprint", restore); };
    window.addEventListener("afterprint", restore);
    window.print();
  };
  return (
    <>
      <div className="kpis" aria-label="Totals">
        <Kpi icon="check" label="Approved" value={String(report.totals.approved)} sub="days accepted by a reviewer" tone="ok" />
        <Kpi icon="inbox" label="Waiting" value={String(report.totals.submitted)} sub="handed in, not reviewed yet" />
        <Kpi icon="alert" label="Changes asked" value={String(report.totals.changes_requested)} sub="sent back by a reviewer" tone={report.totals.changes_requested ? "bad" : undefined} />
        <Kpi icon="target" label="Average self-rating" value={String(report.totals.avg_rating ?? "-")} sub="out of 5, over handed-in days" />
      </div>
      <div className="toolbar noprint">
        <div className="fchips" role="group" aria-label="Show days">
          {FILTERS.map(([v, l]) => <button key={v} type="button" className="fchip" aria-pressed={filter === v} onClick={() => setFilter(v)}>{l}</button>)}
        </div>
        <div className="grow" />
        <button type="button" className="btn secondary" onClick={print}><Icon name="print" size={16} />Print or save as PDF</button>
      </div>
      {PROGRAMME.map((w) => {
        const rows = w.days.map((d) => {
          const r = byKey.get(taskKey(w.n, d.n)) ?? null;
          const due = start ? dueDate(start, d.n) : null;
          const handed = r?.submitted_at ? new Date(r.submitted_at) : null;
          const late = due && handed ? lateBy(due, handed) : null;
          const overdue = !!due && !handed && due < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return { d, r, due, handed, late, overdue };
        });
        const shown = rows.filter((x) => filter === "all" || (filter === "open" ? !x.handed : x.r?.status === filter));
        const approved = rows.filter((x) => x.r?.status === "approved").length;
        const handedIn = rows.filter((x) => x.handed).length;
        const onTime = rows.filter((x) => x.late === 0).length;
        const ratings = rows.map((x) => x.r?.rating).filter((v): v is number => typeof v === "number");
        const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "-";
        const missing = rows.filter((x) => !x.handed).map((x) => `Day ${x.d.n}`);
        return (
          <section key={w.n} className="card reportweek" aria-labelledby={`rw-${w.n}`}>
            <div className="work-head"><h2 id={`rw-${w.n}`}>Week {w.n} report</h2><Chip tone={approved === w.days.length ? "ok" : handedIn ? "info" : "none"}>{approved === w.days.length ? "Week complete" : `${approved} of ${w.days.length} approved`}</Chip></div>
            <p className="muted">
              Handed in {handedIn} of {w.days.length}{start ? `, ${onTime} on time` : ""} · average self-rating {avg}
              {missing.length ? ` · not handed in: ${missing.join(", ")}` : ""}
            </p>
            <div className="tablewrap" tabIndex={0} role="region" aria-label={`Week ${w.n} day by day, scrolls sideways on small screens`}>
              <table>
                <thead><tr><th scope="col">Day</th><th scope="col">Status</th><th scope="col">Handed in</th><th scope="col">Self-rating</th><th scope="col">Reviewer</th></tr></thead>
                <tbody>
                  {shown.length === 0 && <tr><td colSpan={5} className="muted">No days match this filter.</td></tr>}
                  {shown.map(({ d, r, due, handed, late, overdue }) => {
                    const [label, tone]: [string, Tone] = r ? STATUS[r.status] ?? [r.status, "none"] : overdue ? ["Missed", "bad"] : ["Not handed in", "none"];
                    return (
                      <tr key={d.n}>
                        <td><b>Day {d.n}</b><br /><span className="small">{d.title}</span>{due && <><br /><span className="small muted">due {fmtDate(due)}</span></>}</td>
                        <td><Chip tone={tone}>{label}</Chip>{r && r.item_count > 0 && <><br /><span className="small muted">{r.item_count} proof item{r.item_count === 1 ? "" : "s"}</span></>}</td>
                        <td className="tnum">{handed ? <>{fmtDate(handed)}{late !== null && <><br /><span className={"small " + (late ? "err" : "muted")}>{late ? `${late} working day${late === 1 ? "" : "s"} late` : "on time"}</span></>}</> : "-"}</td>
                        <td>{r?.rating ? <span title={RATING_GUIDE[r.rating - 1]?.[1]}><b>{r.rating}</b> <span className="small muted">{RATING_GUIDE[r.rating - 1]?.[1]}</span></span> : "-"}</td>
                        <td>{r?.last_decision ? <><b>{r.last_decision === "approve" ? "Approved" : "Asked for changes"}</b>{r.last_reviewer ? ` by ${r.last_reviewer}` : ""}{r.reviewed_at ? `, ${day(r.reviewed_at)}` : ""}{r.last_comment && <p className="small wrap">"{r.last_comment}"</p>}</> : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {rows.some((x) => x.r?.learned) && (
              <details className="mini gap"><summary>What {own ? "I" : "they"} learned, day by day</summary>
                <dl className="kv small">{rows.filter((x) => x.r?.learned).map(({ d, r }) => <div key={d.n}><dt>Day {d.n}: {d.title}</dt><dd className="wrap">{r!.learned}</dd></div>)}</dl>
              </details>
            )}
          </section>
        );
      })}
    </>
  );
}

function PeopleList() {
  const [rows, setRows] = useState<rep.PersonRow[] | null>(null);
  const [err, setErr] = useState("");
  const [batch, setBatch] = useState("");
  const [q, setQ] = useState("");
  const load = () => { setErr(""); setRows(null); rep.people().then(setRows).catch((e) => { setErr(msg(e)); setRows([]); }); };
  useEffect(load, []);
  const batches = [...new Set((rows ?? []).map((r) => r.batch_name).filter(Boolean))] as string[];
  const shown = (rows ?? []).filter((r) => (!batch || r.batch_name === batch) && (!q.trim() || r.name.toLowerCase().includes(q.trim().toLowerCase())));
  return (
    <>
      <header className="ph"><p className="muted">Progress day by day and week by week, from what people handed in and what reviewers decided. Open a person for their full report.</p></header>
      {err && <ErrorState title="Could not load the reports" message={err} onRetry={load} />}
      {!err && (
        <>
          <div className="toolbar">
            <div className="search grow"><Icon name="search" size={16} /><label htmlFor="rp-q" className="sr">Search people</label><input id="rp-q" type="search" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            {batches.length > 0 && (
              <div className="select-wrap"><label htmlFor="rp-batch" className="sr">Batch</label><select id="rp-batch" value={batch} onChange={(e) => setBatch(e.target.value)}><option value="">All batches</option>{batches.map((b) => <option key={b}>{b}</option>)}</select></div>
            )}
          </div>
          {rows === null ? <TableSkeleton cols={6} /> : shown.length === 0 ? (
            <EmptyState icon="users" title={q || batch ? "No one matches" : "No reports yet"}>{q || batch ? "Try a shorter name or another batch." : "Reports appear here once people are in a batch and hand in work."}</EmptyState>
          ) : (
            <div className="tablewrap" tabIndex={0} role="region" aria-label="People and their progress, scrolls sideways on small screens">
              <table>
                <thead><tr><th scope="col">Person</th><th scope="col">Batch</th><th scope="col">Approved</th><th scope="col">Waiting</th><th scope="col">Changes asked</th><th scope="col">Avg rating</th><th scope="col">Last activity</th></tr></thead>
                <tbody>{shown.map((r) => (
                  <tr key={r.id}>
                    <td><Link to={`/progress/${r.id}`} className="people-name"><Avatar name={r.name} size="sm" />{r.name}</Link></td>
                    <td>{r.batch_name ?? <span className="muted">-</span>}</td>
                    <td className="tnum">{r.approved}</td><td className="tnum">{r.submitted}</td><td className="tnum">{r.changes_requested}</td>
                    <td className="tnum">{r.avg_rating ?? "-"}</td><td className="tnum">{r.last_activity ? day(r.last_activity) : "-"}</td>
                  </tr>))}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}

function OneReport({ id }: { id: string | null }) {
  const [report, setReport] = useState<rep.PersonReport | null>(null);
  const [err, setErr] = useState("");
  const load = () => { setReport(null); setErr(""); (id ? rep.personReport(id) : rep.myReport()).then(setReport).catch((e) => setErr(msg(e))); };
  useEffect(load, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const intro = <>{report?.person.batch ? `${report.person.batch.name}, started ${fmtDate(parseDay(report.person.batch.starts_on) ?? new Date())}. ` : ""}End of each day: what was handed in, when, the self-rating and the reviewer's decision. End of each week: the summary at the top of each week.</>;
  return (
    <>
      {!id && <header className="ph"><p className="muted">{intro}</p></header>}
      {id && <PageHeader overline={<Link to="/progress" className="noprint">All reports</Link>} title={report ? `${report.person.name}: report` : "Report"} sub={intro} />}
      {err && <ErrorState title="Could not load the report" message={err} onRetry={load} />}
      {!report && !err && <Loading label="Loading the report"><div className="kpis"><Skeleton h={76} r={10} /><Skeleton h={76} r={10} /><Skeleton h={76} r={10} /><Skeleton h={76} r={10} /></div><Skeleton h={220} r={10} /></Loading>}
      {report && <ReportView report={report} own={!id} />}
    </>
  );
}

/** /progress: my report (learner view) or everyone's (reviewer view), plus the Week 1 results; /progress/:id: one person (reviewers and the admin). */
export default function Progress() {
  const { id } = useParams();
  const { me, ready } = useMe();
  const { reviewerView, canSwitch } = useView();
  const tabs = [{ id: "report", label: reviewerView ? "Reports" : "My report" }, ...(reviewerView ? [{ id: "cohort", label: "Cohort dashboard" }] : []), { id: "week1", label: "Week 1 results" }];
  const tab = useTab(tabs);
  if (id) {
    if (!canSwitch) return ready ? <Navigate to="/progress" replace /> : <PageSkeleton />;
    return <OneReport id={id} />;
  }
  const needs = !API_URL ? "Reports need the backend, which is not connected for this site." : ready && !me ? "Sign in with your office account to see reports." : "";
  return (
    <>
      <PageHeader overline="Progress" title={reviewerView ? "Reports" : "My progress"} sub={tab === "week1" ? "What was built in Week 1, what is proven, and what is still to do." : reviewerView ? "How everyone is doing." : "What you handed in, and what reviewers decided."} />
      <Tabs tabs={tabs} current={tab} label="Progress views" />
      <TabPanel label={tab === "week1" ? "Week 1 results" : tab === "cohort" ? "Cohort dashboard" : tabs[0]!.label}>
        {tab === "cohort" ? (needs ? <div className="card" role="status"><p className="muted">{needs}</p></div> : <CohortDashboard />)
          : tab === "week1"
          ? <Suspense fallback={<PageSkeleton />}><Week1Report /></Suspense>
          : needs ? <div className="card" role="status"><p className="muted">{needs}</p></div>
          : reviewerView ? <PeopleList /> : <OneReport id={null} />}
      </TabPanel>
    </>
  );
}
