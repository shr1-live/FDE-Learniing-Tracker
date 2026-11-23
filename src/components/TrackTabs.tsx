import { Link } from "react-router-dom";

/** The programme has two tracks: the FDE programme and the DevOps study program. This switch sits at the top of both. */
export function TrackTabs({ current }: { current: "fde" | "devops" }) {
  return (
    <nav className="weeksw tracktabs" aria-label="Programme track">
      <Link to="/week/1" aria-current={current === "fde" ? "page" : undefined}>FDE</Link>
      <Link to="/devops/week/1" aria-current={current === "devops" ? "page" : undefined}>DevOps</Link>
    </nav>
  );
}
