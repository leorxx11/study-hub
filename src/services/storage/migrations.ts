import { focusTasks } from "../../data/overview";
import { practiceGroups } from "../../data/practice";
import { defaultProjectMilestones } from "../../data/projectMilestones";
import { defaultFocusTopicIds, roadmapTopics, topicIdsForLegacySkills } from "../../data/roadmapV3";
import type {
  DailyLog,
  GrowthLevel,
  PracticeRecord,
  ProjectMilestone,
  StudyState,
  Task,
  ThemeMode,
  V1StudyState,
  V2StudyState,
  WeeklyReviewV3,
} from "../../types";
import { getLocalDateKey, getWeekKey } from "../../utils/date";
import { createId } from "../../utils/id";

const defaultSettings = {
  displayName: "Leo",
  weeklyFocus: "HTTP / DevTools",
  internshipStartDate: "2026-08-10",
  currentFocusTopicIds: [...defaultFocusTopicIds],
  aiExportDefaultRange: "this_week" as const,
};

const focusTaskRelations: Record<string, Pick<Task, "type" | "skillIds" | "stageId">> = {
  "focus-http-note": { type: "learning", skillIds: ["http"], stageId: "stage-1" },
  "focus-devtools": { type: "practice", skillIds: ["http", "devtools"], stageId: "stage-1" },
  "focus-curl": { type: "practice", skillIds: ["http", "linux"], stageId: "stage-1" },
  "focus-requests": { type: "automation", skillIds: ["http", "python"], stageId: "stage-1" },
  "focus-bug-log": { type: "bug", skillIds: ["devtools", "linux"], stageId: "stage-1" },
};

const isTheme = (value: unknown): value is ThemeMode => value === "light" || value === "dark" || value === "system";
const isGrowthLevel = (value: unknown): value is GrowthLevel => value === "same" || value === "some" || value === "clear";
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const objects = (value: unknown) => Array.isArray(value) ? value.filter(isObject) : [];

function createSeedTasks(checklist: Record<string, boolean> = {}): Task[] {
  const now = new Date();
  const createdAt = now.toISOString();
  const date = getLocalDateKey(now);
  const week = getWeekKey(now);
  return focusTasks.map((item) => {
    const relations = focusTaskRelations[item.id] ?? { type: "learning" as const, skillIds: [], stageId: "stage-1" };
    return { id: `task-${item.id}`, title: item.label, status: checklist[item.id] ? "done" : "todo", priority: "high", date, week, createdAt, ...relations };
  });
}

function mergeMilestones(saved: unknown): ProjectMilestone[] {
  const savedMilestones = objects(saved);
  const milestoneById = new Map(savedMilestones.map((item) => [String(item.id), item]));
  const defaults = defaultProjectMilestones.map((milestone) => ({
    ...milestone,
    ...(milestoneById.get(milestone.id) ?? {}),
    id: milestone.id,
    projectId: milestone.projectId,
    title: milestone.title,
    skillIds: [...(milestone.skillIds ?? [])],
  })) as ProjectMilestone[];
  const custom = savedMilestones.filter((item) => !defaultProjectMilestones.some((milestone) => milestone.id === item.id)) as unknown as ProjectMilestone[];
  return [...defaults, ...custom];
}

function createLegacyV2Default(): V2StudyState {
  return {
    version: 2,
    storageVersion: 2,
    checklist: {},
    completedStages: [],
    skillLevels: {},
    currentStageId: "stage-1",
    theme: "system",
    settings: { displayName: defaultSettings.displayName, weeklyFocus: defaultSettings.weeklyFocus },
    tasks: createSeedTasks(),
    notes: [],
    practiceRecords: [],
    activities: [],
    evidence: [],
    projectMilestones: mergeMilestones([]),
    weeklyReviews: [],
  };
}

export function createDefaultStudyState(): StudyState {
  const legacy = createLegacyV2Default();
  return {
    ...legacy,
    version: 3,
    storageVersion: 3,
    settings: { ...defaultSettings, currentFocusTopicIds: [...defaultSettings.currentFocusTopicIds] },
    dailyLogs: [],
    topicProgress: [],
    weeklyReviewsV3: [],
  };
}

