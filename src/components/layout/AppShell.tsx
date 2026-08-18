import { CalendarCheck2, FolderGit2, Map, Menu, MonitorCog, Moon, Search, Settings, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useStudyState } from "../../hooks/useStudyState";
import { GlobalSearch } from "../search/GlobalSearch";

const primaryNavigation = [
  { label: "Today", path: "/", icon: CalendarCheck2, end: true },
  { label: "Roadmap", path: "/roadmap", icon: Map },
  { label: "Weekly", path: "/weekly", icon: CalendarCheck2 },
  { label: "Projects", path: "/projects", icon: FolderGit2 },
] as const;

function ThemeButton() {
  const { state, setTheme } = useStudyState();
  const nextTheme = state.theme === "system" ? "light" : state.theme === "light" ? "dark" : "system";
  const Icon = state.theme === "system" ? MonitorCog : state.theme === "light" ? Sun : Moon;
  const label = state.theme === "system" ? "跟随系统" : state.theme === "light" ? "浅色模式" : "深色模式";
  return <button className="icon-button theme-button" type="button" onClick={() => setTheme(nextTheme)} aria-label={`${label}，点击切换`} title={label}><Icon size={16} /></button>;
}

function NavigationLink({ item, mobile = false, onClick }: { item: (typeof primaryNavigation)[number]; mobile?: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  return <NavLink to={item.path} end={"end" in item ? item.end : undefined} onClick={onClick} className={({ isActive }) => `${mobile ? "mobile-nav-item" : "nav-item"}${isActive ? " active" : ""}`}><Icon size={mobile ? 19 : 17} strokeWidth={1.8} /><span>{item.label}</span></NavLink>;
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row"><NavLink className="brand" to="/" aria-label="Study Hub 首页"><span className="brand-mark">S</span><span className="brand-copy"><strong>Study Hub</strong><small>LEO / 2027</small></span></NavLink><ThemeButton /></div>
        <nav className="navigation" aria-label="主要导航">{primaryNavigation.map((item) => <NavigationLink item={item} key={item.path} />)}</nav>
        <button className="sidebar-search-trigger" type="button" aria-label="全局搜索" onClick={() => setSearchOpen(true)}><Search size={15} /><span>搜索日志与路线</span><kbd>⌘K</kbd></button>
        <nav className="sidebar-footer" aria-label="设置"><NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}><Settings size={17} /><span>Settings</span></NavLink></nav>
      </aside>
      <header className="mobile-header"><NavLink className="mobile-brand" to="/"><span className="brand-mark">S</span><strong>Study Hub</strong></NavLink><div className="mobile-header-actions"><button className="icon-button" type="button" onClick={() => setSearchOpen(true)} aria-label="全局搜索"><Search size={16} /></button><ThemeButton /><button className="icon-button" type="button" onClick={() => setDrawerOpen((open) => !open)} aria-expanded={drawerOpen} aria-controls="mobile-drawer" aria-label={drawerOpen ? "关闭导航" : "打开导航"}>{drawerOpen ? <X size={17} /> : <Menu size={17} />}</button></div></header>
      {drawerOpen ? <div className="mobile-drawer-backdrop"><button className="mobile-drawer-scrim" type="button" onClick={() => setDrawerOpen(false)} aria-label="关闭导航" /><nav id="mobile-drawer" className="mobile-drawer" aria-label="完整移动端导航"><div className="mobile-drawer-heading"><span>NAVIGATION</span><strong>Study Hub</strong></div>{primaryNavigation.map((item) => <NavigationLink item={item} onClick={() => setDrawerOpen(false)} key={item.path} />)}<div className="mobile-drawer-divider" /><NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} onClick={() => setDrawerOpen(false)}><Settings size={17} /><span>Settings</span></NavLink></nav></div> : null}
      <main className="main-content"><div className="content-wrap"><Outlet /></div></main>
      <nav className="mobile-navigation" aria-label="移动端导航">{primaryNavigation.map((item) => <NavigationLink item={item} mobile key={item.path} />)}</nav>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
