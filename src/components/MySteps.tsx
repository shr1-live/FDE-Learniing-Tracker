import { FormEvent, useState } from "react";
import { useStore } from "../lib/store";
import { useToast } from "./Toast";
import { useConfirm } from "./Confirm";
import { useUnsaved } from "../lib/unsaved";
import { Icon } from "./Icon";
import { Progress } from "./Progress";
import { EmptyState } from "./States";

type Item = { id: string; t: string; n: string; d: boolean };
const KEY = "myplan"; // stored per user; the database only lets each person read their own
const MAX_ITEMS = 40;

/** "My steps": the person's own learning plan. Only they can see it. */
export function MySteps() {
  const { entries, setEntry } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const items: Item[] = Array.isArray(entries[KEY]) ? (entries[KEY] as Item[]) : [];
  const [title, setTitle] = useState(""); const [note, setNote] = useState("");
  useUnsaved("mysteps", !!(title.trim() || note.trim()));
  const save = (next: Item[]) => setEntry(KEY, next);
  const done = items.filter((i) => i.d).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  function add(e: FormEvent) {
    e.preventDefault();
    const t = title.trim().slice(0, 100);
    if (!t || items.length >= MAX_ITEMS) return;
    save([...items, { id: Date.now().toString(36), t, n: note.trim().slice(0, 200), d: false }]);
    setTitle(""); setNote("");
    toast.success("Step added to your plan.");
  }
  const toggle = (id: string) => save(items.map((i) => (i.id === id ? { ...i, d: !i.d } : i)));
  async function remove(i: Item) {
    if (!(await confirm({ title: "Delete this step?", body: `"${i.t}" will be removed from your plan.`, confirm: "Delete step", danger: true }))) return;
    save(items.filter((x) => x.id !== i.id));
    toast.info("Step deleted.");
  }
  const move = (id: string, dir: -1 | 1) => {
    const i = items.findIndex((x) => x.id === id); const j = i + dir;
    if (i < 0 || j < 0 || j >= items.length) return;
    const next = [...items]; [next[i], next[j]] = [next[j]!, next[i]!]; save(next);
  };

  return (
    <>
      {items.length > 0 && (
        <div className="row" style={{ marginBottom: "var(--s-3)", flexWrap: "nowrap" }}>
          <div className="grow"><Progress value={pct} label="My steps progress" /></div>
          <span className="meta tnum nowrap">{done} of {items.length} done</span>
        </div>
      )}
      {items.length === 0 ? (
        <EmptyState icon="tasks" title="No steps yet">Add the first thing you want to do, for example "Build a small chat feature with an LLM". Only you can see your steps.</EmptyState>
      ) : (
        <ol className="mylist">
          {items.map((i, idx) => (
            <li key={i.id} className={"card" + (i.d ? " isdone" : "")}>
              <label className="check"><input type="checkbox" checked={i.d} onChange={() => toggle(i.id)} />
                <span><b>{i.t}</b>{i.n && <><br /><span className="muted small">{i.n}</span></>}</span></label>
              <div className="mytools">
                <button type="button" className="iconbtn sm" onClick={() => move(i.id, -1)} disabled={idx === 0} aria-label={`Move ${i.t} up`}><Icon name="up" size={16} /></button>
                <button type="button" className="iconbtn sm" onClick={() => move(i.id, 1)} disabled={idx === items.length - 1} aria-label={`Move ${i.t} down`}><Icon name="downArrow" size={16} /></button>
                <button type="button" className="iconbtn sm" onClick={() => void remove(i)} aria-label={`Delete ${i.t}`}><Icon name="trash" size={16} /></button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <form className="card stepform" onSubmit={add}>
        <h3>Add a step</h3>
        <p className="meta" style={{ marginTop: 4 }}>A topic, task or project for your own plan, in the order you choose.</p>
        <div className="field" style={{ marginTop: "var(--s-4)" }}>
          <label htmlFor="mt">What will you do?</label>
          <input id="mt" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 2: build a tool-calling demo" />
        </div>
        <div className="field">
          <div className="label-row"><label htmlFor="mn">Notes</label><span className="hint">(optional)</span></div>
          <textarea id="mn" rows={2} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <button className="btn block" style={{ marginTop: "var(--s-4)" }} disabled={!title.trim() || items.length >= MAX_ITEMS}><Icon name="plus" size={16} />Add to my steps</button>
        {items.length >= MAX_ITEMS && <p className="err small" style={{ marginTop: "var(--s-2)" }}>You have reached {MAX_ITEMS} steps. Delete one to add another.</p>}
      </form>
    </>
  );
}
