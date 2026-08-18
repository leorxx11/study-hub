import type { StudyState, V1StudyState } from "../../types";
import { PRE_IMPORT_SNAPSHOT_KEY, STORAGE_V1_KEY, STORAGE_V2_KEY } from "./constants";
import { createDefaultStudyState, migrateV1ToV2, normalizeV2State } from "./migrations";

interface BackupEnvelope {
  app: "study-hub";
  storageVersion: 2;
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
  if (record.app === "study-hub" && record.data) return normalizeV2State(record.data);
  if (record.storageVersion === 2 || record.version === 2) return normalizeV2State(record);
  if (record.version === 1 || "checklist" in record) return migrateV1ToV2(record as V1StudyState);
  throw new Error("无法识别该 Study Hub 备份版本");
}

class LocalStorageStudyRepository implements StudyRepository {
  load(): StudyState {
    if (typeof window === "undefined") return createDefaultStudyState();
    const v2 = window.localStorage.getItem(STORAGE_V2_KEY);
    if (v2) {
      try {
        return normalizeV2State(JSON.parse(v2) as unknown);
      } catch {
        // Keep the corrupt V2 value untouched and attempt recovery from V1 below.
      }
    }
    try {
      const v1 = window.localStorage.getItem(STORAGE_V1_KEY);
      if (v1) {
        const migrated = migrateV1ToV2(JSON.parse(v1) as V1StudyState);
        window.localStorage.setItem(STORAGE_V2_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch {
      // Corrupt V1 source data remains untouched so it can still be recovered manually.
    }
    return createDefaultStudyState();
  }

  save(state: StudyState): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_V2_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or privacy-mode failures must not break the application UI.
    }
  }

  clearAll(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_V2_KEY);
    window.localStorage.removeItem(STORAGE_V1_KEY);
    window.localStorage.removeItem(PRE_IMPORT_SNAPSHOT_KEY);
  }

  exportBackup(state: StudyState): void {
    const envelope: BackupEnvelope = { app: "study-hub", storageVersion: 2, exportedAt: new Date().toISOString(), data: state };
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `study-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async importBackup(file: File, currentState: StudyState): Promise<StudyState> {
    const text = await file.text();
    const imported = parseBackup(JSON.parse(text) as unknown);
    window.localStorage.setItem(PRE_IMPORT_SNAPSHOT_KEY, JSON.stringify(currentState));
    window.localStorage.setItem(STORAGE_V2_KEY, JSON.stringify(imported));
    return imported;
  }
}

export const studyRepository: StudyRepository = new LocalStorageStudyRepository();
