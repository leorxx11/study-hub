import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import { defaultProjectMilestones } from "../src/data/projectMilestones";
import { defaultFocusTopicIds, roadmapModules, roadmapPaths, roadmapTopics, topicById } from "../src/data/roadmapV3";
import { buildAIExport } from "../src/services/aiExport";
import { PRE_IMPORT_SNAPSHOT_KEY, STORAGE_V1_KEY, STORAGE_V2_KEY, STORAGE_V3_KEY } from "../src/services/storage/constants";
import { createDefaultStudyState, normalizeV3State } from "../src/services/storage/migrations";
import { dailyLogSearchText, getModuleProgress, getWeeklyV3Stats } from "../src/services/v3Selectors";
import type { StudyState, V2StudyState } from "../src/types";
import { getWeekKey } from "../src/utils/date";

class IsolatedStorage implements Storage {
  #data = new Map<string, string>();
  get length() { return this.#data.size; }
  clear() { this.#data.clear(); }
  getItem(key: string) { return this.#data.get(key) ?? null; }
  key(index: number) { return [...this.#data.keys()][index] ?? null; }
  removeItem(key: string) { this.#data.delete(key); }
  setItem(key: string, value: string) { this.#data.set(key, String(value)); }
}

const localStorage = new IsolatedStorage();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage,
    setTimeout,
    clearTimeout,
    requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(callback, 0),
    cancelAnimationFrame: clearTimeout,
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  },
});

const createdAt = "2026-08-17T12:00:00.000Z";
const updatedAt = "2026-08-17T13:00:00.000Z";
const completedAt = "2026-08-17T14:00:00.000Z";
const projectMilestones = defaultProjectMilestones.map((milestone, index) => index === 0 ? { ...milestone, completed: true, completedAt } : { ...milestone });
const v2: V2StudyState = {
  version: 2,
  storageVersion: 2,
  checklist: { "focus-devtools": true },
  completedStages: ["stage-0"],
  skillLevels: { http: 8, python: 6 },
  currentStageId: "stage-2",
  theme: "dark",
  settings: { displayName: "Migration Leo", weeklyFocus: "SSE / pytest" },
  tasks: [{ id: "legacy-task", title: "Legacy task must remain", type: "learning", status: "done", createdAt, completedAt }],
  notes: [{ id: "legacy-note", type: "learning", title: "HTTP 状态码实习记录", content: "完整正文：401 与 403 的区别。", skillIds: ["http"], projectId: "api-automation-framework", stageId: "stage-1", createdAt, updatedAt }],
  practiceRecords: [{ id: "legacy-practice", type: "automation", title: "requests 自动化练习", checklist: [{ id: "request", label: "复现登录接口", completed: true }], notes: "保留练习备注和检查项。", skillIds: ["http", "python"], stageId: "stage-2", createdAt, completedAt }],
  activities: [{ id: "legacy-activity", type: "note_created", title: "旧活动", createdAt }],
  evidence: [{ id: "legacy-evidence", skillId: "http", title: "旧 Evidence 必须保留", sourceType: "note", sourceId: "legacy-note", createdAt }],
  projectMilestones,
  weeklyReviews: [{ id: "legacy-review", week: "2026-W34", learned: "学会读状态码", work: "完成接口联调", mostValuableProblem: "流式请求中断", automated: "写了 requests 脚本", unclear: "SSE 重连", nextWeekGoals: "1. pytest\n2. SSE\n3. CI", resumeValue: "独立定位接口异常", createdAt, updatedAt }],
  legacyData: { unknownV2Field: { mustSurvive: true } },
};

localStorage.setItem(STORAGE_V2_KEY, JSON.stringify(v2));
const { studyRepository } = await import("../src/services/storage/repository");
const migrated = studyRepository.load();

assert.equal(migrated.version, 3);
assert.equal(migrated.storageVersion, 3);
assert.equal(migrated.settings.displayName, "Migration Leo");
assert.equal(migrated.settings.weeklyFocus, "SSE / pytest");
assert.equal(migrated.settings.currentFocusTopicIds.length, 3);
assert.equal(migrated.theme, "dark");
assert.ok(localStorage.getItem(STORAGE_V2_KEY), "automatic migration must leave the V2 source untouched");
assert.ok(localStorage.getItem(STORAGE_V3_KEY), "automatic migration must persist a V3 copy");

assert.equal(migrated.dailyLogs.length, 1, "V2 notes and completed practice on one day should merge into one Daily Log");
const migratedLog = migrated.dailyLogs[0];
for (const fragment of ["HTTP 状态码实习记录", "完整正文：401 与 403 的区别。", "requests 自动化练习", "复现登录接口", "保留练习备注和检查项。"])
  assert.ok(migratedLog.work.includes(fragment), `Daily Log must preserve: ${fragment}`);
assert.ok(migratedLog.tags.includes("learning"));
assert.ok(migratedLog.tags.includes("automation"));
assert.ok(migratedLog.projectIds?.includes("api-automation-framework"));
assert.ok(migratedLog.roadmapItemIds?.length, "legacy skill relations should map to V3 Topics");
assert.equal(migrated.tasks[0].title, "Legacy task must remain");
assert.equal(migrated.evidence[0].title, "旧 Evidence 必须保留");
assert.equal(migrated.projectMilestones[0].completed, true);
assert.deepEqual(migrated.legacyData?.unknownV2Field, { mustSurvive: true });

const migratedReview = migrated.weeklyReviewsV3[0];
assert.ok(migratedReview.mainWork.includes("完成接口联调"));
assert.ok(migratedReview.mainWork.includes("独立定位接口异常"));
assert.ok(migratedReview.learned.includes("学会读状态码"));
assert.ok(migratedReview.repetitiveWork.includes("requests 脚本"));
assert.ok(migratedReview.deepDive.includes("流式请求中断"));
assert.ok(migratedReview.deepDive.includes("SSE 重连"));
assert.ok(migratedReview.nextWeekTop3.includes("pytest"));

assert.equal(roadmapPaths.length, 6);
assert.ok(roadmapModules.length >= 15);
assert.ok(roadmapTopics.length >= 90);
assert.equal(new Set(roadmapTopics.map((topic) => topic.id)).size, roadmapTopics.length);
for (const topic of roadmapTopics) {
  assert.ok(topic.estimatedMinutes);
  assert.ok(topic.why);
  assert.ok(topic.understand.length >= 3);
  assert.ok(topic.doneCriteria.length >= 3);
  assert.ok(topic.practiceSuggestion);
  assert.ok(roadmapModules.find((module) => module.id === topic.moduleId)?.topicIds.includes(topic.id));
  if (topic.nextTopicId) assert.equal(topicById.get(topic.nextTopicId)?.pathId, topic.pathId);
}
assert.equal(defaultFocusTopicIds.length, 3);
assert.ok(defaultFocusTopicIds.every((id) => topicById.has(id)));
assert.equal(migrated.topicProgress.find((item) => item.topicId === "http-status-code")?.status, "done");

const week = getWeekKey(new Date(createdAt));
const stats = getWeeklyV3Stats(migrated, week);
assert.equal(stats.days, 1);
assert.equal(stats.learning, 1);
assert.equal(stats.automation, 1);
const moduleStats = getModuleProgress(migrated, "http-basics");
assert.ok(moduleStats.done > 0);
assert.ok(dailyLogSearchText(migratedLog).includes("api automation framework"));

const aiExport = buildAIExport(migrated, "this_month").markdown;
for (const heading of ["## 时间范围", "## 我的背景", "## 当前学习路线", "## 每日工作记录", "## 本周遇到的问题", "## 本周学习", "## 项目进展", "## Weekly Review", "## 请帮助我分析"])
  assert.ok(aiExport.includes(heading), `AI Markdown must include ${heading}`);
for (const question of ["总结这一阶段真正的成长", "判断是否存在低价值重复劳动", "提取值得深入学习的技术点", "调整下一阶段学习计划", "找出可以形成项目的机会", "提取未来可以写入简历的素材"])
  assert.ok(aiExport.includes(question), `AI Markdown must include analysis prompt: ${question}`);

const saved: StudyState = { ...migrated, settings: { ...migrated.settings, displayName: "Persistence Round Trip" } };
studyRepository.save(saved);
assert.equal(studyRepository.load().settings.displayName, "Persistence Round Trip");

const importedSource = createDefaultStudyState();
importedSource.settings.displayName = "Imported V3";
const backup = new File([JSON.stringify({ app: "study-hub", storageVersion: 3, exportedAt: updatedAt, data: importedSource })], "backup.json", { type: "application/json" });
const imported = await studyRepository.importBackup(backup, saved);
assert.equal(imported.settings.displayName, "Imported V3");
assert.ok(localStorage.getItem(PRE_IMPORT_SNAPSHOT_KEY), "import must keep a pre-import safety snapshot");

const normalized = normalizeV3State({ ...imported, settings: { ...imported.settings, currentFocusTopicIds: ["unknown-topic"] } });
assert.deepEqual(normalized.settings.currentFocusTopicIds, defaultFocusTopicIds);

localStorage.clear();
localStorage.setItem(STORAGE_V3_KEY, JSON.stringify(migrated));
for (const path of ["/", "/roadmap", "/weekly", "/projects", "/settings"]) {
  const html = renderToString(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
  assert.ok(html.length > 900, `${path} must render a complete V3 page`);
}

const appSource = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
for (const [legacyPath, target] of [["skills", "/roadmap"], ["practice", "/"], ["notes", "/"], ["progress", "/weekly"]]) {
  assert.ok(appSource.includes(`path="${legacyPath}"`));
  assert.ok(appSource.includes(`to="${target}"`));
}
assert.ok(localStorage.getItem(STORAGE_V1_KEY) === null, "verification storage should remain isolated");

console.log("V3 verification passed: migration, preservation, roadmap structure, selectors, AI export, persistence, import safety, routes, and redirects.");
