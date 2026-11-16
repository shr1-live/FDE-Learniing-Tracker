import { supabase } from "./supabase";
import { devToken } from "./devPersona";

// Address of the backend API (Render). Not a secret. Without it, pages that need the API say they are not connected.
export const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const SIGN_IN = "Sign in with your office account to use this.";

/** The sign-in token for the API: the Supabase session, or (dev builds only) a test account's token. */
async function bearer(): Promise<string> {
  const dev = devToken(); // null on the live site; in dev builds an active test account is used first
  if (dev) return dev;
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const t = data.session?.access_token;
    if (t) return t;
  }
  throw new ApiError(401, SIGN_IN);
}

async function send(method: string, path: string, body?: BodyInit, json = false): Promise<Response> {
  const token = await bearer();
  try {
    return await fetch(API_URL + path, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(json ? { "Content-Type": "application/json" } : {}) },
      body,
    });
  } catch {
    throw new ApiError(0, "Could not reach the service. If it was idle it may need about 30 seconds to wake up; try again.");
  }
}

async function failure(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null);
  return new ApiError(res.status, typeof body?.error === "string" ? body.error : "Something went wrong. Try again.");
}

export async function apiJson<T>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, payload?: unknown): Promise<T> {
  const res = await send(method, path, payload === undefined ? undefined : JSON.stringify(payload), payload !== undefined);
  if (!res.ok) throw await failure(res);
  return (await res.json()) as T;
}

export async function apiForm<T>(path: string, form: FormData): Promise<T> {
  const res = await send("POST", path, form); // the browser sets the multipart boundary itself
  if (!res.ok) throw await failure(res);
  return (await res.json()) as T;
}

/** A file, fetched with the sign-in token (an <img> or link cannot send one). */
export async function apiBlob(path: string): Promise<Blob> {
  const res = await send("GET", path);
  if (!res.ok) throw await failure(res);
  return res.blob();
}
