import { useState } from "react";
import { Link } from "react-router-dom";
import { useWork } from "../lib/work";
import { useStore } from "../lib/store";
import { dayStatus, fmtDate, logKey, missingWork, parseDay, type LogEntry } from "../lib/backlog";
import { Icon } from "./Icon";
import { notesPath } from "../data/studyNotes";
import { Chip } from "./Chip";
import { StartDate } from "./StartDate";
import { EmptyState } from "./States";

const when = (s?: string) => { const d = parseDay(s); return d ? fmtDate(d) : "-"; };

/** The days a learner has fallen behind on: what is missing, the day in short, and a log of when each was missed and caught up. */
export function CatchUp() {
  const w = useWork();
  const { entries } = useStore();
  const [openDay, setOpenDay] = useState<string | null>(null);

  if (!w.learner) {
    return (
      <EmptyState icon="inbox" title="Reviewers have no days to catch up on" action={<Link className="btn" to="/review">Open the review queue</Link>}>
        Reviewers review work. Learners see their missed days here.
      </EmptyState>
    );
  }

  const log = w.items
    .map((i) => ({ i, e: (entries[logKey(i.week.n, i.state.day.n)] ?? {}) as LogEntry }))
    .filter((x) => x.e.missedOn)
    .sort((a, b) => (b.e.missedOn ?? "").localeCompare(a.e.missedOn ?? ""));

  return (
    <>
      {!w.batch && (
        <div className="card" style={{ marginBottom: "var(--s-4)" }}>
          <h3>When did you start?</h3>
          <p className="muted small">Day 1 is due on your start date, day 2 the next working day, and so on (Monday to Friday). A day counts as missed when it is past due and not finished: points unticked, or proof not submitted.</p>
          {w.weeks.map((x) => <StartDate key={x.week.n} week={x.week.n} />)}
        </div>
      )}

      {w.missed.length === 0 && (
        <div className="card emptystate">
          <Icon name="check" size={28} />
          <div>
            <h3>You are not behind</h3>
            <p className="muted">{w.weeksWithoutStart.length > 0 ? "Set your start date above so due dates can be checked." : "Every day that is due is finished. Keep going."}</p>
            {w.focus && <Link className="btn" to={`/week/${w.focus.week.n}#wd${w.focus.state.day.n}`}>Open Day {w.focus.state.day.n}</Link>}
          </div>
        </div>
      )}
      <div className="stackcards">
        {w.missed.map((i) => {
          const s = i.state, st = dayStatus(s, w.now), left = missingWork(s), id = `${i.week.n}-${s.day.n}`, open = openDay === id;
          return (
            <article key={id} className="card miss" aria-labelledby={`m${id}`}>
              <div className="row tight"><Chip tone={st.tone}>{st.label}</Chip>{s.due && <span className="meta">was due {fmtDate(s.due)}</span>}</div>
              <h3 id={`m${id}`}>Week {i.week.n}, Day {s.day.n}: {s.day.title}</h3>
              <p className="muted small">Why it is here: {s.why}.</p>
              <h4 style={{ marginTop: "var(--s-3)" }}>What is missing</h4>
              <ul className="plain">{left.map((t) => <li key={t}>{t}</li>)}</ul>
              {open && (
                <div className="callout" style={{ marginTop: "var(--s-3)" }}>
                  <b>The day in short</b>
                  <p>{s.day.summary ?? "Open the day to see what to study."}</p>
                  {s.day.keyIdeas && <ul className="plain">{s.day.keyIdeas.map((k) => <li key={k}>{k}</li>)}</ul>}
                </div>
              )}
              <div className="row" style={{ marginTop: "var(--s-3)" }}>
                <Link className="btn" to={`/week/${i.week.n}#wd${s.day.n}`}>Catch up on Day {s.day.n}</Link>
                <button type="button" className="btn secondary" aria-expanded={open} onClick={() => setOpenDay(open ? null : id)}>{open ? "Hide the summary" : "Read the day in short"}</button>
                <Link className="btn ghost" to={notesPath(i.week.n, s.day.n)}>Study notes</Link>
              </div>
            </article>
          );
        })}
      </div>

      {log.length > 0 && (
        <details className="card mini" style={{ marginTop: "var(--s-4)" }}>
          <summary>Catch-up log ({log.length})</summary>
          <div className="tablewrap" tabIndex={0} role="region" aria-label="Catch-up log, scrolls sideways on small screens" style={{ marginTop: "var(--s-2)" }}>
            <table>
              <thead><tr><th scope="col">Day</th><th scope="col">Missed on</th><th scope="col">Caught up on</th></tr></thead>
              <tbody>
                {log.map(({ i, e }) => (
                  <tr key={`${i.week.n}-${i.state.day.n}`}>
                    <td>Week {i.week.n}, Day {i.state.day.n}: {i.state.day.title}</td>
                    <td className="tnum">{when(e.missedOn)}</td>
                    <td className="tnum">{e.clearedOn ? when(e.clearedOn) : <Chip tone="bad">Still open</Chip>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </>
  );
}
