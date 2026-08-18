import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CircleGauge,
  FolderGit2,
  Map,
  Menu,
  MonitorCog,
  Moon,
  Settings,
  Sun,
  Target,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { stages } from "../../data/stages";
import { useStudyState } from "../../hooks/useStudyState";

const primaryNavigation = [
  { label: "Overview", path: "/", icon: CircleGauge, end: true },
  { label: "Roadmap", path: "/roadmap", icon: Map },
  { label: "Skills", path: "/skills", icon: Target },
  { label: "Practice", path: "/practice", icon: BriefcaseBusiness },
  { label: "Projects", path: "/projects", icon: FolderGit2 },
  { label: "Notes", path: "/notes", icon: BookOpen },
] as const;

const utilityNavigation = [
  { label: "Progress", path: "/progress", icon: BarChart3 },
  { label: "Settings", path: "/settings", icon: Settings },
] as const;

function ThemeButton() {
  const { state, setTheme } = useStudyState();
  const nextTheme = state.theme === "system" ? "light" : state.theme === "light" ? "dark" : "system";
  const Icon = state.theme === "system" ? MonitorCog : state.theme === "light" ? Sun : Moon;
  const label = state.theme === "system" ? "跟随系统" : state.theme === "light" ? "浅色模式" : "深色模式";
  return (
    <button className="icon-button theme-button" type="button" onClick={() => setTheme(nextTheme)} aria-label={`${label}，点击切换`} title={label}>
      <Icon size={16} />
    </button>
  );
}

function NavigationLink({ item, mobile = false, onClick }: { item: (typeof primaryNavigation)[number]; mobile?: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={"end" in item ? item.end : undefined}
      onClick={onClick}
      className={({ isActive }) => `${mobile ? "mobile-nav-item" : "nav-item"}${isActive ? " active" : ""}`}
    >
      <Icon size={mobile ? 19 : 17} strokeWidth={1.8} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export function AppShell() {
  const { state, progress } = useStudyState();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const currentStage = stages.find((stage) => stage.id === state.currentStageId) ?? stages[0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <NavLink className="brand" to="/" aria-label="Study Hub 首页">
            <span className="brand-mark">S</span>
            <span className="brand-copy">
              <strong>Study Hub</strong>
              <small>LEO / 2027</small>
            </span>
          </NavLink>
          <ThemeButton />
        </div>

        <nav className="navigation" aria-label="主要导航">
          {primaryNavigation.map((item) => <NavigationLink item={item} key={item.path} />)}
        </nav>

        <div className="sidebar-progress">
          <div className="sidebar-progress-head"><span>OVERALL</span><strong>{progress.overall}%</strong></div>
          <div className="sidebar-progress-track"><i style={{ width: `${progress.overall}%` }} /></div>
          <p>Stage {currentStage.order} · {currentStage.title}</p>
        </div>

        <nav className="sidebar-footer" aria-label="辅助导航">
          {utilityNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink to={item.path} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} key={item.path}>
                <Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <header className="mobile-header">
        <NavLink className="mobile-brand" to="/"><span className="brand-mark">S</span><strong>Study Hub</strong></NavLink>
        <div className="mobile-header-actions">
          <ThemeButton />
          <button className="icon-button" type="button" onClick={() => setDrawerOpen((open) => !open)} aria-expanded={drawerOpen} aria-controls="mobile-drawer" aria-label={drawerOpen ? "关闭导航" : "打开导航"}>
            {drawerOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </header>

      {drawerOpen ? (
        <div className="mobile-drawer-backdrop">
          <button className="mobile-drawer-scrim" type="button" onClick={() => setDrawerOpen(false)} aria-label="关闭导航" />
          <nav id="mobile-drawer" className="mobile-drawer" aria-label="完整移动端导航">
            <div className="mobile-drawer-heading"><span>NAVIGATION</span><strong>Study Hub</strong></div>
            {primaryNavigation.map((item) => <NavigationLink item={item} onClick={() => setDrawerOpen(false)} key={item.path} />)}
            <div className="mobile-drawer-divider" />
            {utilityNavigation.map((item) => {
              const Icon = item.icon;
              return <NavLink to={item.path} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} onClick={() => setDrawerOpen(false)} key={item.path}><Icon size={17} /><span>{item.label}</span></NavLink>;
            })}
          </nav>
        </div>
      ) : null}

      <main className="main-content"><div className="content-wrap"><Outlet /></div></main>

      <nav className="mobile-navigation" aria-label="移动端导航">
        {primaryNavigation.slice(0, 5).map((item) => <NavigationLink item={item} mobile key={item.path} />)}
      </nav>
    </div>
  );
}
