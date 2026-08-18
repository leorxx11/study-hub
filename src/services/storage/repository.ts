import type { StudyState, V1StudyState } from "../../types";
import { clearAllDailyLogDrafts } from "../dailyDrafts";
import { PRE_IMPORT_SNAPSHOT_KEY, STORAGE_V1_KEY, STORAGE_V2_KEY, STORAGE_V3_KEY } from "./constants";
import { createDefaultStudyState, migrateV1ToV2, migrateV2ToV3, normalizeV3State } from "./migrations";

interface BackupEnvelope {
  app: "study-hub";
  storageVersion: 3;
  exportedAt: string;
  data: StudyState;
}

export interface StudyRepository {
  load(): StudyState;
  save(state: StudyState): void;
  clearAll(): void;
  exportBackup(state: StudyState): void;
  importBackup(file: File, currentState: StudyState): Promise<StudyState>;
}

function parseBackup(value: unknown): StudyState {
  if (typeof value !== "object" || value === null) throw new Error("备份文件格式无效");
  const record = value as Record<string, unknown>;
  if (record.app === "study-hub" && record.data) return parseBackup(record.data);
  if (record.storageVersion === 3 || record.version === 3) return normalizeV3State(record);
  if (record.storageVersion === 2 || record.version === 2) return migrateV2ToV3(record);
  if (record.version === 1 || "checklist" in record) return migrateV2ToV3(migrateV1ToV2(record as V1StudyState));
  throw new Error("无法识别该 Study Hub 备份版本");
}

class LocalStorageStudyRepository implements StudyRepository {
  load(): StudyState {
    if (typeof window === "undefined") return createDefaultStudyState();
    for (const [key, migrate] of [
      [STORAGE_V3_KEY, (value: unknown) => normalizeV3State(value)],
      [STORAGE_V2_KEY, (value: unknown) => migrateV2ToV3(value)],
      [STORAGE_V1_KEY, (value: unknown) => migrateV2ToV3(migrateV1ToV2(value as V1StudyState))],
    ] as const) {
      const stored = window.localStorage.getItem(key);
      if (!stored) continue;
      try {
        const state = migrate(JSON.parse(stored) as unknown);
        if (key !== STORAGE_V3_KEY) window.localStorage.setItem(STORAGE_V3_KEY, JSON.stringify(state));
        return state;
      } catch {
        // Keep each corrupt legacy source untouched and continue to the next recoverable version.
      }
    }
    return createDefaultStudyState();
  }

  save(state: StudyState): void {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(STORAGE_V3_KEY, JSON.stringify(state)); } catch { /* Storage failures must not break the UI. */ }
  }

  clearAll(): void {
    if (typeof window === "undefined") return;
    [STORAGE_V3_KEY, STORAGE_V2_KEY, STORAGE_V1_KEY, PRE_IMPORT_SNAPSHOT_KEY].forEach((key) => window.localStorage.removeItem(key));
    clearAllDailyLogDrafts();
  }

  exportBackup(state: StudyState): void {
    const envelope: BackupEnvelope = { app: "study-hub", storageVersion: 3, exportedAt: new Date().toISOString(), data: state };
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `study-hub-v3-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async importBackup(file: File, currentState: StudyState): Promise<StudyState> {
    const imported = parseBackup(JSON.parse(await file.text()) as unknown);
    window.localStorage.setItem(PRE_IMPORT_SNAPSHOT_KEY, JSON.stringify(currentState));
    window.localStorage.setItem(STORAGE_V3_KEY, JSON.stringify(imported));
    clearAllDailyLogDrafts();
    return imported;
  }
}

export const studyRepository: StudyRepository = new LocalStorageStudyRepository();
