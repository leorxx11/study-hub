import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { projects } from "../data/projects";
import { practiceGroups } from "../data/practice";
import { topicById } from "../data/roadmapV3";
import { stages } from "../data/stages";
import { getProgressSummary, getWeeklyMetrics, type ProgressSummary, type WeeklyMetrics } from "../services/selectors";
import { createDefaultStudyState, studyRepository } from "../services/storage";
import type {
  Activity,
  DailyLog,
  Note,
  PracticeRecord,
  ProjectMilestone,
  SkillEvidence,
  StudyState,
  Task,
  ThemeMode,
  TopicStatus,
  UserSettings,
  WeeklyReview,
  WeeklyReviewV3,
} from "../types";
import { createId } from "../utils/id";

export type TaskDraft = Omit<Task, "id" | "createdAt" | "completedAt">;
export type NoteDraft = Omit<Note, "id" | "createdAt" | "updatedAt">;
export type PracticeDraft = Omit<PracticeRecord, "id" | "createdAt" | "completedAt">;
export type WeeklyReviewDraft = Omit<WeeklyReview, "id" | "createdAt" | "updatedAt">;
export type DailyLogDraft = Omit<DailyLog, "id" | "createdAt" | "updatedAt">;
export type WeeklyReviewV3Draft = Omit<WeeklyReviewV3, "id" | "createdAt" | "updatedAt">;

