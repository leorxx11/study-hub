import { CalendarDays, FolderGit2, Map, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { projects } from "../../data/projects";
import { moduleById, pathById, roadmapTopics } from "../../data/roadmapV3";
import { useStudyState } from "../../hooks/useStudyState";
import { dailyLogSearchText } from "../../services/v3Selectors";
import { Modal } from "../ui/Modal";

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useStudyState();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => searchInput.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);
  const normalized = query.trim().toLocaleLowerCase();
  const results = useMemo(() => ({
    logs: normalized ? state.dailyLogs.filter((log) => dailyLogSearchText(log).includes(normalized)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8) : [],
    topics: normalized ? roadmapTopics.filter((topic) => `${topic.title} ${moduleById.get(topic.moduleId)?.title ?? ""} ${pathById.get(topic.pathId)?.title ?? ""}`.toLocaleLowerCase().includes(normalized)).slice(0, 10) : [],
    projects: normalized ? projects.filter((project) => `${project.name} ${project.description} ${project.technologies.join(" ")}`.toLocaleLowerCase().includes(normalized)) : [],
  }), [normalized, state.dailyLogs]);
  const go = (path: string) => { navigate(path); onClose(); setQuery(""); };
  const empty = normalized && !results.logs.length && !results.topics.length && !results.projects.length;
  return (
    <Modal open={open} onClose={onClose} title="搜索 Study Hub" eyebrow="GLOBAL SEARCH" description="搜索 Daily Logs、Roadmap Topics 和 Projects。" wide>
      <div className="global-search"><label><Search size={18} /><input ref={searchInput} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 SSE、pytest、Bug、项目……" /></label>{!normalized ? <div className="search-hint">输入关键词开始搜索。正文、Tag、关联 Topic 和 Project 都会参与匹配。</div> : null}{results.topics.length ? <section><h3><Map size={13} />Roadmap</h3>{results.topics.map((topic) => <button type="button" onClick={() => go(`/roadmap?topic=${topic.id}`)} key={topic.id}><div><strong>{topic.title}</strong><small>{pathById.get(topic.pathId)?.title} · {moduleById.get(topic.moduleId)?.title}</small></div></button>)}</section> : null}{results.logs.length ? <section><h3><CalendarDays size={13} />Daily Logs</h3>{results.logs.map((log) => <button type="button" onClick={() => go(`/?log=${log.id}`)} key={log.id}><time>{log.date}</time><div><strong>{log.work.replace(/\s+/g, " ").slice(0, 90)}</strong><small>{log.tags.map((tag) => `#${tag}`).join(" ")}</small></div></button>)}</section> : null}{results.projects.length ? <section><h3><FolderGit2 size={13} />Projects</h3>{results.projects.map((project) => <button type="button" onClick={() => go(`/projects?project=${project.id}`)} key={project.id}><div><strong>{project.name}</strong><small>{project.description}</small></div></button>)}</section> : null}{empty ? <div className="compact-empty">没有找到“{query}”。试试更短的关键词。</div> : null}</div>
    </Modal>
  );
}
