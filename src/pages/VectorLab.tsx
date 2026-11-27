import { useCallback, useEffect, useRef, useState } from "react";
import * as vec from "../lib/vectorApi";
import { Chip } from "../components/Chip";

const EXAMPLES = [
  "How many days of paid annual leave do I get?",
  "Can I work from home?",
  "Who signs off on a purchase above 500 euros?",
  "How long must a password be?",
  "What is the company dress code?",
];
const REGIONS = ["", "UK", "Germany", "US", "All"];
const DEPARTMENTS = ["", "hr", "finance", "it"];
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--s-3)" } as const;
const errText = (e: unknown) => (e instanceof vec.VectorError ? e.message : "Something went wrong. Try again.");

// Step-by-step notebook of the same ideas (same documents, questions, chunker, filter check and merge rule), opened in Google Colab from the public API repository.
const COLAB_URL = "https://colab.research.google.com/github/shr1-live/fde-learning-tracker-api-personal/blob/main/docs/notebooks/week2-day3-vector-search.ipynb";

/** Week 2, Day 3 demo: live vector search against the vector service, with the settings the practical compares. */
export default function VectorLab() {
  const [url, setUrl] = useState(vec.savedUrl());
  const [key, setKey] = useState("");
  const [state, setState] = useState<"checking" | "online" | "offline">("checking");
  const [info, setInfo] = useState<vec.Stats | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const base = vec.cleanUrl(url);

  const connect = useCallback(async () => {
    setErr("");
    if (!base) { setState("offline"); setErr("Enter an address that starts with http:// or https://."); return; }
    setState("checking");
    try {
      await vec.health(base);
      vec.saveUrl(base);
      setState("online");
      setInfo(await vec.stats(base, key).catch((e) => { setErr(errText(e)); return null; }));
    } catch (e) { setState("offline"); setInfo(null); setErr(errText(e)); }
  }, [base, key]);
  useEffect(() => { void connect(); /* once, when the page opens */ // eslint-disable-line react-hooks/exhaustive-deps
  }, []);

  async function sample() {
    if (!base) return;
    setBusy(true); setErr("");
    try { await vec.loadSample(base, key); setInfo(await vec.stats(base, key)); } catch (e) { setErr(errText(e)); } finally { setBusy(false); }
  }

  return (
    <>
      <aside className="card" aria-label="Step-by-step notebook">
        <p><b>See the code, step by step.</b> A notebook runs the same ideas in small steps you can change: chunks, embeddings, similarity, filters, Top K, hybrid search and the measurements. It needs no database and no key.</p>
        <p><a className="btn" href={COLAB_URL} target="_blank" rel="noopener noreferrer">Open the notebook in Google Colab</a></p>
      </aside>
      <HowItWorks />
      <section aria-labelledby="vl-conn">
        <h2 id="vl-conn">1. The vector service</h2>
        <p className="muted small">This runs on your computer from the <code>vector-lab</code> folder of the API repository (<code>uvicorn app.server:app --port 8100</code>). The address is saved in this browser; the key, if you set one, is not.</p>
        <form className="card gap" onSubmit={(e) => { e.preventDefault(); void connect(); }}>
          <div className="row">
            <div><label htmlFor="vl-url">Service address</label><input id="vl-url" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" autoComplete="off" spellCheck={false} /></div>
            <div><label htmlFor="vl-key">API key (only if you set one)</label><input id="vl-key" type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" /></div>
          </div>
          <div className="row">
            <button className="btn" disabled={state === "checking"}>{state === "checking" ? "Checking" : "Connect"}</button>
            <Chip tone={state === "online" ? "ok" : state === "offline" ? "bad" : "none"}>{state === "online" ? "Online" : state === "offline" ? "Not reachable" : "Checking"}</Chip>
            {state === "online" && <button type="button" className="btn secondary" disabled={busy} onClick={() => void sample()}>{busy ? "Loading" : "Load the 12 sample documents"}</button>}
          </div>
          {err && <p className="banner err" role="alert">{err}</p>}
          {info && (
            <p className="meta tnum" aria-live="polite">
              {info.vector_db}{info.pgvector_version ? ` ${info.pgvector_version}` : ""} &middot; index {info.index} &middot; {info.distance} distance &middot; model {info.embedding_model} ({info.dimensions} numbers)
              &middot; <b>{info.documents} documents, {info.chunks} chunks</b>{info.table_size ? ` (${info.table_size})` : ""}
            </p>
          )}
          {state === "offline" && <p className="meta">Start it, then press Connect. A site opened over https can call a service on your own computer; if the browser asks about local network access, allow it.</p>}
        </form>
      </section>
      <Search base={base} apiKey={key} ready={state === "online" && (info?.chunks ?? 0) > 0} empty={state === "online" && info !== null && info.chunks === 0} />
    </>
  );
}

