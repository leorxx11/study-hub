import { Check, Circle, Edit3, Link2, Trash2 } from "lucide-react";
import { projects } from "../../data/projects";
import { skills } from "../../data/skills";
import { stages } from "../../data/stages";
import { useStudyState } from "../../hooks/useStudyState";
import type { Task } from "../../types";

export function TaskList({ tasks, onEdit, emptyText = "今天还没有任务。" }: { tasks: Task[]; onEdit: (task: Task) => void; emptyText?: string }) {
  const { state, toggleTask, deleteTask, addTaskAsEvidence } = useStudyState();
  if (!tasks.length) return <div className="compact-empty">{emptyText}</div>;
  return (
    <div className="today-task-list">
      {tasks.map((task) => {
        const done = task.status === "done";
        const hasEvidence = state.evidence.some((item) => item.sourceType === "task" && item.sourceId === task.id);
        const relationLabels = [
          stages.find((stage) => stage.id === task.stageId)?.title,
          projects.find((project) => project.id === task.projectId)?.name,
          ...(task.skillIds ?? []).map((id) => skills.find((skill) => skill.id === id)?.name),
        ].filter(Boolean) as string[];
        return (
          <article className={`today-task${done ? " done" : ""}`} key={task.id}>
            <button className="task-toggle" type="button" onClick={() => toggleTask(task.id)} aria-label={done ? `取消完成 ${task.title}` : `完成 ${task.title}`}>{done ? <Check size={14} /> : <Circle size={14} />}</button>
            <div className="today-task-main"><strong>{task.title}</strong><div className="task-meta"><span>{task.type}</span>{task.priority ? <span>{task.priority}</span> : null}{relationLabels.slice(0, 4).map((label) => <span key={label}>{label}</span>)}</div></div>
            <div className="row-actions">
              {done && task.skillIds?.length && !hasEvidence ? <button type="button" onClick={() => addTaskAsEvidence(task.id)} title="Add as Evidence" aria-label={`将 ${task.title} 添加为能力证据`}><Link2 size={14} /></button> : null}
              <button type="button" onClick={() => onEdit(task)} aria-label={`编辑 ${task.title}`}><Edit3 size={14} /></button>
              <button type="button" onClick={() => { if (window.confirm(`删除任务「${task.title}」？`)) deleteTask(task.id); }} aria-label={`删除 ${task.title}`}><Trash2 size={14} /></button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
