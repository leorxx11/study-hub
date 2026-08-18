export type ThemeMode = "light" | "dark" | "system";

export type RoadmapCategory = "testing" | "engineering" | "development";

export interface RoadmapNode {
  id: string;
  title: string;
  shortTitle: string;
  category: RoadmapCategory;
  priority: 2 | 3 | 4 | 5;
  summary: string;
  learn: string[];
  why: string;
  practice: string[];
  outputs: string[];
  technologies: string[];
  skillIds: string[];
  stageId: string;
}

export interface Stage {
  id: string;
  order: number;
  period: string;
  title: string;
  theme: string;
  description: string;
  learning: string[];
  practice: string[];
  outputs: string[];
}

export type SkillCategory = "测试基础" | "自动化" | "工程能力" | "后端开发";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number;
  targetLevel: number;
  priority: 2 | 3 | 4 | 5;
  description: string;
  nextAction: string;
}

export interface PracticeItem {
  id: string;
  label: string;
}

export interface PracticeGroup {
  id: string;
  title: string;
  description: string;
  items: PracticeItem[];
}

export type ProjectStatus = "Planned" | "Future";

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  description: string;
  goal: string;
  technologies: string[];
  milestones: string[];
  stage: string;
  stageId: string;
}

export type TaskType = "learning" | "practice" | "project" | "bug" | "automation" | "deployment";
export type TaskStatus = "todo" | "doing" | "done";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  priority?: Priority;
  date?: string;
  week?: string;
  stageId?: string;
  skillIds?: string[];
  projectId?: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
}

export type NoteType = "learning" | "bug" | "automation" | "deployment" | "project" | "review";

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  skillIds?: string[];
  projectId?: string;
  stageId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PracticeRecordType = "bug" | "automation" | "deployment" | "general";

export interface PracticeRecord {
  id: string;
  type: PracticeRecordType;
  title: string;
  checklist: {
    id: string;
    label: string;
    completed: boolean;
  }[];
  notes?: string;
  skillIds?: string[];
  stageId?: string;
  createdAt: string;
  completedAt?: string;
}

export type ActivityType = "task_completed" | "note_created" | "practice_completed" | "milestone_completed" | "evidence_created" | "daily_log_created" | "topic_completed";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  relatedId?: string;
  skillIds?: string[];
  projectId?: string;
  stageId?: string;
  createdAt: string;
}

export type EvidenceSourceType = "task" | "note" | "practice" | "project" | "manual";

export interface SkillEvidence {
  id: string;
  skillId: string;
  title: string;
  description?: string;
  sourceType: EvidenceSourceType;
  sourceId?: string;
  createdAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  skillIds?: string[];
  completedAt?: string;
}

export interface WeeklyReview {
  id: string;
  week: string;
  learned: string;
  work: string;
  mostValuableProblem: string;
  automated: string;
  unclear: string;
  nextWeekGoals: string;
  resumeValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: string;
  date: string;
  work: string;
  learned?: string;
  problems?: string;
  next?: string;
  tags: string[];
  roadmapItemIds?: string[];
  projectIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export type TopicStatus = "not_started" | "learning" | "practiced" | "done";

export interface RoadmapTopicProgress {
  topicId: string;
  status: TopicStatus;
  updatedAt: string;
}

export interface RoadmapTopic {
  id: string;
  order: number;
  title: string;
  pathId: string;
  moduleId: string;
  estimatedMinutes: string;
  why: string;
  understand: string[];
  doneCriteria: string[];
  practiceSuggestion: string;
  nextTopicId?: string;
  legacySkillIds?: string[];
}

export interface RoadmapModule {
  id: string;
  pathId: string;
  title: string;
  description: string;
  topicIds: string[];
}

export interface RoadmapPath {
  id: string;
  code: string;
  title: string;
  description: string;
  stageId?: string;
  moduleIds: string[];
}

export type GrowthLevel = "same" | "some" | "clear";

export interface WeeklyGrowthCheck {
  technicalUnderstanding: GrowthLevel;
  problemSolving: GrowthLevel;
  automation: GrowthLevel;
  engineeringProcess: GrowthLevel;
}

export interface WeeklyReviewV3 {
  id: string;
  week: string;
  mainWork: string;
  learned: string;
  repetitiveWork: string;
  deepDive: string;
  nextWeekTop3: string;
  growthCheck: WeeklyGrowthCheck;
  createdAt: string;
  updatedAt: string;
}

export type AIExportRange = "this_week" | "last_2_weeks" | "this_month" | "internship";

export interface UserSettings {
  displayName: string;
  weeklyFocus: string;
  internshipStartDate: string;
  currentFocusTopicIds: string[];
  aiExportDefaultRange: AIExportRange;
}

export interface StudyState {
  version: 3;
  storageVersion: 3;
  checklist: Record<string, boolean>;
  completedStages: string[];
  skillLevels: Record<string, number>;
  currentStageId: string;
  theme: ThemeMode;
  settings: UserSettings;
  tasks: Task[];
  notes: Note[];
  practiceRecords: PracticeRecord[];
  activities: Activity[];
  evidence: SkillEvidence[];
  projectMilestones: ProjectMilestone[];
  weeklyReviews: WeeklyReview[];
  dailyLogs: DailyLog[];
  topicProgress: RoadmapTopicProgress[];
  weeklyReviewsV3: WeeklyReviewV3[];
  legacyData?: Record<string, unknown>;
}

export interface V2StudyState {
  version: 2;
  storageVersion: 2;
  checklist: Record<string, boolean>;
  completedStages: string[];
  skillLevels: Record<string, number>;
  currentStageId: string;
  theme: ThemeMode;
  settings: {
    displayName: string;
    weeklyFocus: string;
  };
  tasks: Task[];
  notes: Note[];
  practiceRecords: PracticeRecord[];
  activities: Activity[];
  evidence: SkillEvidence[];
  projectMilestones: ProjectMilestone[];
  weeklyReviews: WeeklyReview[];
  legacyData?: Record<string, unknown>;
}

export interface V1StudyState {
  version?: 1;
  checklist?: Record<string, boolean>;
  completedStages?: string[];
  skillLevels?: Record<string, number>;
  currentStageId?: string;
  theme?: ThemeMode;
  settings?: Partial<UserSettings>;
  [key: string]: unknown;
}