function HowItWorks() {
  return (
    <details className="mini">
      <summary>How it works: embeddings, the vector database and the filters</summary>
      <ol className="plain">
        <li><b>Ingestion</b>: each document is cut into chunks, every chunk becomes 384 numbers (an embedding, model BAAI/bge-small-en-v1.5) and is stored in Postgres with pgvector, together with its metadata: department, region and year.</li>
        <li><b>Search</b>: your question becomes 384 numbers too. <em>Vector</em> search finds the chunks whose numbers are closest (cosine similarity, through an HNSW index). <em>Keyword</em> search matches words (Postgres full text). <em>Hybrid</em> merges both rankings.</li>
        <li><b>Filters</b>: the metadata filter is applied inside the database, so a question about Germany can never return the UK policy. <b>Top K</b> is how many chunks come back: a larger K finds more but brings more noise.</li>
        <li><b>Evidence gate</b>: if the best chunk's similarity is below the minimum you set, the answer is "not enough evidence". The evaluation found this alone is not reliable, so treat it as a hint.</li>
      </ol>
    </details>
  );
}

function Search({ base, apiKey, ready, empty }: { base: string | null; apiKey: string; ready: boolean; empty: boolean }) {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<vec.Mode>("hybrid");
  const [k, setK] = useState(3);
  const [region, setRegion] = useState("");
  const [department, setDepartment] = useState("");
  const [fromYear, setFromYear] = useState<number | null>(null);
  const [auto, setAuto] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [compare, setCompare] = useState(false);
  const [results, setResults] = useState<Partial<Record<vec.Mode, vec.SearchResult>>>({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const ctl = useRef<AbortController | null>(null);

  // Real time: every change of the question or a setting searches again after a short pause; an older search is cancelled.
  useEffect(() => {
    if (!base || !ready || question.trim().length < 2) { setResults({}); setErr(""); return; }
    const t = window.setTimeout(async () => {
      ctl.current?.abort();
      const c = new AbortController(); ctl.current = c;
      setBusy(true); setErr("");
      const q = { question: question.trim(), k, filter: vec.buildFilter(region, department, fromYear), auto_filter: auto, min_score: minScore };
      const modes: vec.Mode[] = compare ? ["hybrid", "semantic", "keyword"] : [mode];
      try {
        const got = await Promise.all(modes.map(async (m) => [m, await vec.search(base, apiKey, { ...q, mode: m }, c.signal)] as const));
        if (!c.signal.aborted) setResults(Object.fromEntries(got));
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) { setErr(errText(e)); setResults({}); }
      } finally { if (!c.signal.aborted) setBusy(false); }
    }, 350);
    return () => window.clearTimeout(t);
  }, [base, apiKey, ready, question, mode, k, region, department, fromYear, auto, minScore, compare]);
  useEffect(() => () => ctl.current?.abort(), []);

  const shown: vec.Mode[] = compare ? ["hybrid", "semantic", "keyword"] : [mode];
  return (
    <section aria-labelledby="vl-search">
      <h2 id="vl-search">2. Search</h2>
      {empty && <p className="banner" role="status">The service has no documents yet. Press "Load the 12 sample documents" above.</p>}
      <div className="card gap">
        <label htmlFor="vl-q">Question <small className="meta">(searches as you type)</small></label>
        <input id="vl-q" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={500} disabled={!ready} placeholder="How many days of paid annual leave do I get?" autoComplete="off" />
        <div className="row" role="group" aria-label="Example questions">
          {EXAMPLES.map((x) => <button key={x} type="button" className="btn secondary" disabled={!ready} onClick={() => setQuestion(x)}>{x}</button>)}
        </div>
        <div className="row">
          <div><label htmlFor="vl-mode">Search</label><select id="vl-mode" value={mode} onChange={(e) => setMode(e.target.value as vec.Mode)} disabled={compare}>{vec.MODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div><label htmlFor="vl-k">Top K</label><select id="vl-k" value={k} onChange={(e) => setK(Number(e.target.value))}>{[1, 3, 5, 10].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          <div><label htmlFor="vl-region">Region</label><select id="vl-region" value={region} onChange={(e) => setRegion(e.target.value)} disabled={auto}>{REGIONS.map((r) => <option key={r} value={r}>{r || "Any"}</option>)}</select></div>
          <div><label htmlFor="vl-dept">Department</label><select id="vl-dept" value={department} onChange={(e) => setDepartment(e.target.value)}>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d || "Any"}</option>)}</select></div>
          <div><label htmlFor="vl-year">Year from</label><select id="vl-year" value={fromYear ?? ""} onChange={(e) => setFromYear(e.target.value ? Number(e.target.value) : null)}><option value="">Any</option>{[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}</select></div>
          <div><label htmlFor="vl-min">Minimum similarity: {minScore.toFixed(2)}</label><input id="vl-min" type="range" min={0} max={0.9} step={0.05} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} /></div>
        </div>
        <label className="check-row"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /><span>Read the region or year from the question <small className="meta">(for example "in Germany"; the LangGraph plan step builds the filter)</small></span></label>
        <label className="check-row"><input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} /><span>Compare vector, keyword and hybrid side by side</span></label>
        {err && <p className="banner err" role="alert">{err}</p>}
      </div>
      <div aria-live="polite" aria-busy={busy}>
        {question.trim().length >= 2 && ready && !err && Object.keys(results).length === 0 && <p className="muted">Searching&hellip;</p>}
        <div style={compare ? grid : undefined}>
          {shown.map((m) => results[m] && <Result key={m} mode={m} r={results[m]!} minScore={minScore} titled={compare} />)}
        </div>
      </div>
    </section>
  );
}

