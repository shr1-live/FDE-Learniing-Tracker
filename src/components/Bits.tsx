import { useState } from "react";
import { Link } from "react-router-dom";
import { DAYS, checkKeys, Resource } from "../data/types";
import { useStore } from "../lib/store";
import { GUIDES } from "../data/guides";

export function dayProgress(entries: Record<string, unknown>, n: number) {
  const d = DAYS.find((x) => x.n === n)!; const ks = checkKeys(d);
  const done = ks.filter((k) => entries["chk:" + k]).length;
  return { done, total: ks.length, pct: ks.length ? done / ks.length : 0 };
}

export function LayerStack() {
  const { entries } = useStore();
  const rows = DAYS;
  return (
    <ol className="stack" aria-label="Layers, Day 1 first">
      {rows.map((d) => {
        const p = dayProgress(entries, d.n);
        return (
          <li key={d.n}>
            <Link to={`/plan/${d.n}`} className="layer" aria-label={`Day ${d.n}, ${d.name}, ${p.done} of ${p.total} checks`}>
              <i style={{ width: `${Math.round(p.pct * 100)}%` }} />
              <span className="ld">Day {d.n}</span>
              <span className="ln">{d.name}</span>
              <span className="lc">{p.done}/{p.total}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function CopyBtn({ text }: { text: string }) {
  const [label, setLabel] = useState("Copy");
  return (
    <button type="button" className="copy" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setLabel("Copied"); }
      catch { setLabel("Select the address"); }
      setTimeout(() => setLabel("Copy"), 1600);
    }}>{label}</button>
  );
}

export function ResourceList({ items, kind }: { items: { r: Resource; k: string }[]; kind: "Video" | "Read" }) {
  const { entries, setEntry } = useStore();
  if (!items.length) return <p className="muted">Nothing for this stack today. See the Stack guide.</p>;
  return (
    <ul className="links">
      {items.map(({ r, k }) => { const done = !!entries[k]; return (
        <li key={r.url} className={done ? "rdone" : ""}>
          <span className={"tag " + (kind === "Video" ? "v" : "r")}>{kind}</span>
          <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
          {(r.channel || r.note) && <span className="meta">{[r.channel, r.note].filter(Boolean).join(" · ")}</span>}
          <span className="urlrow"><code>{r.url}</code><CopyBtn text={r.url} />
            <button type="button" className={"markbtn" + (done ? " on" : "")} aria-pressed={done} onClick={() => setEntry(k, !done)}>{done ? "\u2713 Completed" : kind === "Video" ? "Mark watched" : "Mark read"}</button></span>
          {GUIDES[r.url] && <StudyNotes url={r.url} />}
        </li>); })}
    </ul>
  );
}

export function CheckItem({ k, text }: { k: string; text: string }) {
  const { entries, setEntry } = useStore();
  const on = !!entries["chk:" + k];
  return (
    <li>
      <label className="check">
        <input type="checkbox" checked={on} onChange={(e) => setEntry("chk:" + k, e.target.checked)} />
        <span>{text}</span>
      </label>
    </li>
  );
}

export function DayChips({ current }: { current: number }) {
  const { entries } = useStore();
  return (
    <nav className="chips" aria-label="Jump to day">
      {DAYS.map((x) => { const p = dayProgress(entries, x.n); return (
        <Link key={x.n} to={`/plan/${x.n}`} className={x.n === current ? "on" : ""} aria-current={x.n === current ? "page" : undefined} title={x.name}>
          <i style={{ height: `${Math.round(p.pct * 100)}%` }} /><span>{x.n}</span>
        </Link>); })}
    </nav>
  );
}

export function StudyNotes({ url }: { url: string }) {
  const g = GUIDES[url];
  if (!g) return null;
  return (
    <details className="notes">
      <summary>Study notes: what this is and what to read</summary>
      <p>{g.what}</p>
      <ol className="readorder">
        {g.order.map((o) => (
          <li key={o.url}><a href={o.url} target="_blank" rel="noopener noreferrer">{o.title}</a><span>{o.why}</span></li>
        ))}
      </ol>
      {g.skip && <p className="skipnote"><b>You can skip:</b> {g.skip}</p>}
      <p className="meta">Time: {g.time}</p>
    </details>
  );
}
