import assert from "node:assert/strict";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import { defaultProjectMilestones } from "../src/data/projectMilestones";
import { getProgressSummary, getProjectProgress, getStageProgress, getWeeklyMetrics } from "../src/services/selectors";
import { createDefaultStudyState } from "../src/services/storage/migrations";
import { PRE_IMPORT_SNAPSHOT_KEY, STORAGE_V1_KEY, STORAGE_V2_KEY } from "../src/services/storage/constants";
import type { StudyState } from "../src/types";

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
Object.defineProperty(globalThis, "window", { value: { localStorage, setTimeout, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) }, configurable: true });

const v1 = {
  version: 1,
  checklist: { "focus-devtools": true, "bug-1": true },
  completedStages: ["stage-0"],
  skillLevels: { http: 7 },
  currentStageId: "stage-1",
  theme: "dark",
  settings: { displayName: "Migration Test", weeklyFocus: "HTTP" },
  unknownV1Field: { mustSurvive: true },
};
localStorage.setItem(STORAGE_V1_KEY, JSON.stringify(v1));

const { studyRepository } = await import("../src/services/storage/repository");
const migrated = studyRepository.load();
assert.equal(migrated.storageVersion, 2);
assert.equal(migrated.settings.displayName, "Migration Test");
assert.equal(migrated.skillLevels.http, 7);
assert.equal(migrated.tasks.find((task) => task.id === "task-focus-devtools")?.status, "done");
assert.deepEqual(migrated.legacyData?.unknownV1Field, { mustSurvive: true });
assert.ok(localStorage.getItem(STORAGE_V1_KEY), "migration must leave the V1 key untouched");
assert.ok(localStorage.getItem(STORAGE_V2_KEY), "migration must persist the V2 state");

const saved: StudyState = { ...migrated, settings: { ...migrated.settings, weeklyFocus: "Persistence round trip" } };
studyRepository.save(saved);
assert.equal(studyRepository.load().settings.weeklyFocus, "Persistence round trip");

const importSource = createDefaultStudyState();
importSource.settings.displayName = "Imported Backup";
const backup = new File([JSON.stringify({ app: "study-hub", storageVersion: 2, exportedAt: new Date().toISOString(), data: importSource })], "backup.json", { type: "application/json" });
const imported = await studyRepository.importBackup(backup, saved);
assert.equal(imported.settings.displayName, "Imported Backup");
assert.ok(localStorage.getItem(PRE_IMPORT_SNAPSHOT_KEY), "import must keep a pre-import safety snapshot");

const state = createDefaultStudyState();
const now = new Date().toISOString();
state.tasks[0] = { ...state.tasks[0], status: "done", completedAt: now };
state.practiceRecords.push({ id: "verify-practice", type: "bug", title: "Verify Bug Practice", checklist: [], skillIds: ["http"], stageId: "stage-1", createdAt: now, completedAt: now });
state.notes.push({ id: "verify-note", type: "bug", title: "Verify Bug Note", content: "Evidence", skillIds: ["http"], stageId: "stage-1", createdAt: now, updatedAt: now });
state.projectMilestones = defaultProjectMilestones.map((item, index) => index === 0 ? { ...item, completed: true, completedAt: now } : { ...item });
const summary = getProgressSummary(state);
const weekly = getWeeklyMetrics(state);
assert.equal(summary.tasksCompleted, 1);
assert.equal(summary.practicesCompleted, 1);
assert.equal(summary.milestonesCompleted, 1);
assert.equal(getStageProgress(state, "stage-1"), 33);
assert.equal(getProjectProgress(state, "api-automation-framework"), 11);
assert.equal(weekly.tasksCompleted, 1);
assert.equal(weekly.practices, 1);
assert.equal(weekly.bugCases, 1);
assert.equal(weekly.notes, 1);
assert.equal(weekly.milestones, 1);

localStorage.removeItem(STORAGE_V1_KEY);
localStorage.setItem(STORAGE_V2_KEY, JSON.stringify(createDefaultStudyState()));
for (const path of ["/", "/roadmap", "/skills", "/practice", "/projects", "/notes", "/progress", "/settings"]) {
  const html = renderToString(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
  assert.ok(html.length > 500, `${path} must render a complete page`);
}

console.log("V2 verification passed: migration, persistence, import safety, progress selectors, and all 8 routes.");