export function migrateV1ToV2(value: V1StudyState): V2StudyState {
  const base = createLegacyV2Default();
  const checklist = isObject(value.checklist) ? value.checklist as Record<string, boolean> : {};
  const now = new Date().toISOString();
  const migratedPractices: PracticeRecord[] = practiceGroups
    .filter((group) => group.id !== "initiative" && group.items.some((item) => checklist[item.id]))
    .map((group) => {
      const items = group.items.map((item) => ({ ...item, completed: Boolean(checklist[item.id]) }));
      return {
        id: createId(`migrated-${group.id}`),
        type: group.id === "bug" ? "bug" : group.id === "automation" ? "automation" : "deployment",
        title: `${group.title} · V1 迁移记录`,
        checklist: items,
        notes: "由 Study Hub V1 一次性 Checklist 无损迁移。",
        stageId: typeof value.currentStageId === "string" ? value.currentStageId : "stage-1",
        createdAt: now,
        completedAt: items.every((item) => item.completed) ? now : undefined,
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
      displayName: typeof value.settings?.displayName === "string" ? value.settings.displayName : base.settings.displayName,
      weeklyFocus: typeof value.settings?.weeklyFocus === "string" ? value.settings.weeklyFocus : base.settings.weeklyFocus,
    },
    tasks: createSeedTasks(checklist),
    practiceRecords: migratedPractices,
    legacyData: { ...value },
  };
}

export function normalizeV2State(value: unknown): V2StudyState {
  const base = createLegacyV2Default();
  if (!isObject(value)) return base;
  if (value.storageVersion !== 2 && value.version !== 2) return migrateV1ToV2(value as V1StudyState);
  const settings = isObject(value.settings) ? value.settings : {};
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
      displayName: typeof settings.displayName === "string" ? settings.displayName : base.settings.displayName,
      weeklyFocus: typeof settings.weeklyFocus === "string" ? settings.weeklyFocus : base.settings.weeklyFocus,
    },
    tasks: objects(value.tasks) as unknown as V2StudyState["tasks"],
    notes: objects(value.notes) as unknown as V2StudyState["notes"],
    practiceRecords: objects(value.practiceRecords) as unknown as V2StudyState["practiceRecords"],
    activities: objects(value.activities) as unknown as V2StudyState["activities"],
    evidence: objects(value.evidence) as unknown as V2StudyState["evidence"],
    projectMilestones: mergeMilestones(value.projectMilestones),
    weeklyReviews: objects(value.weeklyReviews) as unknown as V2StudyState["weeklyReviews"],
    legacyData: isObject(value.legacyData) ? value.legacyData : undefined,
  };
}

function dateFromIso(value: string | undefined): string {
  if (!value) return getLocalDateKey();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? getLocalDateKey() : getLocalDateKey(date);
}

function migrateLogs(value: V2StudyState): DailyLog[] {
  const logs = new Map<string, DailyLog>();
  const append = (date: string, content: string, tags: string[], roadmapItemIds: string[], projectIds: string[], createdAt: string, updatedAt: string) => {
    const existing = logs.get(date);
    if (existing) {
      existing.work = `${existing.work}\n\n---\n\n${content}`;
      existing.tags = [...new Set([...existing.tags, ...tags])];
      existing.roadmapItemIds = [...new Set([...(existing.roadmapItemIds ?? []), ...roadmapItemIds])];
      existing.projectIds = [...new Set([...(existing.projectIds ?? []), ...projectIds])];
      if (updatedAt > existing.updatedAt) existing.updatedAt = updatedAt;
      if (createdAt < existing.createdAt) existing.createdAt = createdAt;
      return;
    }
    logs.set(date, { id: `daily-migrated-${date}`, date, work: content, tags: [...new Set(tags)], roadmapItemIds: [...new Set(roadmapItemIds)], projectIds: [...new Set(projectIds)], createdAt, updatedAt });
  };

  value.notes.forEach((note) => {
    append(
      dateFromIso(note.createdAt),
      `[${note.type.toUpperCase()}] ${note.title}\n\n${note.content}`,
      [note.type],
      topicIdsForLegacySkills(note.skillIds),
      note.projectId ? [note.projectId] : [],
      note.createdAt,
      note.updatedAt,
    );
  });

  value.practiceRecords.filter((record) => record.completedAt).forEach((record) => {
    const checklist = record.checklist.map((item) => `- [${item.completed ? "x" : " "}] ${item.label}`).join("\n");
    append(
      dateFromIso(record.completedAt),
      `[PRACTICE · ${record.type.toUpperCase()}] ${record.title}\n\n${checklist}${record.notes ? `\n\n${record.notes}` : ""}`,
      [record.type === "general" ? "work" : record.type],
      topicIdsForLegacySkills(record.skillIds),
      [],
      record.createdAt,
      record.completedAt ?? record.createdAt,
    );
  });
  return [...logs.values()].sort((a, b) => b.date.localeCompare(a.date));
}

function migrateWeeklyReviews(value: V2StudyState): WeeklyReviewV3[] {
  return value.weeklyReviews.map((review) => ({
    id: `v3-${review.id}`,
    week: review.week,
    mainWork: [review.work, review.resumeValue ? `值得沉淀：\n${review.resumeValue}` : ""].filter(Boolean).join("\n\n"),
    learned: review.learned,
    repetitiveWork: review.automated ? `本周自动化记录：\n${review.automated}` : "",
    deepDive: [review.mostValuableProblem ? `最有价值的问题：\n${review.mostValuableProblem}` : "", review.unclear ? `仍需深入：\n${review.unclear}` : ""].filter(Boolean).join("\n\n"),
    nextWeekTop3: review.nextWeekGoals,
    growthCheck: { technicalUnderstanding: "same", problemSolving: "same", automation: "same", engineeringProcess: "same" },
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  }));
}

