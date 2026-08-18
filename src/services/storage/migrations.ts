import { focusTasks } from "../../data/overview";
import { practiceGroups } from "../../data/practice";
import { defaultProjectMilestones } from "../../data/projectMilestones";
import type { PracticeRecord, StudyState, Task, ThemeMode, V1StudyState } from "../../types";
import { getLocalDateKey, getWeekKey } from "../../utils/date";
import { createId } from "../../utils/id";

const defaultSettings = {
  displayName: "Leo",
  weeklyFocus: "HTTP / DevTools / Python",
};

const focusTaskRelations: Record<string, Pick<Task, "type" | "skillIds" | "stageId">> = {
  "focus-http-note": { type: "learning", skillIds: ["http"], stageId: "stage-1" },
  "focus-devtools": { type: "practice", skillIds: ["http", "devtools"], stageId: "stage-1" },
  "focus-curl": { type: "practice", skillIds: ["http", "linux"], stageId: "stage-1" },
  "focus-requests": { type: "automation", skillIds: ["http", "python"], stageId: "stage-1" },
  "focus-bug-log": { type: "bug", skillIds: ["devtools", "linux"], stageId: "stage-1" },
};

const isTheme = (value: unknown): value is ThemeMode => value === "light" || value === "dark" || value === "system";
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

function createSeedTasks(checklist: Record<string, boolean> = {}): Task[] {
  const now = new Date();
  const createdAt = now.toISOString();
  const date = getLocalDateKey(now);
  const week = getWeekKey(now);
  return focusTasks.map((item) => {
    const done = Boolean(checklist[item.id]);
    const relations = focusTaskRelations[item.id] ?? { type: "learning" as const, skillIds: [], stageId: "stage-1" };
    return {
      id: `task-${item.id}`,
      title: item.label,
      status: done ? "done" : "todo",
      priority: "high",
      date,
      week,
      createdAt,
      ...relations,
    };
  });
}

export function createDefaultStudyState(): StudyState {
  return {
    version: 2,
    storageVersion: 2,
    checklist: {},
    completedStages: [],
    skillLevels: {},
    currentStageId: "stage-1",
    theme: "system",
    settings: { ...defaultSettings },
    tasks: createSeedTasks(),
    notes: [],
    practiceRecords: [],
    activities: [],
    evidence: [],
    projectMilestones: defaultProjectMilestones.map((milestone) => ({ ...milestone, skillIds: [...(milestone.skillIds ?? [])] })),
    weeklyReviews: [],
  };
}

export function migrateV1ToV2(value: V1StudyState): StudyState {
  const base = createDefaultStudyState();
  const checklist = isObject(value.checklist) ? value.checklist as Record<string, boolean> : {};
  const now = new Date().toISOString();
  const migratedPractices: PracticeRecord[] = practiceGroups
    .filter((group) => group.id !== "initiative" && group.items.some((item) => checklist[item.id]))
    .map((group) => {
      const items = group.items.map((item) => ({ ...item, completed: Boolean(checklist[item.id]) }));
      const isComplete = items.every((item) => item.completed);
      return {
        id: createId(`migrated-${group.id}`),
        type: group.id === "bug" ? "bug" : group.id === "automation" ? "automation" : "deployment",
        title: `${group.title} · V1 迁移记录`,
        checklist: items,
        notes: "由 Study Hub V1 一次性 Checklist 无损迁移。",
        stageId: value.currentStageId ?? "stage-1",
        createdAt: now,
        completedAt: isComplete ? now : undefined,
      };
    });

  return {
    ...base,
    checklist,
    completedStages: Array.isArray(value.completedStages) ? value.completedStages.filter((item): item is string => typeof item === "string") : [],
    skillLevels: isObject(value.skillLevels) ? value.skillLevels as Record<string, number> : {},
    currentStageId: typeof value.currentStageId === "string" ? value.currentStageId : base.currentStageId,
    theme: isTheme(value.theme) ? value.theme : base.theme,
    settings: {
      displayName: typeof value.settings?.displayName === "string" ? value.settings.displayName : defaultSettings.displayName,
      weeklyFocus: typeof value.settings?.weeklyFocus === "string" ? value.settings.weeklyFocus : defaultSettings.weeklyFocus,
    },
    tasks: createSeedTasks(checklist),
    practiceRecords: migratedPractices,
    legacyData: { ...value },
  };
}

export function normalizeV2State(value: unknown): StudyState {
  const base = createDefaultStudyState();
  if (!isObject(value)) return base;
  if (value.storageVersion !== 2 && value.version !== 2) return migrateV1ToV2(value as V1StudyState);

  const savedMilestones = Array.isArray(value.projectMilestones) ? value.projectMilestones.filter(isObject) : [];
  const milestoneById = new Map(savedMilestones.map((item) => [String(item.id), item]));
  const mergedMilestones = defaultProjectMilestones.map((milestone) => ({
    ...milestone,
    ...(milestoneById.get(milestone.id) ?? {}),
    id: milestone.id,
    projectId: milestone.projectId,
    title: milestone.title,
    skillIds: [...(milestone.skillIds ?? [])],
  }));
  const customMilestones = savedMilestones.filter((item) => !defaultProjectMilestones.some((milestone) => milestone.id === item.id));

  return {
    ...base,
    version: 2,
    storageVersion: 2,
    checklist: isObject(value.checklist) ? value.checklist as Record<string, boolean> : {},
    completedStages: Array.isArray(value.completedStages) ? value.completedStages.filter((item): item is string => typeof item === "string") : [],
    skillLevels: isObject(value.skillLevels) ? value.skillLevels as Record<string, number> : {},
    currentStageId: typeof value.currentStageId === "string" ? value.currentStageId : base.currentStageId,
    theme: isTheme(value.theme) ? value.theme : base.theme,
    settings: {
      displayName: isObject(value.settings) && typeof value.settings.displayName === "string" ? value.settings.displayName : base.settings.displayName,
      weeklyFocus: isObject(value.settings) && typeof value.settings.weeklyFocus === "string" ? value.settings.weeklyFocus : base.settings.weeklyFocus,
    },
    tasks: Array.isArray(value.tasks) ? value.tasks.filter(isObject) as unknown as StudyState["tasks"] : base.tasks,
    notes: Array.isArray(value.notes) ? value.notes.filter(isObject) as unknown as StudyState["notes"] : [],
    practiceRecords: Array.isArray(value.practiceRecords) ? value.practiceRecords.filter(isObject) as unknown as StudyState["practiceRecords"] : [],
    activities: Array.isArray(value.activities) ? value.activities.filter(isObject) as unknown as StudyState["activities"] : [],
    evidence: Array.isArray(value.evidence) ? value.evidence.filter(isObject) as unknown as StudyState["evidence"] : [],
    projectMilestones: [...mergedMilestones, ...customMilestones as unknown as StudyState["projectMilestones"]],
    weeklyReviews: Array.isArray(value.weeklyReviews) ? value.weeklyReviews.filter(isObject) as unknown as StudyState["weeklyReviews"] : [],
    legacyData: isObject(value.legacyData) ? value.legacyData : undefined,
  };
}
