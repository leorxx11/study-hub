import { moduleById, roadmapModules, roadmapTopics, topicById } from "../data/roadmapV3";
import { projects } from "../data/projects";
import type { DailyLog, StudyState, TopicStatus } from "../types";
import { getWeekDateRange, getWeekKey } from "../utils/date";

export const topicStatusLabels: Record<TopicStatus, string> = {
  not_started: "Not Started",
  learning: "Learning",
  practiced: "Practiced",
  done: "Done",
};

export function getTopicStatus(state: StudyState, topicId: string): TopicStatus {
  return state.topicProgress.find((item) => item.topicId === topicId)?.status ?? "not_started";
}

export function getTopicLogs(state: StudyState, topicId: string): DailyLog[] {
  return state.dailyLogs.filter((log) => log.roadmapItemIds?.includes(topicId)).sort((a, b) => b.date.localeCompare(a.date));
}

export function getModuleProgress(state: StudyState, moduleId: string) {
  const module = moduleById.get(moduleId);
  const topics = module?.topicIds ?? [];
  const done = topics.filter((id) => getTopicStatus(state, id) === "done").length;
  const active = topics.filter((id) => getTopicStatus(state, id) !== "not_started").length;
  return { done, active, total: topics.length, percent: topics.length ? Math.round((done / topics.length) * 100) : 0 };
}

export function getPathProgress(state: StudyState, pathId: string) {
  const topicIds = roadmapModules.filter((module) => module.pathId === pathId).flatMap((module) => module.topicIds);
  const done = topicIds.filter((id) => getTopicStatus(state, id) === "done").length;
  return { done, total: topicIds.length, percent: topicIds.length ? Math.round((done / topicIds.length) * 100) : 0 };
}

export function getCurrentTopics(state: StudyState) {
  return state.settings.currentFocusTopicIds.map((id) => topicById.get(id)).filter(Boolean);
}

export function getWeeklyLogs(state: StudyState, week = getWeekKey()): DailyLog[] {
  const { startKey, endKey } = getWeekDateRange(week);
  return state.dailyLogs.filter((log) => log.date >= startKey && log.date <= endKey).sort((a, b) => a.date.localeCompare(b.date));
}

export function getWeeklyV3Stats(state: StudyState, week = getWeekKey()) {
  const logs = getWeeklyLogs(state, week);
  const tagCount = (tag: string) => logs.filter((log) => log.tags.includes(tag)).length;
  const { startKey, endKey } = getWeekDateRange(week);
  return {
    days: new Set(logs.map((log) => log.date)).size,
    bug: tagCount("bug"),
    learning: tagCount("learning"),
    automation: tagCount("automation"),
    deployment: tagCount("deployment"),
    topicsDone: state.topicProgress.filter((item) => item.status === "done" && item.updatedAt.slice(0, 10) >= startKey && item.updatedAt.slice(0, 10) <= endKey).length,
  };
}

export function getNextRoadmapTopic(state: StudyState) {
  const focused = getCurrentTopics(state);
  return focused.find((topic) => topic && getTopicStatus(state, topic.id) !== "done") ?? roadmapTopics.find((topic) => getTopicStatus(state, topic.id) !== "done");
}

export function dailyLogSearchText(log: DailyLog): string {
  const topics = (log.roadmapItemIds ?? []).map((id) => topicById.get(id)?.title ?? "").join(" ");
  const relatedProjects = (log.projectIds ?? []).map((id) => projects.find((project) => project.id === id)?.name ?? id).join(" ");
  return [log.work, log.learned, log.problems, log.next, log.tags.join(" "), topics, relatedProjects].filter(Boolean).join(" ").toLocaleLowerCase();
}
