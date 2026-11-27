import { useCallback, useEffect, useRef, useState } from "react";
import * as vec from "../lib/vectorApi";
import { Chip } from "../components/Chip";

const DEPARTMENTS = ["hr", "finance", "it", "general"];
const REGIONS = ["All", "UK", "Germany", "US"];
const errText = (e: unknown) => (e instanceof vec.VectorError ? e.message : "Something went wrong. Try again.");

type Exchange = { q: string; a?: vec.Answer; err?: string };

/** Week 2, Day 5: the document assistant. Upload approved documents, ask questions, get answers with citations, ask follow-ups.
 *  The service decides who may read which document (tenant, department, flagged files); nothing here is a security boundary. */
export default function DocQA() {
  const [url, setUrl] = useState(vec.savedUrl());
  const [key, setKey] = useState("");
  const [state, setState] = useState<"checking" | "online" | "offline">("checking");
  const [me, setMe] = useState<vec.Me | null>(null);
  const [docs, setDocs] = useState<vec.AsstDoc[]>([]);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const base = vec.cleanUrl(url);

  const refresh = useCallback(async (b: string, k: string) => {
    setMe(await vec.asstMe(b, k));
    setDocs(await vec.asstDocs(b, k));
  }, []);

  const connect = useCallback(async () => {
    setErr(""); setNote("");
    if (!base) { setState("offline"); setErr("Enter an address that starts with http:// or https://."); return; }
    setState("checking");
    try {
      await vec.health(base);
      vec.saveUrl(base);
      await refresh(base, key);
      setState("online");
    } catch (e) { setState("offline"); setMe(null); setDocs([]); setErr(errText(e)); }
  }, [base, key, refresh]);
  useEffect(() => { void connect(); /* once, when the page opens */ // eslint-disable-line react-hooks/exhaustive-deps
  }, []);

  async function run(fn: () => Promise<unknown>) {
    if (!base) return;
    setBusy(true); setErr(""); setNote("");
    try { await fn(); await refresh(base, key); } catch (e) { setErr(errText(e)); } finally { setBusy(false); }
  }

  return (
    <>
      <details className="mini">
        <summary>How it works: upload, ask, cite, and who may read what</summary>
        <ol className="plain">
          <li><b>Upload</b>: a .txt, .md, .pdf or .docx file (up to 2 MB). The service reads the text, cleans it, checks it for hidden instructions to an AI model, cuts it into chunks and stores them with their department, region and year.</li>
          <li><b>Ask</b>: the best chunks are found (vector and keyword search merged), and the answer is built from them with a citation like [1]. If the documents do not say, the answer is a refusal. A short follow-up such as "and in Germany?" is completed from your last question, and the completed question is shown.</li>
          <li><b>Who may read what</b>: every question is limited to your own space and to your departments by the <em>service</em>, not by this page. A file that looks like it contains orders for a model is flagged and never used. Another person's document looks like a missing one.</li>
        </ol>
      </details>
      <section aria-labelledby="dq-conn">
        <h2 id="dq-conn">1. The service</h2>
        <p className="muted small">Runs on your computer from the <code>vector-lab</code> folder (<code>uvicorn app.server:app --port 8100</code>). The address is saved in this browser; the key, if you use one, is not.</p>
        <form className="card gap" onSubmit={(e) => { e.preventDefault(); void connect(); }}>
          <div className="row">
            <div><label htmlFor="dq-url">Service address</label><input id="dq-url" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" autoComplete="off" spellCheck={false} /></div>
            <div><label htmlFor="dq-key">API key (only if the service uses people)</label><input id="dq-key" type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" /></div>
          </div>
          <div className="row">
            <button className="btn" disabled={state === "checking"}>{state === "checking" ? "Checking" : "Connect"}</button>
            <Chip tone={state === "online" ? "ok" : state === "offline" ? "bad" : "none"}>{state === "online" ? "Online" : state === "offline" ? "Not reachable" : "Checking"}</Chip>
            {state === "online" && me?.admin && <button type="button" className="btn secondary" disabled={busy} onClick={() => void run(async () => { const r = await vec.asstSample(base!, key); setNote(`Loaded ${r.documents} sample documents (${r.chunks} chunks).`); })}>Load the 12 sample documents</button>}
          </div>
          {err && <p className="banner err" role="alert">{err}</p>}
          {note && <p className="callout ok" role="status">{note}</p>}
          {me && <p className="meta" aria-live="polite">You are <b>{me.owner}</b> &middot; {me.admin ? "admin: every department" : me.departments.length ? `departments: ${me.departments.join(", ")}` : "no department: only documents marked for everyone"}</p>}
          {state === "offline" && <p className="meta">Start the service, then press Connect.</p>}
        </form>
      </section>
      {state === "online" && base && me && (
        <>
          <Documents base={base} apiKey={key} me={me} docs={docs} busy={busy} run={run} setNote={setNote} />
          <Chat base={base} apiKey={key} ready={docs.some((d) => !d.flagged)} />
        </>
      )}
    </>
  );
}

