import { FormEvent, useCallback, useEffect, useState } from "react";
import { API_URL, ApiError } from "../lib/api";
import * as rag from "../lib/ragApi";
import { downloadCsv } from "../lib/csv";
import { Chip } from "../components/Chip";
import { useConfirm } from "../components/Confirm";

const msg = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Try again.");
const pct = (n: number) => `${n}%`;

/** Document assistant (Week 2): add approved documents, ask questions, get cited answers, and compare how the settings change the results. */
export default function Rag() {
  const [docs, setDocs] = useState<rag.Doc[] | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => { rag.documents().then((d) => { setDocs(d); setErr(""); }).catch((e) => setErr(msg(e))); }, []);
  useEffect(() => { if (API_URL) load(); }, [load]);

  if (!API_URL) return <div className="card"><p className="muted">The backend is not connected for this site.</p></div>;
  return (
    <>
      <HowItWorks />
      <Documents docs={docs} reload={load} err={err} setErr={setErr} />
      <Ask hasDocs={(docs?.length ?? 0) > 0} tags={[...new Set((docs ?? []).flatMap((d) => d.tags))]} />
      <Evaluation />
    </>
  );
}

function HowItWorks() {
  return (
    <details className="mini">
      <summary>How it works: three stages (architecture and data flow)</summary>
      <ol className="plain">
        <li><b>Ingestion</b> (when you add a document): the text is stored with its title and tags as the source. Whitespace is cleaned when it is cut into chunks, by paragraph or in fixed windows with overlap. Each chunk keeps its document, its position and the tags.</li>
        <li><b>Retrieval</b> (when you ask): each chunk is turned into a vector (256 numbers, made once and stored for reuse) and scored against the question by vector similarity, by keywords (BM25), or both merged. Document tags can narrow the search first. The best K chunks make the context.</li>
        <li><b>Generation</b>: a model, if one is available, answers only from the numbered chunks and cites them as [1], [2]. Without a model, or when its citations are not real, the best sentences are quoted instead. If the documents do not cover the question, the answer says so.</li>
      </ol>
      <p className="meta">Data flow: document, chunks (with source), vectors, top-K chunks, answer with citations. The full write-up is in docs/WEEK2-RAG-ARCHITECTURE.md.</p>
    </details>
  );
}

function Documents({ docs, reload, err, setErr }: { docs: rag.Doc[] | null; reload: () => void; err: string; setErr: (s: string) => void }) {
  const [title, setTitle] = useState(""); const [text, setText] = useState(""); const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const confirm = useConfirm();
  async function add(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    try { await rag.addDocument(title.trim(), text.trim(), tags.split(/[,\s]+/).filter(Boolean)); setTitle(""); setText(""); setTags(""); reload(); } catch (x) { setErr(msg(x)); } finally { setBusy(false); }
  }
  async function sample() { setBusy(true); setErr(""); try { await rag.loadSample(); reload(); } catch (x) { setErr(msg(x)); } finally { setBusy(false); } }
  async function remove(d: rag.Doc) {
    if (!(await confirm({ title: `Remove "${d.title}"?`, body: "It is no longer used to answer questions.", confirm: "Remove", danger: true }))) return;
    try { await rag.removeDocument(d.id); reload(); } catch (x) { setErr(msg(x)); }
  }
  return (
    <section aria-labelledby="rag-docs">
      <h2 id="rag-docs">1. Approved documents</h2>
      <p className="muted small">Answers come only from the documents you add here. Only you can see them. Up to 20 documents.</p>
      {err && <p className="banner err" role="alert">{err}</p>}
      {docs === null ? <p className="muted">Loading</p> : docs.length === 0
        ? <div className="card"><p>No documents yet. Load the four sample handbook documents to try it, or add your own below.</p><div className="row"><button type="button" className="btn" disabled={busy} onClick={() => void sample()}>Load the sample documents</button></div></div>
        : <div className="tablewrap gap" tabIndex={0} role="region" aria-label="Your documents">
            <table><thead><tr><th>Title</th><th>Tags</th><th>Size</th><th>Chunks (by paragraph)</th><th><span className="sr">Action</span></th></tr></thead>
              <tbody>{docs.map((d) => <tr key={d.id}><td>{d.title}</td><td>{d.tags.join(", ") || "-"}</td><td>{d.characters} characters</td><td>{d.chunks}</td><td><button type="button" className="copy" onClick={() => void remove(d)} aria-label={`Remove ${d.title}`}>Remove</button></td></tr>)}</tbody></table>
          </div>}
      {docs !== null && docs.length > 0 && <div className="row"><button type="button" className="btn secondary" disabled={busy} onClick={() => void sample()}>Add the sample documents too</button></div>}
      <details className="mini"><summary>Add a document</summary>
        <form className="card gap" onSubmit={add}>
          <label htmlFor="rd-t">Title</label><input id="rd-t" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
          <label htmlFor="rd-g">Tags (optional, separated by commas)</label><input id="rd-g" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="hr, policy" />
          <label htmlFor="rd-f">Load a text file (.txt or .md, optional)</label>
          <input id="rd-f" type="file" accept=".txt,.md,text/plain,text/markdown" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 20000) { setErr("The file is longer than 20,000 characters. Split it into two documents."); return; } f.text().then((t) => { setText(t); if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, "")); }); }} />
          <label htmlFor="rd-x">Text</label><textarea id="rd-x" required rows={6} minLength={20} maxLength={20000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the document text. Leave an empty line between paragraphs." />
          <div className="row"><button className="btn" disabled={busy}>Add document</button></div>
        </form>
      </details>
    </section>
  );
}

