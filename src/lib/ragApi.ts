// The document assistant (Week 2, RAG). The backend does the chunking, search and answering; these are just the calls.
import { apiJson } from "./api";

export type Doc = { id: string; title: string; tags: string[]; characters: number; chunks: number; created_at: string };
export type Source = { n: number; title: string; chunk: number; text: string; score: number };
export type Query = { question: string; strategy: string; mode: string; top_k: number; tag?: string; use_model?: boolean; chunk_size?: number; overlap?: number };
export type Answer = { question: string; strategy: string; mode: string; top_k: number; chunk_size: number; overlap: number; chunks_in_pool: number; answered_by: "model" | "extractive"; model: string | null; grounded: boolean; answer: string; cited: Source[]; retrieved: Source[] };
export type EvalRow = { question: string; answerable: boolean; hit: boolean; rank: number | null; answer_ok: boolean; citation_ok: boolean; answer: string };
export type Setting = { strategy: string; mode: string; top_k: number; chunks: number; answerable: number; hit_rate: number; mrr: number; answer_rate: number; citation_rate: number; refusal_rate: number };
export type Evaluation = Setting & { rows: EvalRow[] };

export const STRATEGIES = [["paragraph", "By paragraph"], ["fixed", "Fixed windows with overlap"]] as const;
export const MODES = [["hybrid", "Hybrid (both)"], ["semantic", "Vector (embedding)"], ["keyword", "Keyword (BM25)"]] as const;

export const documents = () => apiJson<Doc[]>("GET", "/api/rag/documents");
export const addDocument = (title: string, text: string, tags: string[]) => apiJson<Doc>("POST", "/api/rag/documents", { title, text, tags });
export const removeDocument = (id: string) => apiJson<void>("DELETE", `/api/rag/documents/${id}`);
export const loadSample = () => apiJson<Doc[]>("POST", "/api/rag/sample");
export const search = (q: Query) => apiJson<{ chunks_in_pool: number; embeddings_stored: number; embedding_dimensions: number; results: Source[] }>("POST", "/api/rag/search", q);
export const ask = (q: Query) => apiJson<Answer>("POST", "/api/rag/ask", q);
export const evaluate = (strategy: string, mode: string, topK: number, size?: number, overlap?: number) =>
  apiJson<Evaluation>("GET", `/api/rag/eval?strategy=${strategy}&mode=${mode}&top_k=${topK}${size ? `&chunk_size=${size}` : ""}${overlap !== undefined ? `&overlap=${overlap}` : ""}`);
export const compare = () => apiJson<Setting[]>("GET", "/api/rag/eval/compare");