function Documents({ base, apiKey, me, docs, busy, run, setNote }: { base: string; apiKey: string; me: vec.Me; docs: vec.AsstDoc[]; busy: boolean; run: (fn: () => Promise<unknown>) => Promise<void>; setNote: (s: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [department, setDepartment] = useState(me.admin ? "general" : me.departments[0] ?? "general");
  const [region, setRegion] = useState("All");
  const [year, setYear] = useState(2025);
  const [localErr, setLocalErr] = useState("");
  const allowed = me.admin ? DEPARTMENTS : DEPARTMENTS.filter((d) => me.departments.includes(d));

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setLocalErr("");
    const f = fileRef.current?.files?.[0];
    if (!f) { setLocalErr("Choose a file first."); return; }
    if (f.size > vec.MAX_UPLOAD_BYTES) { setLocalErr("The file is larger than 2 MB."); return; }
    await run(async () => {
      const r = await vec.asstUpload(base, apiKey, { filename: f.name, content_base64: await vec.fileToBase64(f), department, region, year });
      setNote(r.warning ?? `Added ${r.title}: ${r.chunks} chunks in ${r.department}.`);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <section aria-labelledby="dq-docs">
      <h2 id="dq-docs">2. Your documents</h2>
      <form className="card gap" onSubmit={(e) => void upload(e)}>
        <div className="row">
          <div><label htmlFor="dq-file">File (.txt, .md, .pdf, .docx, up to 2 MB)</label><input id="dq-file" ref={fileRef} type="file" accept={vec.ACCEPT} /></div>
          <div><label htmlFor="dq-dep">Department</label><select id="dq-dep" value={department} onChange={(e) => setDepartment(e.target.value)}>{(allowed.length ? allowed : ["general"]).map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label htmlFor="dq-reg">Region</label><select id="dq-reg" value={region} onChange={(e) => setRegion(e.target.value)}>{REGIONS.map((r) => <option key={r}>{r}</option>)}</select></div>
          <div><label htmlFor="dq-year">Year</label><input id="dq-year" type="number" min={1990} max={2100} value={year} onChange={(e) => setYear(Number(e.target.value) || 2025)} /></div>
        </div>
        <div className="row"><button className="btn" disabled={busy}>{busy ? "Working" : "Upload"}</button></div>
        {localErr && <p className="banner err" role="alert">{localErr}</p>}
      </form>
      {docs.length === 0 ? <p className="muted">No documents you may read yet. Upload one{me.admin ? " or load the samples" : ""}.</p> : (
        <ul className="plain" style={{ display: "grid", gap: "var(--s-2)" }}>
          {docs.map((d) => (
            <li key={d.doc_id} className="card row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <span><b>{d.title}</b> <span className="meta">{d.department} &middot; {d.region} {d.year} &middot; {d.chunks} chunks</span> {d.flagged && <Chip tone="bad">Flagged: contains instructions to a model, not used</Chip>}</span>
              <button type="button" className="btn secondary" disabled={busy} onClick={() => void run(async () => { await vec.asstDelete(base, apiKey, d.doc_id); setNote(`Removed ${d.title}.`); })}>Remove<span className="sr"> {d.title}</span></button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Chat({ base, apiKey, ready }: { base: string; apiKey: string; ready: boolean }) {
  const [question, setQuestion] = useState("");
  const [k, setK] = useState(3);
  const [gate, setGate] = useState(0.6);
  const [log, setLog] = useState<Exchange[]>([]);
  const [busy, setBusy] = useState(false);
  const ctl = useRef<AbortController | null>(null);
  useEffect(() => () => ctl.current?.abort(), []);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 2 || busy) return;
    const history: vec.Turn[] = log.slice(-3).flatMap((x) => (x.a ? [{ role: "user" as const, content: x.q }, { role: "assistant" as const, content: x.a.answer }] : []));
    ctl.current?.abort();
    const c = new AbortController(); ctl.current = c;
    setBusy(true); setQuestion("");
    try {
      const a = await vec.asstAsk(base, apiKey, { question: q, history, k, min_score: gate }, c.signal);
      setLog((l) => [...l, { q, a }]);
    } catch (er) {
      if (!(er instanceof DOMException && er.name === "AbortError")) setLog((l) => [...l, { q, err: errText(er) }]);
    } finally { if (!c.signal.aborted) setBusy(false); }
  }

  return (
    <section aria-labelledby="dq-chat">
      <h2 id="dq-chat">3. Ask</h2>
      {!ready && <p className="muted">Add a document first. Flagged files are never used.</p>}
      <form className="card gap" onSubmit={(e) => void ask(e)}>
        <div><label htmlFor="dq-q">Your question</label><input id="dq-q" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={500} autoComplete="off" disabled={!ready} placeholder="For example: How many days of paid annual leave do I get?" /></div>
        <div className="row">
          <div><label htmlFor="dq-k">Chunks to use (Top K): {k}</label><input id="dq-k" type="range" min={1} max={10} value={k} onChange={(e) => setK(Number(e.target.value))} /></div>
          <div><label htmlFor="dq-gate">Refuse below similarity: {gate.toFixed(2)}</label><input id="dq-gate" type="range" min={0} max={0.9} step={0.05} value={gate} onChange={(e) => setGate(Number(e.target.value))} /></div>
        </div>
        <div className="row">
          <button className="btn" disabled={!ready || busy || question.trim().length < 2}>{busy ? "Asking" : "Ask"}</button>
          {log.length > 0 && <button type="button" className="btn secondary" onClick={() => setLog([])}>Start a new conversation</button>}
        </div>
        <p className="meta">A short follow-up like "and in Germany?" is completed from your last question. The refusal level is a hint, not a guarantee: the Day 4 evaluation found that a similarity score alone cannot always tell an answerable question from one that is not in the documents.</p>
      </form>
      <ol className="plain" role="log" aria-live="polite" style={{ display: "grid", gap: "var(--s-3)" }}>
        {log.map((x, i) => (
          <li key={i} className="card gap">
            <p><b>You:</b> {x.q}</p>
            {x.err && <p className="banner err" role="alert">{x.err}</p>}
            {x.a && <Reply a={x.a} />}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Reply({ a }: { a: vec.Answer }) {
  return (
    <>
      <p><b>Assistant:</b> {a.answer} {a.refused && <Chip tone="warn">Refused: {a.reason ?? "not in the documents"}</Chip>}</p>
      {a.rewritten && <p className="meta">Searched for: <em>{a.standalone_question}</em></p>}
      {a.sources.length > 0 && (
        <details className="mini">
          <summary>{a.sources.length} source{a.sources.length === 1 ? "" : "s"} used{a.cited ? `, answer cites [${a.cited}]` : ""}</summary>
          <ol className="plain">
            {a.sources.map((s) => (
              <li key={s.n}><b>[{s.n}] {s.title}</b> <span className="meta">{s.department} &middot; {s.region} {s.year}{s.similarity !== null ? ` · similarity ${s.similarity.toFixed(2)}` : ""}{s.n === a.cited ? " · cited" : ""}</span><br /><span className="small">{s.text}</span></li>
            ))}
          </ol>
        </details>
      )}
      <p className="meta tnum">{a.generator} answer &middot; {a.timing_ms.total} ms &middot; best similarity {a.best_similarity ?? "none"} &middot; request {a.request_id}</p>
    </>
  );
}
