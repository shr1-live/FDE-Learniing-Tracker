import { useState } from "react";
import { useStore } from "../lib/store";
import { PROGRAMME } from "../data/programme";
import { QUIZ, quizKey, type QuizScore } from "../data/quiz";
import { PageHeader } from "../components/PageHeader";
import { Chip } from "../components/Chip";

const score = (v: unknown): QuizScore | null => (v && typeof v === "object" && typeof (v as QuizScore).best === "number" ? (v as QuizScore) : null);

/** Self-check quizzes: three questions for each day, scored at once, with the reason for every answer. Your best score per day is kept. */
export default function Quiz() {
  const { entries, setEntry } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const days = PROGRAMME.flatMap((w) => w.days.map((d) => ({ w: w.n, d: d.n, title: d.title, key: `w${w.n}d${d.n}` }))).filter((x) => QUIZ[x.key]);
  const cur = days.find((x) => x.key === open);
  const qs = cur ? QUIZ[cur.key]! : [];
  const total = qs.filter((q, i) => picked[i] === q.answer).length;

  const start = (k: string) => { setOpen(k); setPicked({}); setDone(false); };
  const finish = () => {
    if (!cur) return;
    const prev = score(entries[quizKey(cur.w, cur.d)]);
    setEntry(quizKey(cur.w, cur.d), { best: Math.max(prev?.best ?? 0, total), last: total, of: qs.length, at: new Date().toISOString().slice(0, 10) } satisfies QuizScore);
    setDone(true);
  };

  if (cur) {
    return (
      <>
        <PageHeader overline="Quiz" title={`Week ${cur.w}, Day ${cur.d}: ${cur.title}`} sub="Pick one answer for each question. You see the reasons at the end. You can retry as often as you like." />
        <div className="stackcards">
          {qs.map((q, i) => (
            <fieldset key={i} className="card quiz-q" disabled={done}>
              <legend><b>{i + 1}. {q.q}</b></legend>
              {q.options.map((o, j) => {
                const state = done ? (j === q.answer ? "right" : picked[i] === j ? "wrong" : "") : "";
                return <label key={j} className={"check-row quiz-opt " + state}><input type="radio" name={`q${i}`} checked={picked[i] === j} onChange={() => setPicked((p) => ({ ...p, [i]: j }))} /><span>{o}{state === "right" && <span className="sr"> (correct)</span>}{state === "wrong" && <span className="sr"> (your answer, wrong)</span>}</span></label>;
              })}
              {done && <p className="meta"><b>{picked[i] === q.answer ? "Correct." : "Not quite."}</b> {q.why}</p>}
            </fieldset>
          ))}
        </div>
        <div className="row" style={{ marginTop: "var(--s-3)" }}>
          {!done ? <button type="button" className="btn" disabled={Object.keys(picked).length < qs.length} onClick={finish}>Check my answers</button>
            : <><b role="status">You scored {total} of {qs.length}.</b><button type="button" className="btn secondary" onClick={() => start(cur.key)}>Try again</button></>}
          <button type="button" className="btn ghost" onClick={() => setOpen(null)}>All quizzes</button>
        </div>
      </>
    );
  }
  return (
    <>
      <PageHeader overline="Tools" title="Quizzes" sub="Three quick questions for each programme day, to check you understood the theory. Only you see your scores." />
      <ul className="stackcards">
        {days.map((x) => {
          const s = score(entries[quizKey(x.w, x.d)]);
          return (
            <li key={x.key} className="card row between">
              <div><b>Week {x.w}, Day {x.d}: {x.title}</b><p className="meta">{s ? `Best ${s.best} of ${s.of} · last ${s.last} on ${s.at}` : "Not tried yet"}</p></div>
              <div className="row">{s && <Chip tone={s.best === s.of ? "ok" : "info"}>{s.best === s.of ? "Full marks" : `${s.best}/${s.of}`}</Chip>}<button type="button" className="btn secondary" onClick={() => start(x.key)}>{s ? "Try again" : "Start"}</button></div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