interface StudyContextValue {
  state: StudyState;
  progress: ProgressSummary;
  weeklyMetrics: WeeklyMetrics;
  toggleChecklist: (id: string) => void;
  toggleStage: (id: string) => void;
  updateSkillLevel: (id: string, level: number) => void;
  setCurrentStage: (id: string) => void;
  setTheme: (theme: ThemeMode) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  saveDailyLog: (draft: DailyLogDraft, id?: string) => string;
  deleteDailyLog: (id: string) => void;
  setTopicStatus: (topicId: string, status: TopicStatus) => void;
  toggleCurrentTopic: (topicId: string) => void;
  saveWeeklyReviewV3: (draft: WeeklyReviewV3Draft) => string;
  createTask: (draft: TaskDraft) => string;
  updateTask: (id: string, changes: Partial<TaskDraft>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addTaskAsEvidence: (id: string) => void;
  createNote: (draft: NoteDraft) => string;
  updateNote: (id: string, changes: NoteDraft) => void;
  deleteNote: (id: string) => void;
  startPractice: (draft: PracticeDraft) => string;
  togglePracticeItem: (recordId: string, itemId: string) => void;
  updatePracticeNotes: (recordId: string, notes: string) => void;
  togglePracticeComplete: (recordId: string) => void;
  deletePractice: (recordId: string) => void;
  toggleProjectMilestone: (id: string) => void;
  saveWeeklyReview: (draft: WeeklyReviewDraft) => string;
  createManualEvidence: (evidence: Omit<SkillEvidence, "id" | "createdAt" | "sourceType">) => void;
  reset: () => void;
  exportBackup: () => void;
  importBackup: (file: File) => Promise<void>;
}

const StudyContext = createContext<StudyContextValue | null>(null);

function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function createActivity(input: Omit<Activity, "id" | "createdAt">, createdAt = new Date().toISOString()): Activity {
  return { id: createId("activity"), createdAt, ...input };
}

function createEvidence(
  skillIds: string[] | undefined,
  input: Omit<SkillEvidence, "id" | "skillId" | "createdAt">,
  existing: SkillEvidence[],
  createdAt = new Date().toISOString(),
): SkillEvidence[] {
  return (skillIds ?? []).filter((skillId) => !existing.some((item) => item.skillId === skillId && item.sourceType === input.sourceType && item.sourceId === input.sourceId))
    .map((skillId) => ({ id: createId("evidence"), skillId, createdAt, ...input }));
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(() => studyRepository.load());

  useEffect(() => studyRepository.save(state), [state]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolved = resolveTheme(state.theme);
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [state.theme]);

  const progress = useMemo(() => getProgressSummary(state), [state]);
  const weeklyMetrics = useMemo(() => getWeeklyMetrics(state), [state]);

  const value = useMemo<StudyContextValue>(() => ({
    state,
    progress,
    weeklyMetrics,
    toggleChecklist: (id) => setState((current) => {
      const checklist = { ...current.checklist, [id]: !current.checklist[id] };
      const initiative = practiceGroups.find((group) => group.id === "initiative");
      if (!initiative?.items.some((item) => item.id === id)) return { ...current, checklist };
      const recordId = "practice-initiative-long-term";
      const existing = current.practiceRecords.find((record) => record.id === recordId);
      const allComplete = initiative.items.every((item) => Boolean(checklist[item.id]));
      const now = new Date().toISOString();
      const record: PracticeRecord = {
        id: recordId,
        type: "general",
        title: "Initiative Practice · Long-term",
        checklist: initiative.items.map((item) => ({ ...item, completed: Boolean(checklist[item.id]) })),
        notes: existing?.notes,
        skillIds: ["python", "linux", "mysql", "cicd"],
        stageId: existing?.stageId ?? current.currentStageId,
        createdAt: existing?.createdAt ?? now,
        completedAt: allComplete ? existing?.completedAt ?? now : undefined,
      };
      let practiceRecords = existing ? current.practiceRecords.map((item) => item.id === recordId ? record : item) : allComplete ? [record, ...current.practiceRecords] : current.practiceRecords;
      let activities = current.activities;
      let evidence = current.evidence;
      if (allComplete && !existing?.completedAt) {
        const additions = createEvidence(record.skillIds, { title: record.title, description: "完成长期主动实践清单", sourceType: "practice", sourceId: recordId }, evidence, now);
        evidence = [...additions, ...evidence];
        activities = [createActivity({ type: "practice_completed", title: "完成实践：Initiative Practice", relatedId: recordId, skillIds: record.skillIds, stageId: record.stageId }, now), ...activities];
      } else if (!allComplete && existing?.completedAt) {
        activities = activities.filter((activity) => !(activity.type === "practice_completed" && activity.relatedId === recordId));
        evidence = evidence.filter((item) => !(item.sourceType === "practice" && item.sourceId === recordId));
      }
      if (!existing && !allComplete) practiceRecords = current.practiceRecords;
      return { ...current, checklist, practiceRecords, activities, evidence };
    }),
    toggleStage: (id) => setState((current) => {
      const complete = current.completedStages.includes(id);
      const completedStages = complete ? current.completedStages.filter((stageId) => stageId !== id) : [...current.completedStages, id];
      if (complete) return { ...current, completedStages };
      const currentIndex = stages.findIndex((stage) => stage.id === id);
      const nextStage = stages[currentIndex + 1];
      return { ...current, completedStages, currentStageId: current.currentStageId === id && nextStage ? nextStage.id : current.currentStageId };
    }),
    updateSkillLevel: (id, level) => setState((current) => ({ ...current, skillLevels: { ...current.skillLevels, [id]: Math.max(0, Math.min(10, level)) } })),
    setCurrentStage: (currentStageId) => setState((current) => ({ ...current, currentStageId })),
    setTheme: (theme) => setState((current) => ({ ...current, theme })),
    updateSettings: (settings) => setState((current) => ({ ...current, settings: { ...current.settings, ...settings } })),

    saveDailyLog: (draft, existingId) => {
      const id = existingId ?? createId("daily");
      const now = new Date().toISOString();
      setState((current) => {
        const existing = current.dailyLogs.find((log) => log.id === id);
        const log: DailyLog = { id, createdAt: existing?.createdAt ?? now, updatedAt: now, ...draft };
        const dailyLogs = existing ? current.dailyLogs.map((item) => item.id === id ? log : item) : [log, ...current.dailyLogs];
        const activities = existing
          ? current.activities.map((activity) => activity.type === "daily_log_created" && activity.relatedId === id ? { ...activity, title: `记录 ${log.date} Daily Log` } : activity)
          : [createActivity({ type: "daily_log_created", title: `记录 ${log.date} Daily Log`, relatedId: id }, now), ...current.activities];
        return { ...current, dailyLogs, activities };
      });
      return id;
    },
    deleteDailyLog: (id) => setState((current) => ({
      ...current,
      dailyLogs: current.dailyLogs.filter((log) => log.id !== id),
      activities: current.activities.filter((activity) => !(activity.type === "daily_log_created" && activity.relatedId === id)),
    })),
    setTopicStatus: (topicId, status) => setState((current) => {
      const existing = current.topicProgress.find((item) => item.topicId === topicId);
      const wasDone = existing?.status === "done";
      const now = new Date().toISOString();
      const topicProgress = status === "not_started"
        ? current.topicProgress.filter((item) => item.topicId !== topicId)
        : existing
          ? current.topicProgress.map((item) => item.topicId === topicId ? { ...item, status, updatedAt: now } : item)
          : [{ topicId, status, updatedAt: now }, ...current.topicProgress];
      const activities = status === "done" && !wasDone
        ? [createActivity({ type: "topic_completed", title: `完成 Topic：${topicById.get(topicId)?.title ?? topicId}`, relatedId: topicId }, now), ...current.activities]
        : status !== "done" && wasDone
          ? current.activities.filter((activity) => !(activity.type === "topic_completed" && activity.relatedId === topicId))
          : current.activities;
      return { ...current, topicProgress, activities };
    }),
    toggleCurrentTopic: (topicId) => setState((current) => {
      const ids = current.settings.currentFocusTopicIds;
      if (ids.includes(topicId) && ids.length === 1) return current;
      const currentFocusTopicIds = ids.includes(topicId) ? ids.filter((id) => id !== topicId) : [...ids.slice(-2), topicId];
      return { ...current, settings: { ...current.settings, currentFocusTopicIds } };
    }),
    saveWeeklyReviewV3: (draft) => {
      const existing = state.weeklyReviewsV3.find((review) => review.week === draft.week);
      const now = new Date().toISOString();
      const id = existing?.id ?? createId("weekly-v3");
      const review: WeeklyReviewV3 = { id, ...draft, createdAt: existing?.createdAt ?? now, updatedAt: now };
      setState((current) => ({ ...current, weeklyReviewsV3: existing ? current.weeklyReviewsV3.map((item) => item.id === existing.id ? review : item) : [review, ...current.weeklyReviewsV3] }));
      return id;
    },

    createTask: (draft) => {
      const id = createId("task");
      const createdAt = new Date().toISOString();
      const task: Task = { id, createdAt, ...draft, completedAt: draft.status === "done" ? createdAt : undefined };
      setState((current) => {
        const activity = task.status === "done" ? createActivity({ type: "task_completed", title: `完成任务：${task.title}`, relatedId: id, skillIds: task.skillIds, projectId: task.projectId, stageId: task.stageId }, createdAt) : null;
        return { ...current, tasks: [task, ...current.tasks], activities: activity ? [activity, ...current.activities] : current.activities };
      });
      return id;
    },
    updateTask: (id, changes) => setState((current) => {
      const existing = current.tasks.find((task) => task.id === id);
      if (!existing) return current;
      const nextStatus = changes.status ?? existing.status;
      const enteringDone = existing.status !== "done" && nextStatus === "done";
      const leavingDone = existing.status === "done" && nextStatus !== "done";
      const now = new Date().toISOString();
      const task: Task = { ...existing, ...changes, completedAt: enteringDone ? now : leavingDone ? undefined : existing.completedAt };
      let activities = current.activities;
      let evidence = current.evidence;
      if (enteringDone) activities = [createActivity({ type: "task_completed", title: `完成任务：${task.title}`, relatedId: id, skillIds: task.skillIds, projectId: task.projectId, stageId: task.stageId }, now), ...activities];
      if (leavingDone) {
        activities = activities.filter((activity) => !(activity.relatedId === id && (activity.type === "task_completed" || activity.type === "evidence_created")));
        evidence = evidence.filter((item) => !(item.sourceType === "task" && item.sourceId === id));
      }
      if (!enteringDone && !leavingDone && task.status === "done") activities = activities.map((activity) => activity.type === "task_completed" && activity.relatedId === id ? { ...activity, title: `完成任务：${task.title}`, skillIds: task.skillIds, projectId: task.projectId, stageId: task.stageId } : activity);
      return { ...current, tasks: current.tasks.map((item) => item.id === id ? task : item), activities, evidence };
    }),
    deleteTask: (id) => setState((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== id),
      activities: current.activities.filter((activity) => activity.relatedId !== id),
      evidence: current.evidence.filter((item) => !(item.sourceType === "task" && item.sourceId === id)),
    })),
    toggleTask: (id) => setState((current) => {
      const task = current.tasks.find((item) => item.id === id);
      if (!task) return current;
      const done = task.status === "done";
      const now = new Date().toISOString();
      const updated = { ...task, status: done ? "todo" as const : "done" as const, completedAt: done ? undefined : now };
      const activities = done
        ? current.activities.filter((activity) => !(activity.relatedId === id && (activity.type === "task_completed" || activity.type === "evidence_created")))
        : [createActivity({ type: "task_completed", title: `完成任务：${task.title}`, relatedId: id, skillIds: task.skillIds, projectId: task.projectId, stageId: task.stageId }, now), ...current.activities];
      const evidence = done ? current.evidence.filter((item) => !(item.sourceType === "task" && item.sourceId === id)) : current.evidence;
      return { ...current, tasks: current.tasks.map((item) => item.id === id ? updated : item), activities, evidence };
    }),
    addTaskAsEvidence: (id) => setState((current) => {
      const task = current.tasks.find((item) => item.id === id);
      if (!task || task.status !== "done" || !task.skillIds?.length) return current;
      const now = new Date().toISOString();
      const additions = createEvidence(task.skillIds, { title: task.title, description: task.description, sourceType: "task", sourceId: task.id }, current.evidence, now);
      if (!additions.length) return current;
      return {
        ...current,
        evidence: [...additions, ...current.evidence],
        activities: [createActivity({ type: "evidence_created", title: `形成能力证据：${task.title}`, relatedId: task.id, skillIds: task.skillIds, projectId: task.projectId, stageId: task.stageId }, now), ...current.activities],
      };
    }),

    createNote: (draft) => {
      const id = createId("note");
      const now = new Date().toISOString();
      const note: Note = { id, createdAt: now, updatedAt: now, ...draft };
      setState((current) => {
        const additions = createEvidence(note.skillIds, { title: note.title, description: `${note.type} 记录`, sourceType: "note", sourceId: id }, current.evidence, now);
        return {
          ...current,
          notes: [note, ...current.notes],
          evidence: [...additions, ...current.evidence],
          activities: [createActivity({ type: "note_created", title: `新增记录：${note.title}`, relatedId: id, skillIds: note.skillIds, projectId: note.projectId, stageId: note.stageId }, now), ...current.activities],
        };
      });
      return id;
    },
    updateNote: (id, changes) => setState((current) => {
      const existing = current.notes.find((note) => note.id === id);
      if (!existing) return current;
      const updatedAt = new Date().toISOString();
      const note: Note = { ...existing, ...changes, updatedAt };
      const retainedEvidence = current.evidence.filter((item) => !(item.sourceType === "note" && item.sourceId === id));
      const additions = createEvidence(note.skillIds, { title: note.title, description: `${note.type} 记录`, sourceType: "note", sourceId: id }, retainedEvidence, existing.createdAt);
      return {
        ...current,
        notes: current.notes.map((item) => item.id === id ? note : item),
        evidence: [...additions, ...retainedEvidence],
        activities: current.activities.map((activity) => activity.relatedId === id && activity.type === "note_created" ? { ...activity, title: `新增记录：${note.title}`, skillIds: note.skillIds, projectId: note.projectId, stageId: note.stageId } : activity),
      };
    }),
    deleteNote: (id) => setState((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.id !== id),
      activities: current.activities.filter((activity) => activity.relatedId !== id),
      evidence: current.evidence.filter((item) => !(item.sourceType === "note" && item.sourceId === id)),
    })),

