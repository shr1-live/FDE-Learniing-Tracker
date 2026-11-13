const FILES = [
  ["FDE-Training-Outline-6-week.pdf", "Standard six-week outline", "The company programme: expectations, skills, working knowledge, weekly outputs."],
  ["FDE-2-Week-Plan-v3.pdf", "Ten-day fast-track plan (latest)", "Layer by layer plan with watch and read links, Azure and local tracks, readiness table."],
  ["FDE-Start-Tomorrow-Playbook.pdf", "Start-tomorrow playbook", "Setup checklist, Day 1 block by block, hour-by-hour schedule for Days 2 to 10."],
  ["ops-copilot-scaffold.zip", "Repo scaffold for the capstone", "Folders, tracker, Day 1 templates and the setup checklist."],
];
export default function Docs() {
  return (
    <>
      <header className="ph"><h1>Downloads</h1></header>
      <ul className="files">{FILES.map(([f, t, d]) => (
        <li key={f} className="card"><h3>{t}</h3><p className="muted">{d}</p><a className="btn" href={`/docs/${f}`} target="_blank" rel="noopener noreferrer">{f.endsWith(".zip") ? "Download" : "Open PDF"}</a></li>))}</ul>
    </>
  );
}
