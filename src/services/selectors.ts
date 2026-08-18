import { projects } from "../data/projects";
import { skills } from "../data/skills";
import { stages } from "../data/stages";
import type { Activity, ProjectMilestone, SkillEvidence, StudyState } from "../types";
import { getWeekKey, isInWeek } from "../utils/date";

export interface ProgressSummary {
  overall: number;
  checklistCompleted: number;
  checklistTotal: number;
  checklistPercent: number;
  stagesCompleted: number;
  stagesTotal: number;
  stagesPercent: number;
  skillPercent: number;
  tasksCompleted: number;
  tasksTotal: number;
  practicesCompleted: number;
  practicesTotal: number;
  milestonesCompleted: number;
  milestonesTotal: number;
}

export interface WeeklyMetrics {
  week: string;
  tasksCompleted: number;
  practices: number;
  bugCases: number;
  notes: number;
  milestones: number;
}

const percent = (completed: number, total: number) => total ? Math.round((completed / total) * 100) : 0;

export function getProjectMilestones(state: StudyState, projectId: string): ProjectMilestone[] {
  return state.projectMilestones.filter((milestone) => milestone.projectId === projectId);
}

export function getProjectProgress(state: StudyState, projectId: string): number {
  const milestones = getProjectMilestones(state, projectId);
  return percent(milestones.filter((milestone) => milestone.completed).length, milestones.length);
}

export function getStageProgress(state: StudyState, stageId: string): number {
  if (state.completedStages.includes(stageId)) return 100;
  const stageProjectIds = projects.filter((project) => project.stageId === stageId).map((project) => project.id);
  const tasks = state.tasks.filter((task) => task.stageId === stageId);
  const practices = state.practiceRecords.filter((record) => record.stageId === stageId);
  const milestones = state.projectMilestones.filter((milestone) => stageProjectIds.includes(milestone.projectId));
  const total = tasks.length + practices.length + milestones.length;
  const completed = tasks.filter((task) => task.status === "done").length
    + practices.filter((record) => Boolean(record.completedAt)).length
    + milestones.filter((milestone) => milestone.completed).length;
  return percent(completed, total);
}

export function getProgressSummary(state: StudyState): ProgressSummary {
  const tasksCompleted = state.tasks.filter((task) => task.status === "done").length;
  const practicesCompleted = state.practiceRecords.filter((record) => Boolean(record.completedAt)).length;
  const milestonesCompleted = state.projectMilestones.filter((milestone) => milestone.completed).length;
  const total = state.tasks.length + state.practiceRecords.length + state.projectMilestones.length;
  const completed = tasksCompleted + practicesCompleted + milestonesCompleted;
  const stageValues = stages.map((stage) => getStageProgress(state, stage.id));
  const skillScore = skills.reduce((sum, skill) => sum + Math.min(state.skillLevels[skill.id] ?? skill.level, skill.targetLevel), 0);
  const skillTarget = skills.reduce((sum, skill) => sum + skill.targetLevel, 0);
  const taskPercent = percent(tasksCompleted, state.tasks.length);
  return {
    overall: percent(completed, total),
    checklistCompleted: tasksCompleted,
    checklistTotal: state.tasks.length,
    checklistPercent: taskPercent,
    stagesCompleted: stageValues.filter((value) => value === 100).length,
    stagesTotal: stages.length,
    stagesPercent: Math.round(stageValues.reduce((sum, value) => sum + value, 0) / stages.length),
    skillPercent: percent(skillScore, skillTarget),
    tasksCompleted,
    tasksTotal: state.tasks.length,
    practicesCompleted,
    practicesTotal: state.practiceRecords.length,
    milestonesCompleted,
    milestonesTotal: state.projectMilestones.length,
  };
}

export function getWeeklyMetrics(state: StudyState, week = getWeekKey()): WeeklyMetrics {
  return {
    week,
    tasksCompleted: state.tasks.filter((task) => task.status === "done" && isInWeek(task.completedAt, week)).length,
    practices: state.practiceRecords.filter((record) => isInWeek(record.completedAt, week)).length,
    bugCases: state.notes.filter((note) => note.type === "bug" && isInWeek(note.createdAt, week)).length,
    notes: state.notes.filter((note) => isInWeek(note.createdAt, week)).length,
    milestones: state.projectMilestones.filter((milestone) => milestone.completed && isInWeek(milestone.completedAt, week)).length,
  };
}

export function getSkillEvidence(state: StudyState, skillId: string): SkillEvidence[] {
  return state.evidence.filter((item) => item.skillId === skillId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSkillActivities(state: StudyState, skillId: string): Activity[] {
  return state.activities.filter((activity) => activity.skillIds?.includes(skillId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRecentActivities(state: StudyState, limit = 10): Activity[] {
  return [...state.activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export function getWeeklySkillActivity(state: StudyState, week = getWeekKey()): { skillId: string; count: number }[] {
  return skills.map((skill) => ({
    skillId: skill.id,
    count: state.activities.filter((activity) => activity.skillIds?.includes(skill.id) && isInWeek(activity.createdAt, week)).length,
  })).filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
}
