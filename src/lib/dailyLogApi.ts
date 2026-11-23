// The daily log: tasks as rows, weekdays as columns. The backend enforces every rule; these are just the calls.
import { useEffect, useState } from "react";
import { API_URL, apiJson } from "./api";
import { isoDay } from "./backlog";
import type { Reminder } from "./reminders";

export type Cell = { task: string; date: string; hours: number; note: string | null };
export type LogWeek = { week_start: string; cells: Cell[]; submitted_at: string | null; total: number };
export type LogSummaryRow = { user_id: string; name: string; batch_name: string | null; hours: number; days_logged: number; submitted_at: string | null };

export const getWeek = (monday: string) => apiJson<LogWeek>("GET", `/api/daily-log/${monday}`);
export const saveWeek = (monday: string, cells: Cell[]) => apiJson<LogWeek>("PUT", `/api/daily-log/${monday}`, { cells });
export const submitWeek = (monday: string) => apiJson<LogWeek>("POST", `/api/daily-log/${monday}/submit`);
export const summary = (monday: string) => apiJson<LogSummaryRow[]>("GET", `/api/daily-log/summary/${monday}`);
export type AuditRow = { id: number; actor: string; action: string; target: string; detail: string | null; created_at: string };
export const audit = (limit = 100) => apiJson<AuditRow[]>("GET", `/api/admin/audit?limit=${limit}`);

/** The Monday of the week that contains d, as a local date. */
export function mondayOf(d: Date): Date {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** The hour (local time) from which a missing daily log is flagged. */
export const LOG_HOUR = 10;

/** After 10:00 on a weekday: "log today's work" until the person has logged any hours for today. In-app only. */
export function useDailyLogReminder(now: Date, enabled: boolean): Reminder[] {
  const [hours, setHours] = useState<number | null>(null);
  const wd = now.getDay() !== 0 && now.getDay() !== 6;
  const due = enabled && !!API_URL && wd && now.getHours() >= LOG_HOUR;
  const day = isoDay(now);
  useEffect(() => {
    if (!due) return;
    let live = true;
    const load = () => getWeek(isoDay(mondayOf(now))).then((w) => { if (live) setHours(w.cells.filter((c) => c.date === day).reduce((a, c) => a + c.hours, 0)); }).catch(() => {});
    load();
    const t = window.setInterval(load, 5 * 60000);
    return () => { live = false; window.clearInterval(t); };
  }, [due, day]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!due || hours === null || hours > 0) return [];
  return [{ id: `log:${day}`, tone: "warn", title: "You have not filled your daily log today", body: "Add the hours you worked on each task so your reviewer can see where the time went.", to: "/daily-log", toLabel: "Fill the daily log" }];
}
