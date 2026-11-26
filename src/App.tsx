import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStore } from "./lib/store";
import { API_URL } from "./lib/api";
import { useMe } from "./lib/useRole";
import { setView, useView } from "./lib/viewAs";
import { clearUnsaved, hasUnsaved } from "./lib/unsaved";
import { closeLayer, openLayer } from "./lib/layers";
import { useDevPersona } from "./lib/devPersona";
import { WorkProvider, useWork } from "./lib/work";
import { PROGRAMME } from "./data/programme";
import Gate from "./pages/Gate";
import { Icon, type IconName } from "./components/Icon";
import { Logo } from "./components/Logo";
import { PageSkeleton } from "./components/States";
import { useConfirm } from "./components/Confirm";
import { NotificationBell } from "./components/NotificationBell";
import { GlobalSearch } from "./components/GlobalSearch";
import { AccountMenu } from "./components/shell/AccountMenu";

// Every page is its own chunk, so the first load only carries the shell.
const Landing = lazy(() => import("./pages/Landing"));
const Home = lazy(() => import("./pages/Home"));
const Programme = lazy(() => import("./pages/Programme"));
const ProgressPage = lazy(() => import("./pages/Progress"));
const Feed = lazy(() => import("./pages/Feed"));
const LabHub = lazy(() => import("./pages/LabHub"));
const Resources = lazy(() => import("./pages/Resources"));
const Review = lazy(() => import("./pages/Review"));
const Admin = lazy(() => import("./pages/Admin"));
const DailyLog = lazy(() => import("./pages/DailyLog"));
const MyWork = lazy(() => import("./pages/MyWork"));
const Devops = lazy(() => import("./pages/Devops"));
const Community = lazy(() => import("./pages/Community"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Journal = lazy(() => import("./pages/Journal"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RAIL = "fde:sidebar"; // "rail" or "full"; unset means "decide by screen width"
const FIRST_WEEK = PROGRAMME[0]?.n ?? 1;

function useMedia(q: string) {
  const [on, setOn] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const ch = () => setOn(m.matches);
    m.addEventListener("change", ch);
    return () => m.removeEventListener("change", ch);
  }, [q]);
  return on;
}

function Centered({ children }: { children: ReactNode }) {
  return <main className="center-page" id="main"><div className="center-card card">{children}</div></main>;
}

function crumbs(path: string): string[] {
  if (path === "/") return ["Home"];
  if (path.startsWith("/week")) return ["Programme", `Week ${path.split("/")[2] ?? FIRST_WEEK}`];
  if (path.startsWith("/my-work")) return ["Programme", "My work"];
  if (path.startsWith("/devops")) return ["Programme", "DevOps", `Week ${path.split("/")[3] ?? 1}`];
  if (path.startsWith("/progress")) return ["Progress"];
  if (path.startsWith("/feed")) return ["Feed"];
  if (path.startsWith("/lab")) return ["Practice lab"];
  if (path.startsWith("/resources")) return ["Resources"];
  if (path.startsWith("/community")) return ["Community"];
  if (path.startsWith("/quiz")) return ["Quizzes"];
  if (path.startsWith("/daily-log")) return ["Daily log"];
  if (path.startsWith("/journal")) return ["Journal"];
  if (path.startsWith("/calendar")) return ["Calendar"];
  if (path.startsWith("/notifications")) return ["Notifications"];
  if (path.startsWith("/review")) return ["Review"];
  if (path.startsWith("/admin")) return ["Admin"];
  return ["Page not found"];
}

/** A side-panel link: icon, label (a tooltip when the panel is a rail) and an optional count. */
function Item({ to, icon, label, end, count, countLabel, replace, active }: { to: string; icon: IconName; label: string; end?: boolean; count?: number; countLabel?: string; replace?: boolean; active?: boolean }) {
  return (
    <NavLink to={to} end={end} replace={replace} className={({ isActive }) => "nav-item" + (isActive || active ? " active" : "")} aria-current={active ? "page" : undefined}>
      <Icon name={icon} strokeWidth={1.9} />
      <span className="nav-label">{label}</span>
      {!!count && <span className="nav-count">{count > 9 ? "9+" : count}<span className="sr"> {countLabel}</span></span>}
    </NavLink>
  );
}

/** Reviewers and the admin: switch between what a learner sees and what a reviewer sees. */
function ViewSwitch() {
  const { view, canSwitch } = useView();
  if (!canSwitch) return null;
  return (
    <div className="viewsw" role="group" aria-label="View as">
      <span>View as</span>
      <div className="themesw">
        <button type="button" aria-pressed={view === "learner"} onClick={() => setView("learner")}>Learner</button>
        <button type="button" aria-pressed={view === "reviewer"} onClick={() => setView("reviewer")}>Reviewer</button>
      </div>
    </div>
  );
}

function Shell() {
  const { user, signOut, saveError, isAdmin } = useStore();
  const persona = useDevPersona();
  const { me, ready: meReady } = useMe();
  const { reviewerView, canSwitch } = useView();
  const w = useWork();
  const loc = useLocation();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const phone = useMedia("(max-width: 767px)");
  const wide = useMedia("(min-width: 1200px)");
  const [open, setOpen] = useState(false);
  const [railPref, setRailPref] = useState<string | null>(() => { try { return localStorage.getItem(RAIL); } catch { return null; } });
  const rail = !phone && (railPref ? railPref === "rail" : !wide);
  const mainRef = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const side = useRef<HTMLElement>(null);
  const drawerLayer = useRef<number | null>(null);
  const lastPath = useRef(loc.pathname);
  const adminHere = isAdmin || me?.role === "admin";

  const toggleRail = () => {
    const next = rail ? "full" : "rail";
    setRailPref(next);
    try { localStorage.setItem(RAIL, next); } catch { /* ignore */ }
  };

  // The phone drawer. Opening it adds a history entry, so Android Back closes it.
  const openDrawer = (e: { currentTarget: HTMLElement }) => {
    opener.current = e.currentTarget;
    setOpen(true);
    drawerLayer.current = openLayer(() => { drawerLayer.current = null; setOpen(false); opener.current?.focus(); });
  };
  const closeDrawer = (focus = true) => {
    setOpen(false);
    const l = drawerLayer.current; drawerLayer.current = null;
    void closeLayer(l);
    if (focus) opener.current?.focus();
  };

  // A new page: close the drawer, go to the top and move focus to the page so screen readers announce it.
  useEffect(() => {
    if (drawerLayer.current) closeDrawer(false);
    if (lastPath.current === loc.pathname) return;
    lastPath.current = loc.pathname;
    if (!loc.hash) window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [loc.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // A link such as /#catch-up or /week/1#wd3 scrolls to that part once the page is drawn (and once more after it has laid out).
  useEffect(() => {
    if (!loc.hash) return;
    const go = () => document.getElementById(decodeURIComponent(loc.hash.slice(1)))?.scrollIntoView({ block: "start" });
    const t1 = window.setTimeout(go, 60), t2 = window.setTimeout(go, 350);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [loc.pathname, loc.hash]);

  useEffect(() => { if (!phone && drawerLayer.current) closeDrawer(false); }, [phone]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (side.current) side.current.inert = phone && !open; }, [phone, open]);
  // The drawer on phones: focus goes in, Esc closes, the page behind is inert and does not scroll.
  useEffect(() => {
    const col = mainRef.current?.parentElement;
    if (col) col.inert = phone && open;
    document.documentElement.classList.toggle("scroll-lock", phone && open);
    if (!phone || !open) return;
    side.current?.querySelector<HTMLElement>("nav a")?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, phone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unsaved changes: ask before following a link inside the app.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!hasUnsaved() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target || a.origin !== window.location.origin || a.pathname === window.location.pathname) return;
      e.preventDefault(); e.stopPropagation();
      const to = a.pathname + a.search + a.hash;
      void confirm({ title: "Leave without saving?", body: "You have changes on this page that are not saved yet. If you leave now, they are lost.", confirm: "Leave page", cancel: "Stay on this page", danger: true })
        .then((ok) => { if (ok) { clearUnsaved(); navigate(to); } });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [confirm, navigate]);

  const trail = crumbs(loc.pathname);
  const name = (user?.email ?? "").split("@")[0]!.split(/[._-]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") || "You";
  const roleLabel = !API_URL ? "Learner" : me ? (me.role === "admin" ? "Admin" : me.role === "reviewer" ? "Reviewer" : "Learner") : meReady ? "Not confirmed" : "Checking";
  const inDrawer = phone && open; // links in the open drawer replace its history entry instead of stacking on it
  const onWeek = loc.pathname.startsWith("/week") || loc.pathname.startsWith("/devops") || loc.pathname.startsWith("/my-work");
  const moreActive = open || /^\/(lab|resources|review|admin|calendar|journal|notifications|daily-log|quiz|community)/.test(loc.pathname);
  const missed = w.learner ? w.missed.length : 0;

  return (
    <div className={"app" + (open ? " drawer-open" : "") + (rail ? " rail" : "")}>
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>Skip to content</a>
      <aside ref={side} className="sidebar" aria-label="Sidebar">
        <div className="side-top">
          <Link to="/" className="brand" replace={inDrawer} data-tip="FDE Training" aria-label="FDE Training, home"><Logo /><span className="brand-name">FDE Training</span></Link>
          {phone && <button type="button" className="iconbtn" aria-label="Close the menu" onClick={() => closeDrawer()}><Icon name="x" /></button>}
        </div>
        <nav aria-label="Main" className="nav">
          <div className="nav-group">
            <Item to="/" end icon="home" label="Home" count={missed} countLabel="missed days" replace={inDrawer} />
            <Item to={`/week/${FIRST_WEEK}`} icon="book" label="Programme" active={onWeek} replace={inDrawer} />
            <Item to="/progress" icon="chart" label="Progress" replace={inDrawer} />
            <Item to="/feed" icon="rss" label="Feed" count={w.newInFeed.length} countLabel="new in the feed" replace={inDrawer} />
          </div>
          <div className="nav-group" role="group" aria-labelledby="nav-more">
            <p className="nav-section" id="nav-more"><span className="sr">More: </span>Tools</p>
            <Item to="/calendar" icon="calendar" label="Calendar" replace={inDrawer} />
            <Item to="/daily-log" icon="tasks" label="Daily log" replace={inDrawer} />
            <Item to="/journal" icon="edit" label="Journal" replace={inDrawer} />
            <Item to="/community" icon="users" label="Community" replace={inDrawer} />
            <Item to="/quiz" icon="grad" label="Quizzes" replace={inDrawer} />
            <Item to="/lab" icon="lab" label="Practice lab" replace={inDrawer} />
            <Item to="/resources" icon="library" label="Resources" replace={inDrawer} />
            {reviewerView && <Item to="/review" icon="inbox" label="Review" count={w.counts?.submitted ?? 0} countLabel="waiting for review" replace={inDrawer} />}
            {adminHere && <Item to="/admin" icon="shield" label="Admin" replace={inDrawer} />}
          </div>
        </nav>
        <div className="side-foot">
          <AccountMenu name={name} email={user?.email ?? ""} role={roleLabel} batch={w.batch?.name} onSignOut={() => void signOut()}>
            {phone && canSwitch ? <ViewSwitch /> : null}
          </AccountMenu>
        </div>
      </aside>
      {phone && open && <div className="scrim" onClick={() => closeDrawer()} aria-hidden="true" />}
      <div className="main-col">
        <header className="topbar">
          {phone
            ? <button type="button" className="iconbtn" aria-label="Open the menu" aria-expanded={open} onClick={openDrawer}><Icon name="menu" /></button>
            : <button type="button" className="iconbtn" aria-label={rail ? "Expand the side panel" : "Collapse the side panel"} title={rail ? "Expand the side panel" : "Collapse the side panel"} onClick={toggleRail}><Icon name={rail ? "panelOpen" : "panelClose"} /></button>}
          <span className="topbar-sep" aria-hidden="true" />
          <nav aria-label="Breadcrumb" className="crumbs">
            <ol>{trail.map((c, i) => <li key={i} aria-current={i === trail.length - 1 ? "page" : undefined}>{c}</li>)}</ol>
          </nav>
          <div className="topright">{!phone && <ViewSwitch />}<GlobalSearch /><NotificationBell /></div>
        </header>
        <main ref={mainRef} id="main" className="main" tabIndex={-1}>
          <div className="content">
            {saveError && <p className="banner err" role="alert">Could not save to the database: {saveError}</p>}
            {API_URL && meReady && !me && <p className="banner" role="status">The server has not confirmed your account, so reviewer and admin features are hidden. Sign out and in again; if it stays, tell the admin.</p>}
            <Suspense fallback={<PageSkeleton />}>
              <div className="page" key={loc.pathname}>
                <Routes key={persona}>
                  <Route path="/" element={<Home />} />
                  <Route path="/week" element={<Navigate to={`/week/${FIRST_WEEK}`} replace />} />
                  <Route path="/week/:n" element={<Programme />} />
                  <Route path="/my-work" element={<MyWork />} />
                  <Route path="/devops" element={<Navigate to="/devops/week/1" replace />} />
                  <Route path="/devops/week/:n" element={<Devops />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/progress/:id" element={<ProgressPage />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/daily-log" element={<DailyLog />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/lab" element={<LabHub />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/review" element={<Review />} />
                  <Route path="/admin" element={<Admin />} />
                  {/* Old addresses keep working: bookmarks and links in the sheet open the merged page. */}
                  <Route path="/myplan" element={<Navigate to="/#steps" replace />} />
                  <Route path="/backlog" element={<Navigate to="/#catch-up" replace />} />
                  <Route path="/outline" element={<Navigate to={`/week/${FIRST_WEEK}#overview`} replace />} />
                  <Route path="/notes" element={<Navigate to="/resources?tab=notes" replace />} />
                  <Route path="/notes/:day" element={<NotesRedirect />} />
                  <Route path="/report" element={<Navigate to="/progress?tab=week1" replace />} />
                  <Route path="/stack" element={<Navigate to="/resources?tab=stack" replace />} />
                  <Route path="/readiness" element={<Navigate to="/resources?tab=readiness" replace />} />
                  <Route path="/docs" element={<Navigate to="/resources?tab=downloads" replace />} />
                  <Route path="/assistant" element={<Navigate to="/lab?tab=recruit" replace />} />
                  <Route path="/task-assistant" element={<Navigate to="/lab?tab=tasks" replace />} />
                  <Route path="/plan/*" element={<Navigate to="/" replace />} />
                  <Route path="/curated" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Suspense>
          </div>
        </main>
        {phone && (
          <nav className="tabbar" aria-label="Shortcuts">
            <NavLink to="/" end className="tab"><span className="tab-icon"><Icon name="home" />{!!missed && <span className="tab-dot" />}</span><span>Home{!!missed && <span className="sr">, {missed} missed days</span>}</span></NavLink>
            <NavLink to={`/week/${FIRST_WEEK}`} className={"tab" + (onWeek ? " active" : "")}><span className="tab-icon"><Icon name="book" /></span><span>Programme</span></NavLink>
            <NavLink to="/progress" className="tab"><span className="tab-icon"><Icon name="chart" /></span><span>Progress</span></NavLink>
            <NavLink to="/feed" className="tab"><span className="tab-icon"><Icon name="rss" />{w.newInFeed.length > 0 && <span className="tab-dot" />}</span><span>Feed{w.newInFeed.length > 0 && <span className="sr">, {w.newInFeed.length} new</span>}</span></NavLink>
            <button type="button" className={"tab" + (moreActive ? " active" : "")} aria-expanded={open} onClick={openDrawer}>
              <span className="tab-icon"><Icon name="menu" /></span><span>More<span className="sr"> pages and your account</span></span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

/** /notes/:day?w=1 (old study-notes link) opens that day, where the notes now sit inside the day card. */
function NotesRedirect() {
  const { day } = useParams();
  const [params] = useSearchParams();
  const wk = Number(params.get("w")) || FIRST_WEEK;
  return <Navigate to={`/week/${wk}#wd${Number(day) || 1}`} replace />;
}

export default function App() {
  const { ready, user, signOut, access } = useStore();
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const on = () => setExpired(true);
    window.addEventListener("fde:session-expired", on);
    return () => window.removeEventListener("fde:session-expired", on);
  }, []);
  useEffect(() => { setExpired(false); }, [user?.email]);
  const loading = (t: string) => <Centered><p className="muted" role="status">{t}</p></Centered>;
  if (!ready) return loading("Loading");
  if (!user) return <Suspense fallback={loading("Loading")}><Landing /></Suspense>;
  if (expired) {
    return (
      <Centered>
        <span className="center-icon warn" aria-hidden="true"><Icon name="clock" size={22} /></span>
        <h1>Your session has expired</h1>
        <p className="muted">You were signed out after a while, to keep your account safe. Sign in again to carry on; everything you saved is kept.</p>
        <div className="row center"><button type="button" className="btn" onClick={() => { setExpired(false); void signOut(); }}>Sign in again</button></div>
      </Centered>
    );
  }
  if (access !== "approved") return <Gate />;
  return <WorkProvider><Shell /></WorkProvider>;
}