function Settings({ q, set, tags }: { q: rag.Query; set: (q: rag.Query) => void; tags: string[] }) {
  return (
    <div className="row" style={{ flexWrap: "wrap", gap: "var(--s-3)" }}>
      <div><label htmlFor="rq-s">Chunking</label><select id="rq-s" value={q.strategy} onChange={(e) => set({ ...q, strategy: e.target.value })}>{rag.STRATEGIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div><label htmlFor="rq-m">Search</label><select id="rq-m" value={q.mode} onChange={(e) => set({ ...q, mode: e.target.value })}>{rag.MODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div><label htmlFor="rq-k">Top K</label><select id="rq-k" value={q.top_k} onChange={(e) => set({ ...q, top_k: Number(e.target.value) })}>{[1, 2, 3, 5, 8].map((k) => <option key={k} value={k}>{k}</option>)}</select></div>
      <div><label htmlFor="rq-z">Chunk size (characters)</label><input id="rq-z" type="number" min={80} max={1000} step={10} className="narrow" value={q.chunk_size ?? ""} placeholder={q.strategy === "fixed" ? "260" : "420"} onChange={(e) => set({ ...q, chunk_size: e.target.value ? Number(e.target.value) : undefined })} /></div>
      {q.strategy === "fixed" && <div><label htmlFor="rq-o">Overlap (characters)</label><input id="rq-o" type="number" min={0} max={500} step={10} className="narrow" value={q.overlap ?? ""} placeholder="60" onChange={(e) => set({ ...q, overlap: e.target.value ? Number(e.target.value) : undefined })} /></div>}
      <div><label htmlFor="rq-t">Only documents tagged</label><select id="rq-t" value={q.tag ?? ""} onChange={(e) => set({ ...q, tag: e.target.value || undefined })}><option value="">Any</option>{tags.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
    </div>
  );
}

function Ask({ hasDocs, tags }: { hasDocs: boolean; tags: string[] }) {
  const [q, setQ] = useState<rag.Query>({ question: "", strategy: "paragraph", mode: "hybrid", top_k: 3, use_model: true });
  const [res, setRes] = useState<rag.Answer | null>(null);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function go(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr(""); setRes(null);
    try { setRes(await rag.ask(q)); } catch (x) { setErr(msg(x)); } finally { setBusy(false); }
  }
  return (
    <section aria-labelledby="rag-ask">
      <h2 id="rag-ask">2. Ask a question</h2>
      <form className="card gap" onSubmit={go}>
        <label htmlFor="rq-q">Question</label>
        <input id="rq-q" required minLength={3} maxLength={500} value={q.question} onChange={(e) => setQ({ ...q, question: e.target.value })} placeholder="How many days of paid annual leave do I get?" />
        <Settings q={q} set={setQ} tags={tags} />
        <label className="check-row"><input type="checkbox" checked={q.use_model !== false} onChange={(e) => setQ({ ...q, use_model: e.target.checked })} /><span>Let the model write the answer when it is available <small className="meta">(otherwise the best sentences are quoted)</small></span></label>
        {err && <p className="banner err" role="alert">{err}</p>}
        <div className="row"><button className="btn" disabled={busy || !hasDocs}>{busy ? "Searching" : "Ask"}</button>{!hasDocs && <span className="meta">Add or load documents first.</span>}</div>
      </form>
      {res && (
        <div className="card gap" aria-live="polite">
          <p><b>Answer</b> <Chip tone={res.answered_by === "model" ? "info" : "none"}>{res.answered_by === "model" ? `Written by ${res.model}` : "Quoted from the documents"}</Chip></p>
          <p className="wrap">{res.answer}</p>
          {res.cited.length > 0 && <><h3>Cited</h3><ul className="plain">{res.cited.map((s) => <li key={s.n}><b>[{s.n}] {s.title}</b>, part {s.chunk}: <span className="muted">{s.text}</span></li>)}</ul></>}
          <p className="meta tnum">Chunking: {res.strategy}, size {res.chunk_size}{res.strategy === "fixed" ? `, overlap ${res.overlap}` : ""} &middot; {res.chunks_in_pool} chunks searched &middot; search: {res.mode}, Top K {res.top_k}</p>
          <details className="mini"><summary>All {res.retrieved.length} retrieved parts (what the answer was allowed to use)</summary>
            <ol className="plain">{res.retrieved.map((s) => <li key={s.n}><b>{s.title}</b>, part {s.chunk} <span className="meta tnum">score {s.score}</span><br /><span className="muted">{s.text}</span></li>)}</ol></details>
        </div>
      )}
    </section>
  );
}

function Evaluation() {
  const [table, setTable] = useState<rag.Setting[] | null>(null);
  const [one, setOne] = useState<rag.Evaluation | null>(null);
  const [pick, setPick] = useState({ strategy: "paragraph", mode: "hybrid", top_k: 3 });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const run = async (f: () => Promise<void>) => { setBusy(true); setErr(""); try { await f(); } catch (x) { setErr(msg(x)); } finally { setBusy(false); } };
  const best = table ? [...table].sort((a, b) => b.hit_rate - a.hit_rate || b.mrr - a.mrr || b.answer_rate - a.answer_rate)[0] : null;
  return (
    <section aria-labelledby="rag-eval">
      <h2 id="rag-eval">3. Evaluation</h2>
      <p className="muted small">A fixed set of 18 questions on the four sample documents: 10 plain, 6 hard (other words for the same thing, or a number that also appears elsewhere) and 2 that the documents do not answer. It checks retrieval (is a part of the right document in the top K?) and the answer (does it contain the expected fact, cite the right document, and refuse when there is nothing to find?). This is the evidence for the Week 2 days.</p>
      {err && <p className="banner err" role="alert">{err}</p>}
      <div className="row">
        <button type="button" className="btn" disabled={busy} onClick={() => void run(async () => setTable(await rag.compare()))}>Compare all 18 settings</button>
        {table && <button type="button" className="btn secondary" onClick={() => downloadCsv("rag-comparison.csv", ["Chunking", "Search", "Top K", "Chunks", "Retrieval hit %", "MRR", "Answer correct %", "Citation correct %", "Refused when unanswerable %"], table.map((r) => [r.strategy, r.mode, r.top_k, r.chunks, r.hit_rate, r.mrr, r.answer_rate, r.citation_rate, r.refusal_rate]))}>Download CSV</button>}
      </div>
      {table && (
        <div className="tablewrap gap" tabIndex={0} role="region" aria-label="Comparison of all settings, scrolls sideways on small screens">
          <table>
            <thead><tr><th>Chunking</th><th>Search</th><th>Top K</th><th>Retrieval hit</th><th>MRR</th><th>Answer correct</th><th>Citation correct</th><th>Refuses unanswerable</th></tr></thead>
            <tbody>{table.map((r) => <tr key={`${r.strategy}${r.mode}${r.top_k}`} className={r === best ? "best" : undefined}><td>{r.strategy}</td><td>{r.mode}</td><td>{r.top_k}</td><td>{pct(r.hit_rate)}</td><td>{r.mrr}</td><td>{pct(r.answer_rate)}</td><td>{pct(r.citation_rate)}</td><td>{pct(r.refusal_rate)}</td></tr>)}</tbody>
          </table>
          {best && <p className="meta">Best retrieval: {best.strategy}, {best.mode}, Top K {best.top_k} ({pct(best.hit_rate)} hit, MRR {best.mrr}). The answer step quotes sentences, so it refuses questions that use other words than the documents: it never invents an answer, but a model-written answer is needed for those.</p>}
        </div>
      )}
      <h3>One setting, question by question</h3>
      <div className="row" style={{ flexWrap: "wrap" }}>
        <select aria-label="Chunking" value={pick.strategy} onChange={(e) => setPick({ ...pick, strategy: e.target.value })}>{rag.STRATEGIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select aria-label="Search" value={pick.mode} onChange={(e) => setPick({ ...pick, mode: e.target.value })}>{rag.MODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select aria-label="Top K" value={pick.top_k} onChange={(e) => setPick({ ...pick, top_k: Number(e.target.value) })}>{[1, 3, 5].map((k) => <option key={k} value={k}>Top {k}</option>)}</select>
        <button type="button" className="btn secondary" disabled={busy} onClick={() => void run(async () => setOne(await rag.evaluate(pick.strategy, pick.mode, pick.top_k)))}>Run</button>
      </div>
      {one && (
        <div className="tablewrap gap" tabIndex={0} role="region" aria-label="Results per question">
          <table>
            <thead><tr><th>Question</th><th>Right document found</th><th>Rank</th><th>Answer</th></tr></thead>
            <tbody>{one.rows.map((r) => <tr key={r.question}><td>{r.question}{!r.answerable && <span className="meta"> (not in the documents)</span>}</td><td><Chip tone={r.hit ? "ok" : "bad"}>{r.answerable ? (r.hit ? "Yes" : "No") : (r.hit ? "Refused" : "Answered")}</Chip></td><td>{r.rank ?? "-"}</td><td className="small">{r.answer}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
