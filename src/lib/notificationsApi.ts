// Notifications from the server: the 10:00 daily-log reminder and "someone submitted their week". Always the signed-in person's own.
import { useCallback, useEffect, useState } from "react";
import { API_URL, apiJson } from "./api";
import type { Reminder } from "./reminders";

export type ServerNote = { id: string; kind: "daily_log_missed" | "week_submitted"; on_date: string; title: string; body: string; link: string | null; created_at: string; read: boolean };
type List = { items: ServerNote[]; unread: number };

const list = () => apiJson<List>("GET", "/api/notifications");
const markAll = () => apiJson<unknown>("POST", "/api/notifications/read-all");

/** The server's notifications, refreshed every minute, as reminders the bell and the Notifications page already know how to show. */
export function useServerNotifications(enabled = true): { items: Reminder[]; unread: number; markAllRead: () => void } {
  const [data, setData] = useState<List>({ items: [], unread: 0 });
  useEffect(() => {
    if (!enabled || !API_URL) return;
    let live = true;
    const load = () => list().then((d) => { if (live) setData(d); }).catch(() => {});
    load();
    const t = window.setInterval(load, 60000);
    return () => { live = false; window.clearInterval(t); };
  }, [enabled]);
  const markAllRead = useCallback(() => { setData((d) => ({ ...d, unread: 0, items: d.items.map((i) => ({ ...i, read: true })) })); markAll().catch(() => {}); }, []);
  const items: Reminder[] = data.items.map((n) => ({
    id: `${n.kind === "week_submitted" ? "week" : "log"}:srv:${n.id}`, tone: n.kind === "week_submitted" ? "info" : "warn", title: n.title, body: n.body, to: n.link ?? "/daily-log", toLabel: n.kind === "week_submitted" ? "Open the team week" : "Fill the daily log",
  }));
  return { items, unread: data.unread, markAllRead };
}
