import { useEffect, useState, type FormEvent } from "react";
import { useStudyState, type TaskDraft } from "../../hooks/useStudyState";
import type { Priority, Task, TaskStatus, TaskType } from "../../types";
import { getLocalDateKey, getWeekKey } from "../../utils/date";
import { RelationFields } from "../forms/RelationFields";
import { Modal } from "../ui/Modal";

const typeLabels: Record<TaskType, string> = { learning: "Learning", practice: "Practice", project: "Project", bug: "Bug", automation: "Automation", deployment: "Deployment" };
const statusLabels: Record<TaskStatus, string> = { todo: "To do", doing: "Doing", done: "Done" };

interface TaskModalProps {
  open: boolean;
  task?: Task;
  defaults?: Partial<TaskDraft>;
  onClose: () => void;
}

export function TaskModal({ open, task, defaults, onClose }: TaskModalProps) {
  const { state, createTask, updateTask } = useStudyState();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("learning");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [date, setDate] = useState(getLocalDateKey());
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [stageId, setStageId] = useState<string | undefined>();
  const [projectId, setProjectId] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? defaults?.title ?? "");
    setDescription(task?.description ?? defaults?.description ?? "");
    setType(task?.type ?? defaults?.type ?? "learning");
    setStatus(task?.status ?? defaults?.status ?? "todo");
    setPriority(task?.priority ?? defaults?.priority ?? "medium");
    setDate(task?.date ?? defaults?.date ?? getLocalDateKey());
    setSkillIds([...(task?.skillIds ?? defaults?.skillIds ?? [])]);
    setStageId(task?.stageId ?? defaults?.stageId ?? state.currentStageId);
    setProjectId(task?.projectId ?? defaults?.projectId);
  }, [defaults, open, state.currentStageId, task]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    const draft: TaskDraft = { title: title.trim(), description: description.trim() || undefined, type, status, priority, date: date || undefined, week: date ? getWeekKey(new Date(`${date}T12:00:00`)) : getWeekKey(), skillIds, stageId, projectId };
    if (task) updateTask(task.id, draft);
    else createTask(draft);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? "编辑任务" : "添加任务"} eyebrow="TODAY TASK" description="把行动关联到能力、阶段或项目，完成后会进入 Activity。" footer={<><button className="secondary-button" type="button" onClick={onClose}>取消</button><button className="primary-button" type="submit" form="task-form">{task ? "保存修改" : "创建任务"}</button></>}>
      <form id="task-form" className="record-form" onSubmit={submit}>
        <label className="full-field"><span>任务标题 *</span><input autoFocus type="text" value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="今天要推进什么？" required /></label>
        <div className="form-row-3">
          <label><span>类型</span><select value={type} onChange={(event) => setType(event.target.value as TaskType)}>{Object.entries(typeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label><span>状态</span><select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label><span>优先级</span><select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
        </div>
        <label className="full-field"><span>日期</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label className="full-field"><span>补充说明</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="可选：定义完成标准或上下文" /></label>
        <RelationFields skillIds={skillIds} stageId={stageId} projectId={projectId} onSkillIdsChange={setSkillIds} onStageIdChange={setStageId} onProjectIdChange={setProjectId} />
      </form>
    </Modal>
  );
}
