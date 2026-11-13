import { useEffect, useState } from "react";
import { NavLink, Route, Routes, Navigate, useLocation } from "react-router-dom";
import NavIcon from "./components/NavIcon";
import { useStore } from "./lib/store";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import { PlanList, DayPage } from "./pages/Plan";
import Outline from "./pages/Outline";
import Readiness from "./pages/Readiness";
import StackGuide from "./pages/StackGuide";
import Curated from "./pages/Curated";
import Admin from "./pages/Admin";
import Gate from "./pages/Gate";
import Docs from "./pages/Docs";
import BackButton from "./components/BackButton";
import ThemeSwitch from "./components/ThemeSwitch";

const NAV: [string, string][] = [["/", "Dashboard"], ["/plan", "Ten-day plan"], ["/outline", "Six-week programme"], ["/stack", "Stack guide"], ["/curated", "Curated: .NET"], ["/readiness", "Readiness"], ["/docs", "Downloads"]];

export default function App() {
  const { ready, user, signOut, saveError, pct, access, isAdmin } = useStore();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem("fde:nav") === "1"; } catch { return false; } });
  const [open, setOpen] = useState(false); // mobile drawer
  const toggle = () => {
    if (window.matchMedia("(max-width: 860px)").matches) { setOpen((o) => !o); return; }
    setCollapsed((c) => { try { localStorage.setItem("fde:nav", c ? "0" : "1"); } catch { /* ignore */ } return !c; });
  };
  useEffect(() => { window.scrollTo(0, 0); setOpen(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    const hit = NAV.find(([to]) => (to === "/" ? pathname === "/" : pathname.startsWith(to)));
    document.title = (hit ? hit[1] + " · " : pathname.startsWith("/admin") ? "Admin · " : "") + "FDE Learning Tracker";
  }, [pathname]);
  if (!ready) return <main className="center" aria-busy="true"><div className="skel"><i /><i /><i /></div></main>;
  if (!user) return <Landing />;
  if (access !== "approved") return <Gate />;
  const nav = isAdmin ? [...NAV, ["/admin", "Admin"] as [string, string]] : NAV;
  return (
    <div className={"shell" + (collapsed ? " collapsed" : "") + (open ? " open" : "")}>
      <aside className="side" id="sidenav">
        <div className="brand"><span className="mark" aria-hidden="true"><i /><i /><i /></span><span className="lbl">FDE Tracker</span></div>
        <nav aria-label="Main">{nav.map(([to, label]) => (<NavLink key={to} to={to} end={to === "/"} title={label}><NavIcon to={to} /><span className="lbl">{label}</span></NavLink>))}</nav>
        <div className="who"><ThemeSwitch /><div className="meter small"><i style={{ width: pct + "%" }} /></div><small>{user.email}</small><button className="linkbtn" onClick={signOut}>Sign out</button></div>
      </aside>
      <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" />
      <main className="main">
        <div className="topbar">
          <button type="button" className="burger" onClick={toggle} aria-controls="sidenav" aria-expanded={open || !collapsed} aria-label="Toggle navigation">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <BackButton />
        </div>
        {saveError && <p className="banner err" role="alert">Could not save to the database: {saveError}</p>}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plan" element={<PlanList />} />
          <Route path="/plan/:n" element={<DayPage />} />
          <Route path="/outline" element={<Outline />} />
          <Route path="/stack" element={<StackGuide />} />
          <Route path="/curated" element={<Curated />} />
          <Route path="/readiness" element={<Readiness />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
