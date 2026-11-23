import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PROGRAMME } from "../data/programme";
import { DAYS } from "../data/types";
import { useStore } from "../lib/store";
import { noteKey } from "../lib/journalKeys";
import { Icon } from "./Icon";

type Hit = { id: string; title: string; sub: string; to: string };
const PAGES: Hit[] = [
  { id: "p-home", title: "Home", sub: "Page", to: "/" }, { id: "p-prog", title: "Programme", sub: "Page", to: "/week/1" },
  { id: "p-progress", title: "Progress", sub: "Page", to: "/progress" }, { id: "p-feed", title: "Feed", sub: "Page", to: "/feed" },
  { id: "p-cal", title: "Calendar", sub: "Page", to: "/calendar" }, { id: "p-journal", title: "Journal: goals and notes", sub: "Page", to: "/journal" },
  { id: "p-quiz", title: "Quizzes", sub: "Page", to: "/quiz" }, { id: "p-log", title: "Daily log", sub: "Page", to: "/daily-log" },
  { id: "p-notif", title: "Notifications", sub: "Page", to: "/notifications" }, { id: "p-lab", title: "Practice lab", sub: "Page", to: "/lab" },
  { id: "p-res", title: "Resources", sub: "Page", to: "/resources" }, { id: "p-ready", title: "Readiness ratings", sub: "Page", to: "/resources?tab=readiness" },
];

/** Search everything on the device: pages, programme days (title, topics, key ideas), resources and your own notes. Ctrl+K or / opens it. */
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const { entries } = useStore();
  const nav = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const index = useMemo<(Hit & { text: string })[]>(() => {
    const out: (Hit & { text: string })[] = PAGES.map((p) => ({ ...p, text: p.title }));
    for (const wk of PROGRAMME) for (const d of wk.days) {
      out.push({ id: `d${wk.n}-${d.n}`, title: `Week ${wk.n}, Day ${d.n}: ${d.title}`, sub: "Programme day", to: `/week/${wk.n}#wd${d.n}`, text: [d.title, d.task, ...d.topics, ...(d.keyIdeas ?? []), d.summary ?? ""].join(" ") });
      const note = entries[noteKey(wk.n, d.n)];
      if (typeof note === "string" && note.trim()) out.push({ id: `n${wk.n}-${d.n}`, title: `My note: Week ${wk.n}, Day ${d.n}`, sub: note.slice(0, 80), to: "/journal?tab=notes", text: note });
    }
    for (const d of DAYS) for (const r of [...d.watch, ...d.read]) out.push({ id: `r${d.n}${r.url}`, title: r.title, sub: `Resource, Day ${d.n}${r.channel ? ` · ${r.channel}` : ""}`, to: "/resources", text: `${r.title} ${r.note} ${r.channel ?? ""}` });
    return out;
  }, [entries]);

  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return PAGES;
    const words = t.split(/\s+/);
    return index.filter((h) => words.every((w) => h.text.toLowerCase().includes(w))).slice(0, 12);
  }, [q, index]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const typing = /^(input|textarea|select)$/i.test((e.target as HTMLElement)?.tagName ?? "") || (e.target as HTMLElement)?.isContentEditable;
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) { e.preventDefault(); opener.current = document.activeElement as HTMLElement; setOpen(true); }
      else if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", on);
    return () => document.removeEventListener("keydown", on);
  }, []);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => input.current?.focus(), 0); } else opener.current?.focus?.(); }, [open]);
  useEffect(() => setSel(0), [q]);

  const go = (h?: Hit) => { if (!h) return; setOpen(false); nav(h.to); };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, hits.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(hits[sel]); }
  };

  return (
    <>
      <button type="button" className="iconbtn" aria-label="Search (Ctrl+K)" title="Search (Ctrl+K)" onClick={(e) => { opener.current = e.currentTarget; setOpen(true); }}><Icon name="search" /></button>
      {open && (
        <div className="gs-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="gs-box" role="dialog" aria-modal="true" aria-label="Search">
            <div className="gs-input"><Icon name="search" size={16} />
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={key} placeholder="Search days, resources, your notes, pages" role="combobox" aria-expanded="true" aria-controls="gs-list" aria-activedescendant={hits[sel] ? `gs-${hits[sel]!.id}` : undefined} aria-label="Search" /></div>
            <ul id="gs-list" role="listbox" className="gs-list">
              {hits.length === 0 && <li className="gs-none">Nothing found for "{q}".</li>}
              {hits.map((h, i) => (
                <li key={h.id} id={`gs-${h.id}`} role="option" aria-selected={i === sel} className={i === sel ? "on" : ""} onMouseEnter={() => setSel(i)} onClick={() => go(h)}>
                  <b>{h.title}</b><small>{h.sub}</small>
                </li>
              ))}
            </ul>
            <p className="meta gs-foot">Arrow keys to move, Enter to open, Esc to close.</p>
          </div>
        </div>
      )}
    </>
  );
}
