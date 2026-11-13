import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import { useStore } from "./lib/store";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import { PlanList, DayPage } from "./pages/Plan";
import Outline from "./pages/Outline";
import Readiness from "./pages/Readiness";
import StackGuide from "./pages/StackGuide";
import Curated from "./pages/Curated";
import Team from "./pages/Team";
import Docs from "./pages/Docs";
import BackButton from "./components/BackButton";
import ThemeSwitch from "./components/ThemeSwitch";

const NAV: [string, string][] = [["/", "Dashboard"], ["/plan", "Ten-day plan"], ["/outline", "Six-week programme"], ["/stack", "Stack guide"], ["/curated", "Curated: .NET"], ["/readiness", "Readiness"], ["/team", "Team"], ["/docs", "Downloads"]];

export default function App() {
  const { ready, user, signOut, saveError, pct } = useStore();
  if (!ready) return <main className="center"><p className="muted">Loading</p></main>;
  if (!user) return <Landing />;
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><span className="mark" aria-hidden="true"><i /><i /><i /></span>FDE Tracker</div>
        <nav aria-label="Main">{NAV.map(([to, label]) => (<NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>))}</nav>
        <div className="who"><ThemeSwitch /><div className="meter small"><i style={{ width: pct + "%" }} /></div><small>{user.email}</small><button className="linkbtn" onClick={signOut}>Sign out</button></div>
      </aside>
      <main className="main">
        <div className="topbar"><BackButton /></div>
        {saveError && <p className="banner err" role="alert">Could not save to the database: {saveError}</p>}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plan" element={<PlanList />} />
          <Route path="/plan/:n" element={<DayPage />} />
          <Route path="/outline" element={<Outline />} />
          <Route path="/stack" element={<StackGuide />} />
          <Route path="/curated" element={<Curated />} />
          <Route path="/readiness" element={<Readiness />} />
          <Route path="/team" element={<Team />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