function Result({ mode, r, minScore, titled }: { mode: vec.Mode; r: vec.SearchResult; minScore: number; titled: boolean }) {
  const label = vec.MODES.find(([v]) => v === mode)![1];
  return (
    <div className="card gap">
      {titled && <h3>{label}</h3>}
      <p>
        <Chip tone={r.hits.length === 0 ? "bad" : r.enough_evidence ? "ok" : "warn"}>{r.hits.length === 0 ? "Nothing found" : r.enough_evidence ? "Enough evidence" : `Not enough evidence (best similarity below ${minScore.toFixed(2)})`}</Chip>{" "}
        <span className="meta tnum">{r.hits.length} passages in {r.timing_ms} ms</span>
      </p>
      <ol className="plain">
        {r.hits.map((h) => (
          <li key={`${h.doc_id}-${h.rank}`}>
            <b>{h.title}</b>{" "}
            <span className="meta tnum">{h.similarity !== null ? `similarity ${h.similarity.toFixed(3)}` : `score ${h.score}`}</span>{" "}
            <span className="meta">{String(h.metadata.department ?? "")} &middot; {String(h.metadata.region ?? "")} &middot; {String(h.metadata.year ?? "")}</span>
            {h.similarity !== null && <><br /><meter min={0} max={1} value={Math.max(0, h.similarity)} aria-label={`Similarity ${h.similarity.toFixed(2)}`} /></>}
            <br /><span className="muted wrap">{h.text}</span>
          </li>
        ))}
      </ol>
      <details className="mini"><summary>How this search ran (LangGraph trace)</summary><ol className="plain">{r.trace.map((t, i) => <li key={i} className="meta">{t}</li>)}</ol></details>
    </div>
  );
}
