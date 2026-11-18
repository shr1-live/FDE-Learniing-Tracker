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

export function CopyBtn({ text, label: idle = "Copy" }: { text: string; label?: string }) {
  const [label, setLabel] = useState(idle);
  return (
    <button type="button" className="copy" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setLabel("Copied"); }
      catch { setLabel("Copy failed"); window.prompt("Copy this link:", text); }
      setTimeout(() => setLabel(idle), 1600);
    }}>{label}</button>
  );
}

/** The YouTube video id in a watch, short or embed link; null for anything else. */
export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    const id = host === "youtu.be" ? u.pathname.slice(1) : host === "youtube.com" ? (u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ?? null) : null;
    return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null;
  } catch { return null; }
}

const siteOf = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } };

/** One video, YouTube style: thumbnail with a play button; pressing it plays the video right here with YouTube's own controls. */
function VideoCard({ r, k, playing, onPlay }: { r: Resource; k: string; playing: boolean; onPlay: (k: string | null) => void }) {
  const { entries, setEntry } = useStore();
  const done = !!entries[k];
  const id = youTubeId(r.url);
  return (
    <li className={"vcard" + (done ? " rdone" : "")}>
      <div className="vthumb">
        {playing && id ? (
          // Loaded only after the person presses play, from YouTube's privacy-friendly address.
          <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`} title={`Video: ${r.title}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        ) : id ? (
          <button type="button" className="vplay" onClick={() => onPlay(k)} aria-label={`Play ${r.title}`}>
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
            <span className="vbtn" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5v14l11-7z" fill="currentColor" /></svg></span>
            {done && <span className="vdone">{"✓"} Watched</span>}
          </button>
        ) : (
          <a className="vplay vnothumb" href={r.url} target="_blank" rel="noopener noreferrer"><span>Open the video</span></a>
        )}
      </div>
      <div className="vbody">
        <a className="vtitle" href={r.url} target="_blank" rel="noopener noreferrer">{r.title}<span className="sr"> (opens YouTube in a new tab)</span></a>
        {(r.channel || r.note) && <p className="meta">{[r.channel, r.note].filter(Boolean).join(" · ")}</p>}
        <div className="resact">
          {playing
            ? <button type="button" className="copy" onClick={() => onPlay(null)}>Close player</button>
            : id && <button type="button" className="copy" onClick={() => onPlay(k)}>Play here</button>}
          <button type="button" className={"markbtn" + (done ? " on" : "")} aria-pressed={done} onClick={() => setEntry(k, !done)}>{done ? "Watched" : "Mark watched"}</button>
          <CopyBtn text={r.url} label="Copy link" />
        </div>
        {GUIDES[r.url] && <StudyNotes url={r.url} />}
      </div>
    </li>
  );
}

export function ResourceList({ items, kind }: { items: { r: Resource; k: string }[]; kind: "Video" | "Read" }) {
  const { entries, setEntry } = useStore();
  const [playing, setPlaying] = useState<string | null>(null); // one video at a time, like YouTube
  if (!items.length) return <p className="muted">Nothing for this stack today. See the Stack guide.</p>;
  if (kind === "Video") {
    return <ul className="vgrid">{items.map(({ r, k }) => <VideoCard key={r.url} r={r} k={k} playing={playing === k} onPlay={setPlaying} />)}</ul>;
  }
  return (
    <ul className="reslist">
      {items.map(({ r, k }) => { const done = !!entries[k]; return (
        <li key={r.url} className={"rescard" + (done ? " rdone" : "")}>
          <div className="reshead">
            <span className="tag r">Read</span>
            <span className="meta">{siteOf(r.url)}</span>
            {done && <span className="tag st-approved">{"✓"} Read</span>}
          </div>
          <a className="restitle" href={r.url} target="_blank" rel="noopener noreferrer">{r.title}<span className="sr"> (opens in a new tab)</span></a>
          {(r.channel || r.note) && <p className="meta">{[r.channel, r.note].filter(Boolean).join(" · ")}</p>}
          <div className="resact">
            <a className="copy" href={r.url} target="_blank" rel="noopener noreferrer">Open</a>
            <button type="button" className={"markbtn" + (done ? " on" : "")} aria-pressed={done} onClick={() => setEntry(k, !done)}>{done ? "Read" : "Mark read"}</button>
            <CopyBtn text={r.url} label="Copy link" />
          </div>
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
