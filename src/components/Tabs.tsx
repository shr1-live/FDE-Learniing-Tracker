import { Link, useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";

export type TabDef = { id: string; label: string; count?: number | string };

/** The current tab of a page, kept in the address (?tab=...) so it can be linked, bookmarked and reached with Back. */
export function useTab(tabs: TabDef[]): string {
  const [params] = useSearchParams();
  const t = params.get("tab");
  return tabs.find((x) => x.id === t)?.id ?? tabs[0]!.id;
}

/** Tab links under a page title. The first tab has no ?tab, so the plain address stays the default view. */
export function Tabs({ tabs, current, label }: { tabs: TabDef[]; current: string; label: string }) {
  const [params] = useSearchParams();
  const href = (id: string) => { const p = new URLSearchParams(params); if (id === tabs[0]!.id) p.delete("tab"); else p.set("tab", id); const s = p.toString(); return s ? `?${s}` : "?"; };
  return (
    <nav className="tabs" aria-label={label}>
      {tabs.map((t) => (
        <Link key={t.id} to={href(t.id)} replace aria-current={t.id === current ? "page" : undefined}>
          {t.label}{t.count !== undefined && t.count !== "" && <span className="tab-count">{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

export function TabPanel({ children, label }: { children: ReactNode; label: string }) {
  return <div className="tabpanel" role="region" aria-label={label} key={label}>{children}</div>;
}
