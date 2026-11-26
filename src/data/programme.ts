// The programme as data. A new week is one more entry here (its days, acceptance points and expected proof):
// the Week page, the review page, the dashboard and the expected-proof guide all read from this registry.
import { WEEK_DAYS, WEEK_TITLE, WeekDay } from "./weekPlan";
import { EXPECT, DayExpectation } from "./weekExpect";
import { WEEK2_DAYS, WEEK2_EXPECT, WEEK2_TITLE } from "./week2";
import { WEEK3, WEEK4, WEEK5 } from "./weeks3to5";
import { devopsTitle } from "./devops";

export type ProgrammeWeek = { n: number; title: string; days: WeekDay[]; expect: Record<number, DayExpectation> };

export const PROGRAMME: ProgrammeWeek[] = [
  { n: 1, title: WEEK_TITLE, days: WEEK_DAYS, expect: EXPECT },
  { n: 2, title: WEEK2_TITLE, days: WEEK2_DAYS, expect: WEEK2_EXPECT },
  { n: 3, title: WEEK3.title, days: WEEK3.days, expect: WEEK3.expect },
  { n: 4, title: WEEK4.title, days: WEEK4.days, expect: WEEK4.expect },
  { n: 5, title: WEEK5.title, days: WEEK5.days, expect: WEEK5.expect },
];

export const getWeek = (n: number): ProgrammeWeek | undefined => PROGRAMME.find((w) => w.n === n);

/** A task is one day of one week. The key is what a submission is filed under. */
export const taskKey = (week: number, day: number) => `week${week}-day${day}`;

export function parseTask(key: string): { week: number; day: number } | null {
  const m = /^week(\d{1,2})-day(\d{1,2})$/.exec(key);
  return m ? { week: Number(m[1]), day: Number(m[2]) } : null;
}

/** "week1-day2" becomes "Week 1, Day 2: Advanced Prompt Engineering". Unknown tasks show their key. */
export function taskTitle(key: string): string {
  const dv = devopsTitle(key);
  if (dv) return dv;
  const t = parseTask(key);
  const day = t && getWeek(t.week)?.days.find((d) => d.n === t.day);
  return t && day ? `Week ${t.week}, Day ${t.day}: ${day.title}` : key;
}

/** The hint under "What you learned" for a task. */
export function hintFor(key: string): string {
  const t = parseTask(key);
  return (t && getWeek(t.week)?.expect[t.day]?.learnHint) || "What you understood and could now explain to someone else.";
}

/** Where the learner's own ticks for a day are stored. */
export const dayKey = (week: number, day: number) => `wp${week}:d${day}`;
