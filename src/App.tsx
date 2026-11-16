import { useState } from "react";
import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import { useStore } from "./lib/store";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import { PlanList, DayPage } from "./pages/Plan";
import Outline from "./pages/Outline";
import WeekPlan from "./pages/WeekPlan";
import Assistant from "./pages/Assistant";
import Week1Report from "./pages/Week1Report";
import Readiness from "./pages/Readiness";
import StackGuide from "./pages/StackGuide";
import Curated from "./pages/Curated";
import Admin from "./pages/Admin";
import MyPlan from "./pages/MyPlan";
import Gate from "./pages/Gate";
import Docs from "./pages/Docs";
import BackButton from "./components/BackButton";
import ThemeSwitch from "./components/ThemeSwitch";
import { Icon, IconName } from "./components/Icon";
import { Progress } from "./components/Progress";
import Review from "./pages/Review";
import { DevPersonaBar } from "./components/DevPersonaBar";
import { useDevPersona } from "./lib/devPersona";
import { canReview, useMe } from "./lib/useRole";

const ADMIN_ONLY = new Set(["/plan", "/curated"]); // the admin's personal ten-day plan
const NAV: [string, string][] = [["/", "Dashboard"], ["/plan", "Ten-day plan"], ["/outline", "Six-week programme"], ["/week", "Week 1 tasks"], ["/assistant", "Assistant"], ["/report", "Week 1 report"], ["/stack", "Stack guide"], ["/curated", "Curated: .NET"], ["/readiness", "Readiness"], ["/docs", "Downloads"]];

const NAV_ICON: Record<string, IconName> = {
  "/": "home", "/myplan": "user", "/plan": "list", "/outline": "book", "/week": "tasks", "/assistant": "spark", "/report": "chart", "/review": "inbox",
  "/stack": "compass", "/curated": "layers", "/readiness": "target", "/docs": "download", "/admin": "shield",
};

export default function App() {
  const { ready, user, signOut, saveError, pct, access, isAdmin } = useStore();
  const [collapsed, setCollapsed] = useState(() => { try { const v = localStorage.getItem("fde:nav"); return v === null ? window.innerWidth < 900 : v === "1"; } catch { return false; } });
  const persona = useDevPersona(); // empty on the live site
  const { me } = useMe();
  const toggle = () => setCollapsed((c) => { try { localStorage.setItem("fde:nav", c ? "0" : "1"); } catch { /* ignore */ } return !c; });
  if (!ready) return <main className="center"><p className="muted">Loading</p></main>;
  if (!user) return <Landing />;
  if (access !== "approved") return <Gate />;
  const nav: [string, string][] = isAdmin
    ? [...NAV, ["/admin", "Admin"]]
    : [["/", "Dashboard"], ["/myplan", "My plan"], ...NAV.filter(([to]) => to !== "/" && !ADMIN_ONLY.has(to))];
  // Reviewers and admins (as the API says) get the review page. The API enforces this too; the link is only a convenience.
  if (canReview(me)) nav.splice(nav.findIndex(([to]) => to === "/report") + 1, 0, ["/review", "Review submissions"]);
  const mine = (el: JSX.Element) => (isAdmin ? el : <Navigate to="/" replace />);
  return (
    <div className={"shell" + (collapsed ? " collapsed" : "")}>
      <aside className="side">
        <div className="side-head">
          <div className="brand"><span className="mark" aria-hidden="true"><i /><i /><i /></span>FDE Tracker</div>
          <button type="button" className="burger" onClick={toggle} aria-expanded={!collapsed} aria-label="Show or hide the side menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        <nav aria-label="Main">{nav.map(([to, label]) => (<NavLink key={to} to={to} end={to === "/"}><Icon name={NAV_ICON[to] ?? "list"} />{label}</NavLink>))}</nav>
        <div className="who"><DevPersonaBar /><ThemeSwitch /><Progress value={pct} label="Overall progress" small /><small>{user.email}</small><button className="linkbtn" onClick={signOut}>Sign out</button></div>
      </aside>
      <main className="main">
        <div className="topbar">
          <button type="button" className="burger" onClick={toggle} aria-expanded={!collapsed} aria-label="Show or hide the side menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <BackButton />
        </div>
        {saveError && <p className="banner err" role="alert">Could not save to the database: {saveError}</p>}
        <Routes key={persona}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plan" element={mine(<PlanList />)} />
          <Route path="/plan/:n" element={mine(<DayPage />)} />
          <Route path="/myplan" element={isAdmin ? <Navigate to="/plan" replace /> : <MyPlan />} />
          <Route path="/outline" element={<Outline />} />
          <Route path="/week" element={<WeekPlan />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/report" element={<Week1Report />} />
          <Route path="/review" element={<Review />} />
          <Route path="/stack" element={<StackGuide />} />
          <Route path="/curated" element={mine(<Curated />)} />
          <Route path="/readiness" element={<Readiness />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
