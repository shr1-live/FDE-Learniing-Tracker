import type { ReactNode } from "react";

/** The top of a page: an overline (where you are), the one h1, a line of help, and the page's main action. */
export function PageHeader({ overline, title, sub, actions }: { overline?: ReactNode; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="page-head-row">
        <div className="grow">
          {overline && <p className="eyebrow">{overline}</p>}
          <h1>{title}</h1>
          {sub && <p className="page-sub">{sub}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </header>
  );
}
