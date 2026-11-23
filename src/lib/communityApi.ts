// Peer comments inside a batch, the opt-in leaderboard, and (admin) email invites. The server enforces every rule.
import { apiJson } from "./api";

export type PeerItem = { id: string; task_key: string; author: string; note: string | null; learned: string | null; submitted_at: string | null };
export type PeerComment = { author: string; comment: string; created_at: string };
export type BoardRow = { user_id: string; name: string; approved: number; handed_in: number; me: boolean };
export type Board = { on: boolean; in_batch: boolean; rows: BoardRow[] };
export type InviteRow = { email: string; batch_name: string | null; created_at: string; used: boolean };

export const peerQueue = () => apiJson<PeerItem[]>("GET", "/api/peer/queue");
export const peerComment = (submissionId: string, comment: string) => apiJson<unknown>("POST", `/api/peer/${submissionId}/comment`, { comment: comment.trim() });
export const peerOnMine = (taskKey: string) => apiJson<PeerComment[]>("GET", `/api/peer/mine/${encodeURIComponent(taskKey)}`);
export const leaderboard = () => apiJson<Board>("GET", "/api/leaderboard");
export const joinBoard = (on: boolean) => apiJson<unknown>("PUT", "/api/leaderboard/me", { on });
export const invites = () => apiJson<InviteRow[]>("GET", "/api/admin/invites");
export const invite = (emails: string[], batch_id: string | null) => apiJson<{ added: number; existing: number; rejected: string[] }>("POST", "/api/admin/invites", { emails, batch_id });
