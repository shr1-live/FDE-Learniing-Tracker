// Week 2, Day 3: the vector search service (the vector-lab folder in the API repo: Postgres + pgvector, LangChain, LangGraph).
// It is a separate small service, so it is called straight from the browser. The address is the person's own (default: their own computer).
// Only the service address is remembered; the optional API key lives in memory and is never stored.

export const DEFAULT_URL = "http://localhost:8100";
const KEY = "vector-lab-url";

export type Hit = { rank: number; doc_id: string; title: string; score: number; similarity: number | null; metadata: Record<string, string | number>; text: string };
export type SearchResult = { enough_evidence: boolean; filter: unknown; timing_ms: number; trace: string[]; hits: Hit[] };
export type Stats = { vector_db: string; pgvector_version?: string; index: string; distance: string; embedding_model: string; dimensions: number; chunks: number; documents: number; table_size?: string };
export type Mode = "semantic" | "keyword" | "hybrid";
export type Filter = Record<string, unknown> | null;
export type Query = { question: string; mode: Mode; k: number; filter: Filter; auto_filter: boolean; min_score: number };

export const MODES: readonly [Mode, string][] = [["hybrid", "Hybrid (vector + keyword)"], ["semantic", "Vector (embedding)"], ["keyword", "Keyword (full text)"]];

export function savedUrl(): string {
  try { return localStorage.getItem(KEY) || DEFAULT_URL; } catch { return DEFAULT_URL; }
}
export function saveUrl(u: string) { try { localStorage.setItem(KEY, u); } catch { /* the address just is not remembered */ } }

/** Only http(s) addresses are used, without a path, so a typo cannot send requests somewhere unexpected. */
export function cleanUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.origin;
  } catch { return null; }
}

export class VectorError extends Error { constructor(message: string, readonly status = 0) { super(message); } }

async function call<T>(base: string, key: string, method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(base + path, { method, signal, headers: { ...(body ? { "content-type": "application/json" } : {}), ...(key ? { "x-api-key": key } : {}) }, body: body ? JSON.stringify(body) : undefined });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new VectorError("Cannot reach the vector service. Is it running, and is the address right?");
  }
  if (!res.ok) {
    let detail = "";
    try { const j = await res.json(); detail = typeof j.detail === "string" ? j.detail : Array.isArray(j.detail) ? j.detail.map((d: { msg?: string }) => d.msg).join("; ") : ""; } catch { /* no body */ }
    throw new VectorError(res.status === 401 ? "The service wants an API key (X-Api-Key). Enter it above." : detail || `The service answered ${res.status}.`, res.status);
  }
  return (await res.json()) as T;
}

export const health = (base: string, signal?: AbortSignal) => call<{ ok: boolean }>(base, "", "GET", "/health", undefined, signal);
export const stats = (base: string, key: string) => call<Stats>(base, key, "GET", "/stats");
export const loadSample = (base: string, key: string) => call<{ documents: number; chunks: number }>(base, key, "POST", "/documents/sample");
export const search = (base: string, key: string, q: Query, signal?: AbortSignal) =>
  call<SearchResult>(base, key, "POST", "/search", { question: q.question, mode: q.mode, k: q.k, filter: q.filter, auto_filter: q.auto_filter, min_score: q.min_score }, signal);

/** The filter a person builds from three boxes, in the service's filter syntax. */
export function buildFilter(region: string, department: string, fromYear: number | null): Filter {
  const c: Record<string, unknown>[] = [];
  if (region) c.push({ region });
  if (department) c.push({ department });
  if (fromYear) c.push({ year: { $gte: fromYear } });
  return c.length === 0 ? null : c.length === 1 ? c[0]! : { $and: c };
}
