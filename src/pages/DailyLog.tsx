import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL, ApiError } from "../lib/api";
import * as dl from "../lib/dailyLogApi";
import { addDays, mondayOf } from "../lib/dailyLogApi";
import { isoDay } from "../lib/backlog";
import { useView } from "../lib/viewAs";
import { useConfirm } from "../components/Confirm";
import { Icon } from "../components/Icon";
import { Kpi } from "../components/Kpi";
import { Chip } from "../components/Chip";
import { PageHeader } from "../components/PageHeader";
import { Tabs, TabPanel, useTab } from "../components/Tabs";
import { EmptyState, ErrorState, Loading, TableSkeleton } from "../components/States";

type Row = { id: number; task: string; cells: Record<string, { h: string; n: string }> };
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const msg = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Try again.");
const num = (s: string) => { const n = Number(s.replace(",", ".")); return Number.isFinite(n) && n >= 0 ? n : 0; };

function toRows(w: dl.LogWeek): Row[] {
  const by = new Map<string, Row>(); let id = 0;
  for (const c of w.cells) {
    const r = by.get(c.task.toLowerCase()) ?? { id: ++id, task: c.task, cells: {} };
    r.cells[c.date] = { h: String(c.hours), n: c.note ?? "" };
    by.set(c.task.toLowerCase(), r);
  }
  return [...by.values()];
}

/** The week navigator shared by both tabs. */
function WeekNav({ monday, setMonday }: { monday: Date; setMonday: (d: Date) => void }) {
  const end = addDays(monday, 4);
  const f = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return (
    <div className="cal-head">
      <button type="button" className="iconbtn" aria-label="Previous week" onClick={() => setMonday(addDays(monday, -7))}><Icon name="left" /></button>
      <h2>{f(monday)} to {f(end)} {end.getFullYear()}</h2>
      <button type="button" className="iconbtn" aria-label="Next week" onClick={() => setMonday(addDays(monday, 7))}><Icon name="right" /></button>
    </div>
  );
}

/** My week: tasks as rows, days as columns, hours and an optional note in each cell. */
function MyWeek({ monday, setMonday }: { monday: Date; setMonday: (d: Date) => void }) {
  const key = isoDay(monday);
  const days = DOW.map((_, i) => isoDay(addDays(monday, i)));
  const [week, setWeek] = useState<dl.LogWeek | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(""); const [ok, setOk] = useState("");
  const confirm = useConfirm();
  const load = useCallback(() => { setWeek(null); setErr(""); setDirty(false); dl.getWeek(key).then((w) => { setWeek(w); setRows(toRows(w)); }).catch((e) => setErr(msg(e))); }, [key]);
  useEffect(load, [load]);

  const edit = (f: (r: Row[]) => Row[]) => { setRows(f); setDirty(true); setOk(""); };
  const cell = (r: Row, d: string) => r.cells[d] ?? { h: "", n: "" };
  const setCell = (id: number, d: string, p: Partial<{ h: string; n: string }>) => edit((rs) => rs.map((r) => r.id === id ? { ...r, cells: { ...r.cells, [d]: { ...cell(r, d), ...p } } } : r));
  const dayTotal = (d: string) => rows.reduce((a, r) => a + num(cell(r, d).h), 0);
  const total = days.reduce((a, d) => a + dayTotal(d), 0);
  const cellsOut = useMemo<dl.Cell[]>(() => rows.flatMap((r) => days.map((d) => ({ task: r.task.trim(), date: d, hours: num(cell(r, d).h), note: cell(r, d).n.trim() || null })).filter((c) => c.hours > 0 || c.note)), [rows, key]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setBusy(true); setErr(""); setOk("");
    try { const w = await dl.saveWeek(key, cellsOut); setWeek(w); setRows(toRows(w)); setDirty(false); setOk("Saved."); } catch (e) { setErr(msg(e)); } finally { setBusy(false); }
  };
  const submit = async () => {
    if (!(await confirm({ title: "Submit this week?", body: `You have logged ${total} hours. Your reviewer will see the week as submitted. You can still change it; that clears the submitted mark until you submit again.`, confirm: "Submit week" }))) return;
    setBusy(true); setErr(""); setOk("");
    try { if (dirty) await dl.saveWeek(key, cellsOut); const w = await dl.submitWeek(key); setWeek(w); setRows(toRows(w)); setDirty(false); setOk("Week submitted."); } catch (e) { setErr(msg(e)); } finally { setBusy(false); }
  };

  if (err && !week) return <ErrorState title="Could not load the week" message={err} onRetry={load} />;
  if (!week) return <Loading label="Loading your week"><TableSkeleton cols={7} /></Loading>;
  return (
    <>
      <WeekNav monday={monday} setMonday={(d) => { if (!dirty || window.confirm("You have unsaved changes. Leave this week?")) setMonday(d); }} />
      <div className="kpis" aria-label="Week totals">
        <Kpi icon="clock" label="Hours this week" value={String(Math.round(total * 100) / 100)} sub={`${days.filter((d) => dayTotal(d) > 0).length} of 5 days logged`} />
        <Kpi icon="check" label="Status" value={week.submitted_at && !dirty ? "Submitted" : dirty ? "Unsaved" : "Open"} sub={week.submitted_at && !dirty ? new Date(week.submitted_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "not submitted yet"} tone={week.submitted_at && !dirty ? "ok" : undefined} />
      </div>
      <div className="tablewrap dl-wrap" tabIndex={0} role="region" aria-label="Daily log: tasks and hours per day, scrolls sideways on small screens">
        <table className="dl-table">
          <thead><tr><th scope="col">Task</th>{days.map((d, i) => <th key={d} scope="col" className="dl-day">{DOW[i]}<small>{new Date(d + "T00:00").getDate()}</small></th>)}<th scope="col" className="dl-day">Total</th><th scope="col"><span className="sr">Remove</span></th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} className="muted">No tasks yet. Add the first one below.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row"><label className="sr" htmlFor={`t${r.id}`}>Task name</label><input id={`t${r.id}`} value={r.task} maxLength={120} onChange={(e) => edit((rs) => rs.map((x) => x.id === r.id ? { ...x, task: e.target.value } : x))} placeholder="Task name" /></th>
                {days.map((d, i) => {
                  const c = cell(r, d);
                  return (
                    <td key={d} className="dl-cell">
                      <input inputMode="decimal" aria-label={`${r.task || "Task"}, ${DOW[i]}: hours`} value={c.h} maxLength={5} onChange={(e) => setCell(r.id, d, { h: e.target.value })} placeholder="0" />
                      <details className="dl-note" open={!!c.n}><summary aria-label={`Note for ${DOW[i]}`}>{c.n ? "note" : "+ note"}</summary>
                        <input aria-label={`${r.task || "Task"}, ${DOW[i]}: note`} value={c.n} maxLength={500} onChange={(e) => setCell(r.id, d, { n: e.target.value })} placeholder="What you did" /></details>
                    </td>
                  );
                })}
                <td className="dl-day tnum">{Math.round(days.reduce((a, d) => a + num(cell(r, d).h), 0) * 100) / 100}</td>
                <td><button type="button" className="iconbtn" aria-label={`Remove ${r.task || "this task"}`} onClick={() => edit((rs) => rs.filter((x) => x.id !== r.id))}><Icon name="trash" size={16} /></button></td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><th scope="row">Total per day</th>{days.map((d) => <td key={d} className={"dl-day tnum" + (dayTotal(d) > 24 ? " bad" : "")}>{Math.round(dayTotal(d) * 100) / 100}</td>)}<td className="dl-day tnum">{Math.round(total * 100) / 100}</td><td /></tr></tfoot>
        </table>
      </div>
      <div className="row" style={{ marginTop: "var(--s-3)" }}>
        <button type="button" className="btn secondary" onClick={() => edit((rs) => [...rs, { id: Math.max(0, ...rs.map((r) => r.id)) + 1, task: "", cells: {} }])}><Icon name="plus" size={16} />Add a task</button>
        <button type="button" className="btn" disabled={busy || !dirty} onClick={() => void save()}>{busy ? "Saving" : "Save"}</button>
        <button type="button" className="btn" disabled={busy || total === 0} onClick={() => void submit()}>Submit week</button>
      </div>
      <p className="small" role="status" aria-live="polite">{ok}</p>
      {err && <p className="banner err" role="alert">{err}</p>}
      <p className="meta">Hours are per task per weekday (up to 24 in a day). Saving replaces the week with what you see here.</p>
    </>
  );
}

