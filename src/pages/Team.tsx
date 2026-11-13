import { useEffect, useState } from "react";
import { useStore, TeamRow } from "../lib/store";
import { stackById } from "../data/stacks";

export default function Team() {
  const { team, mode } = useStore();
  const [rows, setRows] = useState<TeamRow[] | null>(null);
  useEffect(() => { team().then(setRows); }, [team]);
  return (
    <>
      <header className="ph"><h1>Team</h1><p className="muted">Everyone signed in with an office email, with the stack they picked and how far through the ten-day plan they are.</p></header>
      {mode === "local" && <p className="banner">No database is connected, so you only see yourself here.</p>}
      {rows === null ? <p className="muted">Loading</p> : rows.length === 0 ? <p className="muted">Nobody has joined yet. Share the link with your cohort.</p> : (
        <div className="tablewrap"><table>
          <thead><tr><th>Name</th><th>Stack</th><th>Progress</th><th>Last active</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i}><td>{r.display_name || "Unnamed"}</td><td>{stackById(r.stack).label}</td>
              <td><span className="meter small"><i style={{ width: r.pct + "%" }} /></span> {r.pct}%</td>
              <td>{new Date(r.updated_at).toLocaleDateString()}</td></tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}
