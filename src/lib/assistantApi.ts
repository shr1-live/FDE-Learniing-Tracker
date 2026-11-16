import { supabase } from "./supabase";

// Address of the backend API (Render). Not a secret. Without it the Assistant page says it is not connected.
export const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? "").replace(/\/$/, "");

export type Candidate = { name: string; profile: string };
export type Analysis = {
  prompt_version: string; model: string; latency_ms: number; input_tokens: number; output_tokens: number;
  required_skills: string[]; warnings: string[];
  candidates: {
    id: number; name: string; summary: string; fit: string; gaps: string[]; not_stated: string[];
    matched_skills: { skill: string; evidence: string }[];
    check: { matched: string[]; missing: string[]; score: number };
  }[];
};
export type Usage = { configured: boolean; model: string | null; daily_cap: number; used_today: number; prompt_versions: string[] };

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  if (!supabase) throw new ApiError(401, "Sign in with your office account to use the assistant.");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiError(401, "Sign in with your office account to use the assistant.");
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Could not reach the assistant service. If it was idle it may need about 30 seconds to wake up; try again.");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, typeof json?.error === "string" ? json.error : "Something went wrong. Try again.");
  return json as T;
}

export const getUsage = () => call<Usage>("GET", "/api/assistant/usage");
export const analyze = (job_description: string, candidates: Candidate[], prompt_version: string) =>
  call<Analysis>("POST", "/api/assistant/analyze", { job_description, candidates, prompt_version });
