import { useEffect, useState } from "react";
import { API_URL, apiJson } from "./api";

export type Me = { id: string; email: string; role: "member" | "reviewer" | "admin"; access: string };

/**
 * The signed-in person's role as the API sees it. The menu uses it to show the review page; the API enforces it anyway,
 * so hiding a link is a convenience, never the protection. Pass something that changes when the person changes.
 */
export function useRole(who: string): { me: Me | null; ready: boolean } {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!API_URL) { setReady(true); return; }
    let alive = true;
    setReady(false);
    apiJson<Me>("GET", "/api/me")
      .then((m) => { if (alive) setMe(m); })
      .catch(() => { if (alive) setMe(null); })
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, [who]);
  return { me, ready };
}

export const canReview = (me: Me | null) => me?.role === "reviewer" || me?.role === "admin";