    startPractice: (draft) => {
      const id = createId("practice");
      const record: PracticeRecord = { id, createdAt: new Date().toISOString(), ...draft };
      setState((current) => ({ ...current, practiceRecords: [record, ...current.practiceRecords] }));
      return id;
    },
    togglePracticeItem: (recordId, itemId) => setState((current) => ({
      ...current,
      practiceRecords: current.practiceRecords.map((record) => record.id === recordId ? { ...record, checklist: record.checklist.map((item) => item.id === itemId ? { ...item, completed: !item.completed } : item) } : record),
    })),
    updatePracticeNotes: (recordId, notes) => setState((current) => ({ ...current, practiceRecords: current.practiceRecords.map((record) => record.id === recordId ? { ...record, notes } : record) })),
    togglePracticeComplete: (recordId) => setState((current) => {
      const record = current.practiceRecords.find((item) => item.id === recordId);
      if (!record) return current;
      const wasComplete = Boolean(record.completedAt);
      const now = new Date().toISOString();
      const completedAt = wasComplete ? undefined : now;
      const practiceRecords = current.practiceRecords.map((item) => item.id === recordId ? { ...item, completedAt } : item);
      if (wasComplete) return {
        ...current,
        practiceRecords,
        activities: current.activities.filter((activity) => !(activity.type === "practice_completed" && activity.relatedId === recordId)),
        evidence: current.evidence.filter((item) => !(item.sourceType === "practice" && item.sourceId === recordId)),
      };
      const completed = record.checklist.filter((item) => item.completed).length;
      const additions = createEvidence(record.skillIds, { title: record.title, description: `完成 ${completed}/${record.checklist.length} 项实践检查`, sourceType: "practice", sourceId: recordId }, current.evidence, now);
      return {
        ...current,
        practiceRecords,
        evidence: [...additions, ...current.evidence],
        activities: [createActivity({ type: "practice_completed", title: `完成实践：${record.title}`, description: `${completed}/${record.checklist.length} checks`, relatedId: recordId, skillIds: record.skillIds, stageId: record.stageId }, now), ...current.activities],
      };
    }),
    deletePractice: (recordId) => setState((current) => ({
      ...current,
      practiceRecords: current.practiceRecords.filter((record) => record.id !== recordId),
      activities: current.activities.filter((activity) => activity.relatedId !== recordId),
      evidence: current.evidence.filter((item) => !(item.sourceType === "practice" && item.sourceId === recordId)),
    })),

