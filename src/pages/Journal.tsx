import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { PROGRAMME } from "../data/programme";
import { PageHeader } from "../components/PageHeader";
import { Tabs, TabPanel, useTab } from "../components/Tabs";
import { Icon } from "../components/Icon";
import { EmptyState } from "../components/States";

import { goalKey, noteKey } from "../lib/journalKeys";
const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Weekly goals (set at the start, checked at the end of the week) and a private searchable note for each day. */
function Goals() {
  const { entries, setEntry } = useStore();
  return (
    <>
      <header className="ph"><p className="muted">Write what you want to get out of each week. At the end of the week, write what actually happened. Only you see this.</p></header>
      <div className="stackcards">
        {PROGRAMME.map((wk) => (
          <section key={wk.n} className="card" aria-labelledby={`g${wk.n}`}>
            <h2 id={`g${wk.n}`}>Week {wk.n}: {wk.title}</h2>
            <div className="field"><label htmlFor={`gs${wk.n}`}>My goals for the week</label>
              <textarea id={`gs${wk.n}`} rows={3} maxLength={2000} value={str(entries[goalKey(wk.n)])} onChange={(e) => setEntry(goalKey(wk.n), e.target.value)} placeholder="For example: finish all five days, get Day 3 approved, understand tokens well enough to explain them." /></div>
            <div className="field"><label htmlFor={`gc${wk.n}`}>End of week check-in: what went well, what to change</label>
              <textarea id={`gc${wk.n}`} rows={3} maxLength={2000} value={str(entries[goalKey(wk.n) + ":end"])} onChange={(e) => setEntry(goalKey(wk.n) + ":end", e.target.value)} /></div>
          </section>
        ))}
      </div>
    </>
  );
}

function Notes() {
  const { entries, setEntry } = useStore();
  const [q, setQ] = useState("");
  const rows = useMemo(() => PROGRAMME.flatMap((wk) => wk.days.map((d) => ({ wk: wk.n, d: d.n, title: d.title, text: str(entries[noteKey(wk.n, d.n)]) }))), [entries]);
  const shown = q.trim() ? rows.filter((r) => (r.text + " " + r.title).toLowerCase().includes(q.trim().toLowerCase())) : rows;
  return (
    <>
      <header className="ph"><p className="muted">A private learning journal: one note per day. Search across all of them.</p></header>
      <div className="toolbar"><div className="search grow"><Icon name="search" size={16} /><label htmlFor="jn-q" className="sr">Search your notes</label><input id="jn-q" type="search" placeholder="Search your notes" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
      {shown.length === 0 ? <EmptyState icon="file" title="No notes match">Try another word.</EmptyState> : (
        <div className="stackcards">
          {shown.map((r) => (
            <section key={`${r.wk}-${r.d}`} className="card">
              <label htmlFor={`n${r.wk}${r.d}`}><b>Week {r.wk}, Day {r.d}: {r.title}</b></label>
              <textarea id={`n${r.wk}${r.d}`} rows={3} maxLength={4000} value={r.text} onChange={(e) => setEntry(noteKey(r.wk, r.d), e.target.value)} placeholder="What did you learn, what is still unclear?" />
            </section>
          ))}
        </div>
      )}
    </>
  );
}

export default function Journal() {
  const tabs = [{ id: "goals", label: "Weekly goals" }, { id: "notes", label: "Daily notes" }];
  const tab = useTab(tabs);
  return (
    <>
      <PageHeader overline="Journal" title="Goals and notes" sub="Plan the week, keep a note for each day. Saved as you type, private to you." />
      <Tabs tabs={tabs} current={tab} label="Journal views" />
      <TabPanel label={tab === "goals" ? "Weekly goals" : "Daily notes"}>{tab === "goals" ? <Goals /> : <Notes />}</TabPanel>
    </>
  );
}
