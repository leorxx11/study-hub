import { ArrowRight, Check, Circle, FileText, FolderGit2, Plus, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ActivityFeed } from "../components/activity/ActivityFeed";
import { NoteModal } from "../components/notes/NoteModal";
import { TaskModal } from "../components/task/TaskModal";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatusBadge } from "../components/ui/StatusBadge";
import { projects } from "../data/projects";
import { skills } from "../data/skills";
import { useStudyState, type NoteDraft, type TaskDraft } from "../hooks/useStudyState";
import { getProjectMilestones, getProjectProgress } from "../services/selectors";
import { formatDate } from "../utils/date";

export function Projects() {
  const { state, toggleProjectMilestone } = useStudyState();
  const [selectedId, setSelectedId] = useState(projects[0].id);
  const [noteDefaults, setNoteDefaults] = useState<Partial<NoteDraft>>();
  const [taskDefaults, setTaskDefaults] = useState<Partial<TaskDraft>>();
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0];
  const milestones = getProjectMilestones(state, selected.id);
  const projectProgress = getProjectProgress(state, selected.id);
  const relatedSkillIds = useMemo(() => [...new Set(milestones.flatMap((milestone) => milestone.skillIds ?? []))], [milestones]);
  const activities = state.activities.filter((activity) => activity.projectId === selected.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const notes = state.notes.filter((note) => note.projectId === selected.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const addNote = () => setNoteDefaults({ type: "project", projectId: selected.id, stageId: selected.stageId, skillIds: relatedSkillIds });
  const addTask = () => setTaskDefaults({ type: "project", status: "todo", priority: "medium", projectId: selected.id, stageId: selected.stageId, skillIds: relatedSkillIds.slice(0, 3) });

  return (
    <>
      <PageHeader eyebrow="ENGINEERING OUTPUT" title="项目成果" description="用可操作的 Milestone 推进长期工程产出；每次完成都会同步形成 Activity 与关联 Skill Evidence。" />
      <div className="projects-workspace">
        <div className="project-list project-selector-list">
          {projects.map((project, index) => {
            const projectMilestones = getProjectMilestones(state, project.id);
            const progress = getProjectProgress(state, project.id);
            return (
              <article className={`project-card project-selector${selected.id === project.id ? " active" : ""}`} key={project.id}>
                <button className="project-select-button" type="button" onClick={() => setSelectedId(project.id)} aria-pressed={selected.id === project.id}>
                  <header><div className="project-index"><FolderGit2 size={18} /><span>0{index + 1}</span></div><div className="project-heading"><span>{project.stage}</span><h2>{project.name}</h2></div><StatusBadge tone={progress === 100 ? "green" : project.status === "Planned" ? "blue" : "gray"}>{progress === 100 ? "Completed" : project.status}</StatusBadge></header>
                  <div className="project-selector-body"><p>{project.description}</p><div className="project-progress-row"><span>{projectMilestones.filter((item) => item.completed).length}/{projectMilestones.length} milestones</span><strong>{progress}%</strong></div><ProgressBar value={progress} label={`${project.name} 进度 ${progress}%`} /></div>
                  <footer><div className="tag-list">{project.technologies.slice(0, 5).map((technology) => <span key={technology}>{technology}</span>)}</div><span className="text-link">查看详情 <ArrowRight size={14} /></span></footer>
                </button>
              </article>
            );
          })}
        </div>

        <aside className="project-detail-panel">
          <header className="project-detail-header"><div><span className="detail-kicker">PROJECT DETAIL</span><h2>{selected.name}</h2><p>{selected.goal}</p></div><strong>{projectProgress}<small>%</small></strong></header>
          <ProgressBar value={projectProgress} label={`${selected.name} 进度`} tone={projectProgress === 100 ? "green" : "blue"} />
          <div className="project-detail-actions"><button className="primary-button" type="button" onClick={addNote}><Plus size={14} />Add Note</button><button className="secondary-button" type="button" onClick={addTask}><Plus size={14} />Add Task</button></div>

          <section className="project-detail-section"><div className="subsection-title"><span>MILESTONES</span><strong>{milestones.filter((item) => item.completed).length}/{milestones.length}</strong></div><div className="milestone-list">{milestones.map((milestone) => <button type="button" role="checkbox" aria-checked={milestone.completed} className={milestone.completed ? "completed" : ""} onClick={() => toggleProjectMilestone(milestone.id)} key={milestone.id}><span>{milestone.completed ? <Check size={13} /> : <Circle size={13} />}</span><strong>{milestone.title}</strong>{milestone.completedAt ? <small>{formatDate(milestone.completedAt)}</small> : null}</button>)}</div></section>

          <section className="project-detail-section"><div className="subsection-title"><span>RELATED SKILLS</span></div><div className="skill-pill-grid">{relatedSkillIds.map((id) => { const skill = skills.find((item) => item.id === id); const evidenceCount = state.evidence.filter((item) => item.skillId === id && item.sourceType === "project").length; return skill ? <Link to="/skills" key={id}><strong>{skill.name}</strong><small>{evidenceCount} evidence</small></Link> : null; })}</div></section>

          <section className="project-detail-section"><div className="subsection-title"><span>RECENT ACTIVITY</span></div><ActivityFeed activities={activities} emptyText="完成第一个 Milestone 后，这里会出现项目动态。" /></section>

          <section className="project-detail-section"><div className="subsection-title"><span>NOTES</span><Link className="text-link" to="/notes">All notes <ArrowRight size={12} /></Link></div>{notes.length ? <div className="related-note-list">{notes.slice(0, 5).map((note) => <div key={note.id}><FileText size={13} /><span><strong>{note.title}</strong><small>{formatDate(note.updatedAt)}</small></span></div>)}</div> : <div className="compact-empty">还没有项目记录。</div>}</section>

          <section className="project-detail-section"><div className="subsection-title"><span>TECHNICAL STACK</span></div><div className="tag-list stack-tags"><Wrench size={13} />{selected.technologies.map((item) => <span key={item}>{item}</span>)}</div></section>
        </aside>
      </div>

      <NoteModal open={Boolean(noteDefaults)} defaults={noteDefaults} onClose={() => setNoteDefaults(undefined)} />
      <TaskModal open={Boolean(taskDefaults)} defaults={taskDefaults} onClose={() => setTaskDefaults(undefined)} />
    </>
  );
}