    toggleProjectMilestone: (id) => setState((current) => {
      const milestone = current.projectMilestones.find((item) => item.id === id);
      if (!milestone) return current;
      const project = projects.find((item) => item.id === milestone.projectId);
      const wasComplete = milestone.completed;
      const now = new Date().toISOString();
      const updated: ProjectMilestone = { ...milestone, completed: !wasComplete, completedAt: wasComplete ? undefined : now };
      const projectMilestones = current.projectMilestones.map((item) => item.id === id ? updated : item);
      if (wasComplete) return {
        ...current,
        projectMilestones,
        activities: current.activities.filter((activity) => !(activity.type === "milestone_completed" && activity.relatedId === id)),
        evidence: current.evidence.filter((item) => !(item.sourceType === "project" && item.sourceId === id)),
      };
      const additions = createEvidence(milestone.skillIds, { title: milestone.title, description: project?.name, sourceType: "project", sourceId: id }, current.evidence, now);
      return {
        ...current,
        projectMilestones,
        evidence: [...additions, ...current.evidence],
        activities: [createActivity({ type: "milestone_completed", title: `完成里程碑：${milestone.title}`, description: project?.name, relatedId: id, skillIds: milestone.skillIds, projectId: milestone.projectId, stageId: project?.stageId }, now), ...current.activities],
      };
    }),

