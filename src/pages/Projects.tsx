import { ArrowRight, CalendarDays, Check, Circle, FolderGit2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DailyLogEditor } from "../components/daily/DailyLogEditor";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { projects } from "../data/projects";
import { topicById } from "../data/roadmapV3";
import { useStudyState } from "../hooks/useStudyState";
import { getProjectMilestones, getProjectProgress } from "../services/selectors";
import type { DailyLog } from "../types";
import { formatDate, getLocalDateKey } from "../utils/date";

const projectTopics: Record<string, string[]> = {
  "api-automation-framework": ["pytest-项目结构", "python-requests", "requests-封装", "fixture", "parametrize", "yaml", "allure", "pytest-接入-ci", "api-automation-framework-v1"],
  autotesthub: ["spring-boot", "rest-api-backend", "mysql-backend", "playwright-是什么", "pytest-集成", "github-actions", "docker"],
};

export function Projects() {
  const { state, toggleProjectMilestone } = useStudyState();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("project");
  const [selectedId, setSelectedId] = useState(projects.some((project) => project.id === requested) ? requested! : projects[0].id);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog>();
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0];
  const milestones = getProjectMilestones(state, selected.id);
  const progress = getProjectProgress(state, selected.id);
  const todayLog = state.dailyLogs.find((log) => log.date === getLocalDateKey());
  const relatedTopics = (projectTopics[selected.id] ?? []).map((id) => topicById.get(id)).filter(Boolean);
  const projectLogs = useMemo(() => state.dailyLogs.filter((log) => log.projectIds?.includes(selected.id)).sort((a, b) => b.date.localeCompare(a.date)), [selected.id, state.dailyLogs]);
  const editorProjectIds = useMemo(() => [selected.id], [selected.id]);
  const editorTopicIds = useMemo(() => (projectTopics[selected.id] ?? []).slice(0, 2), [selected.id]);
  useEffect(() => { if (requested && projects.some((project) => project.id === requested)) setSelectedId(requested); }, [requested]);
  const select = (id: string) => { setSelectedId(id); setSearchParams({ project: id }, { replace: true }); };
  const lastMilestone = [...milestones].filter((item) => item.completedAt).sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))[0];
  const lastUpdated = [projectLogs[0]?.updatedAt, lastMilestone?.completedAt].filter(Boolean).sort().reverse()[0];
  return (
    <>
      <PageHeader eyebrow="PERSONAL PROJECTS" title="Projects" description="项目只保留目标、状态、Milestones、最近更新和关联 Roadmap。推进本身比管理项目更重要。" />
      <div className="simple-project-tabs">{projects.map((project) => { const value = getProjectProgress(state, project.id); return <button type="button" className={selected.id === project.id ? "active" : ""} onClick={() => select(project.id)} key={project.id}><FolderGit2 size={17} /><div><strong>{project.name}</strong><small>{getProjectMilestones(state, project.id).filter((item) => item.completed).length}/{getProjectMilestones(state, project.id).length} Milestones</small></div><span>{value}%</span></button>; })}</div>
      <section className="simple-project-hero"><div><span className="detail-kicker">PROJECT GOAL</span><h2>{selected.name}</h2><p>{selected.goal}</p><div className="tag-list">{selected.technologies.map((item) => <span key={item}>{item}</span>)}</div></div><div className="simple-project-status"><span>CURRENT STATUS</span><strong>{progress === 100 ? "Completed" : progress > 0 ? "In Progress" : selected.status}</strong><small>{lastUpdated ? `最近更新 ${formatDate(lastUpdated, { year: "numeric", month: "2-digit", day: "2-digit" })}` : "还没有更新"}</small><button className="primary-button" type="button" onClick={() => setUpdateOpen(true)}><Plus size={14} />记录项目更新</button></div></section>
      <div className="simple-project-grid"><section className="simple-milestones"><div className="v3-section-heading"><div><span>MILESTONES</span><h2>一步一步推进</h2></div><strong>{progress}%</strong></div><ProgressBar value={progress} label={`${selected.name} 进度`} tone={progress === 100 ? "green" : "blue"} /><div>{milestones.map((milestone) => <button type="button" role="checkbox" aria-checked={milestone.completed} className={milestone.completed ? "done" : ""} onClick={() => toggleProjectMilestone(milestone.id)} key={milestone.id}><span>{milestone.completed ? <Check size={13} /> : <Circle size={13} />}</span><strong>{milestone.title}</strong>{milestone.completedAt ? <small>{formatDate(milestone.completedAt)}</small> : null}</button>)}</div></section><aside className="project-side-stack"><section><div className="v3-section-heading"><div><span>RECENT UPDATES</span><h2>项目日志</h2></div><CalendarDays size={15} /></div>{projectLogs.length ? <div className="project-update-list">{projectLogs.slice(0, 6).map((log) => <button type="button" onClick={() => setEditingLog(log)} key={log.id}><time>{log.date}</time><span>{log.work.replace(/\s+/g, " ").slice(0, 100)}</span></button>)}</div> : <div className="compact-empty">记录一次项目推进后会出现在这里。</div>}</section><section><div className="v3-section-heading"><div><span>RELATED ROADMAP</span><h2>需要的学习内容</h2></div></div><div className="project-topic-links">{relatedTopics.map((topic) => topic ? <Link to={`/roadmap?topic=${topic.id}`} key={topic.id}><strong>{topic.title}</strong><ArrowRight size={13} /></Link> : null)}</div></section></aside></div>
      <Modal open={updateOpen} onClose={() => setUpdateOpen(false)} title={`记录 ${selected.name} 更新`} eyebrow="PROJECT DAILY LOG" description="项目更新仍然保存为今天的 Daily Log，不创建额外管理流程。" wide><DailyLogEditor log={todayLog} defaultProjectIds={editorProjectIds} defaultTopicIds={editorTopicIds} onSaved={() => setUpdateOpen(false)} /></Modal>
      <Modal open={Boolean(editingLog)} onClose={() => setEditingLog(undefined)} title={editingLog ? `编辑 ${editingLog.date} 的项目日志` : "编辑项目日志"} eyebrow="PROJECT DAILY LOG" wide>{editingLog ? <DailyLogEditor log={editingLog} onSaved={() => setEditingLog(undefined)} onDeleted={() => setEditingLog(undefined)} /> : null}</Modal>
    </>
  );
}
