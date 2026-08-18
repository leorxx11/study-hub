import { projects } from "../data/projects";
import { roadmapTopics, topicById } from "../data/roadmapV3";
import type { AIExportRange, StudyState } from "../types";
import { getLocalDateKey, getWeekDateRange } from "../utils/date";
import { getProjectProgress } from "./selectors";
import { getTopicStatus } from "./v3Selectors";

export interface AIExportResult { markdown: string; startKey: string; endKey: string; label: string }

function rangeFor(state: StudyState, range: AIExportRange) {
  const today = new Date();
  const todayKey = getLocalDateKey(today);
  if (range === "internship") return { startKey: state.settings.internshipStartDate, endKey: todayKey, label: "Internship So Far" };
  if (range === "this_month") return { startKey: `${todayKey.slice(0, 7)}-01`, endKey: todayKey, label: "This Month" };
  const current = getWeekDateRange();
  if (range === "last_2_weeks") {
    const start = new Date(current.start);
    start.setDate(start.getDate() - 7);
    return { startKey: getLocalDateKey(start), endKey: current.endKey, label: "Last 2 Weeks" };
  }
  return { startKey: current.startKey, endKey: current.endKey, label: "This Week" };
}

export function buildAIExport(state: StudyState, range: AIExportRange): AIExportResult {
  const bounds = rangeFor(state, range);
  const logs = state.dailyLogs.filter((log) => log.date >= bounds.startKey && log.date <= bounds.endKey).sort((a, b) => a.date.localeCompare(b.date));
  const focus = state.settings.currentFocusTopicIds.map((id) => topicById.get(id)?.title).filter(Boolean);
  const completed = [...state.topicProgress].filter((item) => item.status === "done").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8).map((item) => topicById.get(item.topicId)?.title).filter(Boolean);
  const reviews = state.weeklyReviewsV3.filter((review) => {
    const week = getWeekDateRange(review.week);
    return week.endKey >= bounds.startKey && week.startKey <= bounds.endKey;
  });
  const logText = logs.length ? logs.map((log) => `### ${log.date}\n\n${log.work}${log.learned ? `\n\n**学到：**\n${log.learned}` : ""}${log.problems ? `\n\n**问题：**\n${log.problems}` : ""}${log.next ? `\n\n**后续：**\n${log.next}` : ""}\n\nTags: ${log.tags.join(", ") || "—"}`).join("\n\n") : "暂无记录。";
  const problems = logs.filter((log) => log.problems).map((log) => `- ${log.date}：${log.problems}`).join("\n") || "- 暂无单独记录";
  const learned = logs.filter((log) => log.learned).map((log) => `- ${log.date}：${log.learned}`).join("\n") || "- 暂无单独记录";
  const projectText = projects.map((project) => {
    const projectLogs = logs.filter((log) => log.projectIds?.includes(project.id));
    return `### ${project.name}\n\n进度：${getProjectProgress(state, project.id)}%\n\n最近记录：${projectLogs.length ? projectLogs.map((log) => log.date).join(", ") : "暂无"}`;
  }).join("\n\n");
  const reviewText = reviews.length ? reviews.map((review) => `### ${review.week}\n\n**主要工作**\n${review.mainWork}\n\n**真正学到**\n${review.learned}\n\n**重复劳动**\n${review.repetitiveWork}\n\n**值得深入**\n${review.deepDive}\n\n**下周 Top 3**\n${review.nextWeekTop3}`).join("\n\n") : "暂无 Weekly Review。";
  const currentTopic = state.settings.currentFocusTopicIds.map((id) => roadmapTopics.find((topic) => topic.id === id)).find((topic) => topic && getTopicStatus(state, topic.id) !== "done");
  const markdown = `# Study Hub Context Export\n\n## 时间范围\n\n${bounds.startKey} ~ ${bounds.endKey}\n\n## 我的背景\n\n目标：\n服务端测试开发 / SDET\n\n副线：\nJava Backend\n\n当前实习：\n智能产品质量相关工作\n\n## 当前学习路线\n\n当前重点：\n${focus.map((item) => `- ${item}`).join("\n") || "- 暂未设置"}\n\n当前 Topic：\n${currentTopic?.title ?? "暂未设置"}\n\n最近完成：\n${completed.map((item) => `- ${item}`).join("\n") || "- 暂无"}\n\n## 每日工作记录\n\n${logText}\n\n## 本周遇到的问题\n\n${problems}\n\n## 本周学习\n\n${learned}\n\n## 项目进展\n\n${projectText}\n\n## Weekly Review\n\n${reviewText}\n\n## 请帮助我分析\n\n1. 总结这一阶段真正的成长\n2. 判断是否存在低价值重复劳动\n3. 提取值得深入学习的技术点\n4. 调整下一阶段学习计划\n5. 找出可以形成项目的机会\n6. 提取未来可以写入简历的素材\n`;
  return { markdown, ...bounds };
}