function migrateTopicProgress(value: V2StudyState): StudyState["topicProgress"] {
  const now = new Date().toISOString();
  return roadmapTopics.flatMap((topic) => {
    const levels = (topic.legacySkillIds ?? []).map((id) => value.skillLevels[id]).filter((level): level is number => typeof level === "number");
    if (!levels.length) return [];
    const level = Math.max(...levels);
    if (level < 4) return [];
    return [{ topicId: topic.id, status: level >= 8 ? "done" as const : level >= 6 ? "practiced" as const : "learning" as const, updatedAt: now }];
  });
}

export function migrateV2ToV3(input: unknown): StudyState {
  const value = normalizeV2State(input);
  const base = createDefaultStudyState();
  return {
    ...base,
    checklist: value.checklist,
    completedStages: value.completedStages,
    skillLevels: value.skillLevels,
    currentStageId: value.currentStageId,
    theme: value.theme,
    settings: { ...base.settings, displayName: value.settings.displayName, weeklyFocus: value.settings.weeklyFocus },
    tasks: value.tasks,
    notes: value.notes,
    practiceRecords: value.practiceRecords,
    activities: value.activities,
    evidence: value.evidence,
    projectMilestones: mergeMilestones(value.projectMilestones),
    weeklyReviews: value.weeklyReviews,
    dailyLogs: migrateLogs(value),
    topicProgress: migrateTopicProgress(value),
    weeklyReviewsV3: migrateWeeklyReviews(value),
    legacyData: { ...(value.legacyData ?? {}), migratedFromStorageVersion: 2 },
  };
}

export function normalizeV3State(value: unknown): StudyState {
  const base = createDefaultStudyState();
  if (!isObject(value)) return base;
  if (value.storageVersion !== 3 && value.version !== 3) return migrateV2ToV3(value);
  const settings = isObject(value.settings) ? value.settings : {};
  const focusIds = Array.isArray(settings.currentFocusTopicIds)
    ? settings.currentFocusTopicIds.filter((id): id is string => typeof id === "string" && roadmapTopics.some((topic) => topic.id === id)).slice(0, 3)
    : base.settings.currentFocusTopicIds;
  const reviews = objects(value.weeklyReviewsV3).map((review) => ({
    ...review,
    growthCheck: isObject(review.growthCheck) ? {
      technicalUnderstanding: isGrowthLevel(review.growthCheck.technicalUnderstanding) ? review.growthCheck.technicalUnderstanding : "same",
      problemSolving: isGrowthLevel(review.growthCheck.problemSolving) ? review.growthCheck.problemSolving : "same",
      automation: isGrowthLevel(review.growthCheck.automation) ? review.growthCheck.automation : "same",
      engineeringProcess: isGrowthLevel(review.growthCheck.engineeringProcess) ? review.growthCheck.engineeringProcess : "same",
    } : { technicalUnderstanding: "same", problemSolving: "same", automation: "same", engineeringProcess: "same" },
  })) as unknown as WeeklyReviewV3[];
  return {
    ...base,
    version: 3,
    storageVersion: 3,
    checklist: isObject(value.checklist) ? value.checklist as Record<string, boolean> : {},
    completedStages: Array.isArray(value.completedStages) ? value.completedStages.filter((item): item is string => typeof item === "string") : [],
    skillLevels: isObject(value.skillLevels) ? value.skillLevels as Record<string, number> : {},
    currentStageId: typeof value.currentStageId === "string" ? value.currentStageId : base.currentStageId,
    theme: isTheme(value.theme) ? value.theme : base.theme,
    settings: {
      displayName: typeof settings.displayName === "string" ? settings.displayName : base.settings.displayName,
      weeklyFocus: typeof settings.weeklyFocus === "string" ? settings.weeklyFocus : base.settings.weeklyFocus,
      internshipStartDate: typeof settings.internshipStartDate === "string" ? settings.internshipStartDate : base.settings.internshipStartDate,
      currentFocusTopicIds: focusIds.length ? focusIds : base.settings.currentFocusTopicIds,
      aiExportDefaultRange: settings.aiExportDefaultRange === "last_2_weeks" || settings.aiExportDefaultRange === "this_month" || settings.aiExportDefaultRange === "internship" ? settings.aiExportDefaultRange : "this_week",
    },
    tasks: objects(value.tasks) as unknown as StudyState["tasks"],
    notes: objects(value.notes) as unknown as StudyState["notes"],
    practiceRecords: objects(value.practiceRecords) as unknown as StudyState["practiceRecords"],
    activities: objects(value.activities) as unknown as StudyState["activities"],
    evidence: objects(value.evidence) as unknown as StudyState["evidence"],
    projectMilestones: mergeMilestones(value.projectMilestones),
    weeklyReviews: objects(value.weeklyReviews) as unknown as StudyState["weeklyReviews"],
    dailyLogs: objects(value.dailyLogs) as unknown as StudyState["dailyLogs"],
    topicProgress: objects(value.topicProgress).filter((item) => typeof item.topicId === "string" && roadmapTopics.some((topic) => topic.id === item.topicId)) as unknown as StudyState["topicProgress"],
    weeklyReviewsV3: reviews,
    legacyData: isObject(value.legacyData) ? value.legacyData : undefined,
  };
}
