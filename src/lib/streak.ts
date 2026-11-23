// Streaks and badges, worked out from the live work picture. Nothing is stored: it is always the current truth.
import type { Work } from "./work";

export type Badge = { id: string; title: string; hint: string; earned: boolean };

/** Current and longest run of finished days. A day due today that is not finished yet does not break the current run. */
export function streaks(w: Work): { current: number; longest: number } {
  const today = new Date(w.now.getFullYear(), w.now.getMonth(), w.now.getDate()).getTime();
  const eligible = w.items.filter((i) => i.state.finished || (i.state.due ? i.state.due.getTime() <= today : false));
  let longest = 0, run = 0;
  for (const i of eligible) { if (i.state.finished) { run++; longest = Math.max(longest, run); } else run = 0; }
  let current = 0;
  for (let k = eligible.length - 1; k >= 0; k--) {
    const s = eligible[k]!.state;
    if (s.finished) current++;
    else if (s.due && s.due.getTime() === today && k === eligible.length - 1) continue; // today is still open
    else break;
  }
  return { current, longest };
}

export function badges(w: Work): Badge[] {
  const { longest } = streaks(w);
  const weekDone = (n: number) => { const ww = w.weeks.find((x) => x.week.n === n); return !!ww && ww.states.length > 0 && ww.states.every((s) => s.finished); };
  const anyApproved = w.items.some((i) => i.state.proof === "approved");
  return [
    { id: "first", title: "First day done", hint: "Finish any one day.", earned: w.totals.finished >= 1 },
    { id: "streak3", title: "3 in a row", hint: "Finish 3 days one after the other.", earned: longest >= 3 },
    { id: "streak5", title: "5 in a row", hint: "Finish 5 days one after the other.", earned: longest >= 5 },
    { id: "w1", title: "Week 1 complete", hint: "Finish every day of Week 1.", earned: weekDone(1) },
    { id: "w2", title: "Week 2 complete", hint: "Finish every day of Week 2.", earned: weekDone(2) },
    { id: "approved", title: "Reviewer approved", hint: "Get one proof approved.", earned: anyApproved },
    { id: "clear", title: "No days missed", hint: "Have no missed days while at least 3 are done.", earned: w.missed.length === 0 && w.totals.finished >= 3 },
  ];
}
