import { apiJson } from "./api";

export type Task = { id: string; title: string; due_date: string | null; priority: "low" | "medium" | "high"; status: "open" | "done"; notes: string | null };
export type Action = { tool: string; outcome: string; summary: string };
export type Pending = { id: string; tool: string; summary: string; expires_at: string };
export type Reply = { reply: string; actions: Action[]; pending: Pending | null };
export type ToolCall = { tool: string; arguments: string | null; outcome: string; detail: string | null; latency_ms: number | null; created_at: string };

export const send = (message: string) => apiJson<Reply>("POST", "/api/task-assistant/message", { message });
export const confirm = (id: string, approve: boolean) => apiJson<Reply>("POST", `/api/task-assistant/confirm/${id}`, { approve });
export const tasks = () => apiJson<Task[]>("GET", "/api/task-assistant/tasks");
export const log = () => apiJson<ToolCall[]>("GET", "/api/task-assistant/log");