    saveWeeklyReview: (draft) => {
      const existing = state.weeklyReviews.find((review) => review.week === draft.week);
      const now = new Date().toISOString();
      const id = existing?.id ?? createId("review");
      const review: WeeklyReview = { id, ...draft, createdAt: existing?.createdAt ?? now, updatedAt: now };
      setState((current) => ({ ...current, weeklyReviews: existing ? current.weeklyReviews.map((item) => item.id === existing.id ? review : item) : [review, ...current.weeklyReviews] }));
      return id;
    },
    createManualEvidence: (draft) => setState((current) => {
      const now = new Date().toISOString();
      const evidence: SkillEvidence = { id: createId("evidence"), sourceType: "manual", createdAt: now, ...draft };
      return { ...current, evidence: [evidence, ...current.evidence], activities: [createActivity({ type: "evidence_created", title: `形成能力证据：${draft.title}`, relatedId: evidence.id, skillIds: [draft.skillId] }, now), ...current.activities] };
    }),

    reset: () => {
      studyRepository.clearAll();
      setState(createDefaultStudyState());
    },
    exportBackup: () => studyRepository.exportBackup(state),
    importBackup: async (file) => {
      const imported = await studyRepository.importBackup(file, state);
      setState(imported);
    },
  }), [progress, state, weeklyMetrics]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudyState() {
  const context = useContext(StudyContext);
  if (!context) throw new Error("useStudyState must be used inside StudyProvider");
  return context;
}
