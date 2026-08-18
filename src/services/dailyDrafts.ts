export const DAILY_LOG_DRAFT_PREFIX = "study-hub:draft:daily:";

export interface DailyLogAutosaveDraft {
  version: 1;
  date: string;
  work: string;
  learned: string;
  problems: string;
  next: string;
  tags: string[];
  roadmapItemIds: string[];
  projectIds: string[];
  sourceUpdatedAt?: string;
  savedAt: string;
}

function storage(): Storage | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage;
}

function keyFor(date: string): string {
  return `${DAILY_LOG_DRAFT_PREFIX}${date}`;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isDraft(value: unknown, date: string): value is DailyLogAutosaveDraft {
  if (typeof value !== "object" || value === null) return false;
  const draft = value as Record<string, unknown>;
  return draft.version === 1
    && draft.date === date
    && typeof draft.work === "string"
    && typeof draft.learned === "string"
    && typeof draft.problems === "string"
    && typeof draft.next === "string"
    && isStringArray(draft.tags)
    && isStringArray(draft.roadmapItemIds)
    && isStringArray(draft.projectIds)
    && (draft.sourceUpdatedAt === undefined || typeof draft.sourceUpdatedAt === "string")
    && typeof draft.savedAt === "string"
    && !Number.isNaN(Date.parse(draft.savedAt));
}

export function readDailyLogDraft(date: string): DailyLogAutosaveDraft | undefined {
  const target = storage();
  if (!target) return undefined;
  const key = keyFor(date);
  const raw = target.getItem(key);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isDraft(parsed, date)) return parsed;
  } catch {
    // Invalid drafts are discarded below without affecting saved Study Hub data.
  }
  target.removeItem(key);
  return undefined;
}

export function writeDailyLogDraft(draft: DailyLogAutosaveDraft): boolean {
  const target = storage();
  if (!target) return false;
  try {
    target.setItem(keyFor(draft.date), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearDailyLogDraft(date: string): void {
  storage()?.removeItem(keyFor(date));
}

export function clearAllDailyLogDrafts(): void {
  const target = storage();
  if (!target) return;
  for (let index = target.length - 1; index >= 0; index -= 1) {
    const key = target.key(index);
    if (key?.startsWith(DAILY_LOG_DRAFT_PREFIX)) target.removeItem(key);
  }
}
