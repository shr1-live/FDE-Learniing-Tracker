// The DevOps track: a second programme next to the FDE one. FDE keys and stored data are not touched; everything here
// uses its own prefixes (task "devops-week1-day2", ticks "wp-devops1:d2").
import type { DayNotes } from "../studyNotes";
import { DEVOPS_WEEKS, type DevopsDay, type DevopsWeek } from "./plan";
import { W1 } from "./notesW1";
import { W2 } from "./notesW2";
import { W3 } from "./notesW3";
import { W4, W5 } from "./notesW4";

export { DEVOPS_WEEKS };
export type { DevopsDay, DevopsWeek };
export const DEVOPS_NOTES: Record<number, DayNotes[]> = { 1: W1, 2: W2, 3: W3, 4: W4, 5: W5 };

export const getDevopsWeek = (n: number): DevopsWeek | undefined => DEVOPS_WEEKS.find((w) => w.n === n);
export const devopsTaskKey = (week: number, day: number) => `devops-week${week}-day${day}`;
export const devopsDayKey = (week: number, day: number) => `wp-devops${week}:d${day}`;
export const DEVOPS_TOTAL_DAYS = DEVOPS_WEEKS.reduce((a, w) => a + w.days.length, 0);

export function parseDevopsTask(key: string): { week: number; day: number } | null {
  const m = /^devops-week(\d{1,2})-day(\d{1,2})$/.exec(key);
  return m ? { week: Number(m[1]), day: Number(m[2]) } : null;
}

/** "devops-week1-day2" becomes "DevOps Week 1, Day 2: Processes, services...". Unknown keys show as they are. */
export function devopsTitle(key: string): string | null {
  const t = parseDevopsTask(key);
  const day = t && getDevopsWeek(t.week)?.days.find((d) => d.n === t.day);
  return t && day ? `DevOps Week ${t.week}, Day ${t.day}: ${day.title}` : null;
}