/** Reviewers and the admin: hours and submit status for everyone for one week. */
function Team({ monday, setMonday }: { monday: Date; setMonday: (d: Date) => void }) {
  const key = isoDay(monday);
  const [rows, setRows] = useState<dl.LogSummaryRow[] | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => { setRows(null); setErr(""); dl.summary(key).then(setRows).catch((e) => { setErr(msg(e)); setRows([]); }); }, [key]);
  useEffect(load, [load]);
  const missing = (rows ?? []).filter((r) => r.days_logged === 0).length;
  return (
    <>
      <WeekNav monday={monday} setMonday={setMonday} />
      {err ? <ErrorState title="Could not load the team" message={err} onRetry={load} /> : rows === null ? <TableSkeleton cols={5} /> : rows.length === 0 ? <EmptyState icon="users" title="No one yet">People appear here once they are approved.</EmptyState> : (
        <>
          <p className="muted">{missing === 0 ? "Everyone has logged something this week." : `${missing} ${missing === 1 ? "person has" : "people have"} not logged anything this week.`}</p>
          <div className="tablewrap" tabIndex={0} role="region" aria-label="Daily log by person">
            <table>
              <thead><tr><th scope="col">Person</th><th scope="col">Batch</th><th scope="col">Hours</th><th scope="col">Days logged</th><th scope="col">Week</th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.user_id}><td>{r.name}</td><td>{r.batch_name ?? "-"}</td><td className="tnum">{r.hours}</td><td className="tnum">{r.days_logged} of 5</td>
                  <td>{r.submitted_at ? <Chip tone="ok">Submitted</Chip> : r.days_logged === 0 ? <Chip tone="bad">Nothing logged</Chip> : <Chip tone="warn">Not submitted</Chip>}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

export default function DailyLog() {
  const { reviewerView, canSwitch } = useView();
  const tabs = [{ id: "mine", label: "My week" }, ...(canSwitch ? [{ id: "team", label: "Team" }] : [])];
  const tab = useTab(tabs);
  const [monday, setMonday] = useState(() => mondayOf(new Date()));
  if (!API_URL) return <><PageHeader overline="Daily log" title="Daily log" /><div className="card"><p className="muted">The backend is not connected for this site, so the daily log is not available.</p></div></>;
  return (
    <>
      <PageHeader overline="Daily log" title="Daily log" sub={reviewerView && tab === "team" ? "Who logged what this week." : "Log the hours you spent on each task, day by day, then submit the week. A reminder shows after 10:00 if today is empty."} />
      {tabs.length > 1 && <Tabs tabs={tabs} current={tab} label="Daily log views" />}
      <TabPanel label={tab === "team" ? "Team daily log" : "My week"}>{tab === "team" ? <Team monday={monday} setMonday={setMonday} /> : <MyWeek monday={monday} setMonday={setMonday} />}</TabPanel>
    </>
  );
}
