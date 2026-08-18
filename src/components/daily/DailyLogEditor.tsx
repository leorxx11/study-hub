import { ChevronDown, ChevronUp, Cloud, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { dailyTags, dailyTemplates, type DailyTemplateKey } from "../../data/dailyTemplates";
import { projects } from "../../data/projects";
import { roadmapTopics, topicById } from "../../data/roadmapV3";
import { useStudyState, type DailyLogDraft } from "../../hooks/useStudyState";
import { clearDailyLogDraft, readDailyLogDraft, writeDailyLogDraft, type DailyLogAutosaveDraft } from "../../services/dailyDrafts";
import type { DailyLog } from "../../types";
import { getLocalDateKey } from "../../utils/date";

export interface TemplateRequest { key: DailyTemplateKey; nonce: number }

const EMPTY_IDS: string[] = [];
type DraftStatus = "idle" | "restored" | "saving" | "saved" | "error";
type DraftSnapshot = Omit<DailyLogAutosaveDraft, "savedAt">;

function formatDraftTime(value: string | undefined): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

export function DailyLogEditor({ log, date = getLocalDateKey(), templateRequest, defaultProjectIds = EMPTY_IDS, defaultTopicIds = EMPTY_IDS, allowDelete = true, onSaved, onDeleted }: { log?: DailyLog; date?: string; templateRequest?: TemplateRequest; defaultProjectIds?: string[]; defaultTopicIds?: string[]; allowDelete?: boolean; onSaved?: (id: string) => void; onDeleted?: () => void }) {
  const { saveDailyLog, deleteDailyLog, state } = useStudyState();
  const [work, setWork] = useState("");
  const [learned, setLearned] = useState("");
  const [problems, setProblems] = useState("");
  const [next, setNext] = useState("");
  const [tags, setTags] = useState<string[]>(["work"]);
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [topicQuery, setTopicQuery] = useState("");
  const [draftDirty, setDraftDirty] = useState(false);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const [draftSavedAt, setDraftSavedAt] = useState<string>();
  const draftDirtyRef = useRef(false);
  const latestDraftRef = useRef<DraftSnapshot | undefined>(undefined);

  useEffect(() => {
    const storedDraft = readDailyLogDraft(date);
    const restoredDraft = storedDraft && (!log?.updatedAt || storedDraft.savedAt > log.updatedAt) ? storedDraft : undefined;
    if (storedDraft && !restoredDraft) clearDailyLogDraft(date);
    setWork(restoredDraft?.work ?? log?.work ?? "");
    setLearned(restoredDraft?.learned ?? log?.learned ?? "");
    setProblems(restoredDraft?.problems ?? log?.problems ?? "");
    setNext(restoredDraft?.next ?? log?.next ?? "");
    setTags(restoredDraft ? [...restoredDraft.tags] : [...(log?.tags?.length ? log.tags : ["work"])]);
    setTopicIds([...new Set([...(restoredDraft?.roadmapItemIds ?? log?.roadmapItemIds ?? []), ...defaultTopicIds])]);
    setProjectIds([...new Set([...(restoredDraft?.projectIds ?? log?.projectIds ?? []), ...defaultProjectIds])]);
    setExpanded(Boolean(restoredDraft?.learned || restoredDraft?.problems || restoredDraft?.next || restoredDraft?.roadmapItemIds.length || restoredDraft?.projectIds.length || log?.learned || log?.problems || log?.next || log?.roadmapItemIds?.length || log?.projectIds?.length || defaultTopicIds.length || defaultProjectIds.length));
    setSaved(false);
    draftDirtyRef.current = false;
    setDraftDirty(false);
    setDraftStatus(restoredDraft ? "restored" : "idle");
    setDraftSavedAt(restoredDraft?.savedAt);
  }, [date, defaultProjectIds, defaultTopicIds, log]);

  useEffect(() => {
    if (!templateRequest) return;
    const template = dailyTemplates[templateRequest.key];
    setExpanded(true);
    setTags((current) => [...new Set([...current, template.tag])]);
    if (template.field === "learned") setLearned((current) => current ? `${current}\n\n${template.content}` : template.content);
    else if (template.field === "problems") setProblems((current) => current ? `${current}\n\n${template.content}` : template.content);
    else setWork((current) => current ? `${current}\n\n${template.content}` : template.content);
    draftDirtyRef.current = true;
    setDraftDirty(true);
    setDraftStatus("saving");
  }, [templateRequest]);

  useEffect(() => {
    latestDraftRef.current = { version: 1, date, work, learned, problems, next, tags, roadmapItemIds: topicIds, projectIds, sourceUpdatedAt: log?.updatedAt };
  }, [date, learned, log?.updatedAt, next, problems, projectIds, tags, topicIds, work]);

  useEffect(() => {
    if (!draftDirty) return;
    const timeout = window.setTimeout(() => {
      if (!latestDraftRef.current) return;
      const savedAt = new Date().toISOString();
      const success = writeDailyLogDraft({ ...latestDraftRef.current, savedAt });
      setDraftStatus(success ? "saved" : "error");
      if (success) setDraftSavedAt(savedAt);
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [date, draftDirty, learned, log?.updatedAt, next, problems, projectIds, tags, topicIds, work]);

  useEffect(() => {
    const flushDraft = () => {
      if (!draftDirtyRef.current || !latestDraftRef.current) return;
      writeDailyLogDraft({ ...latestDraftRef.current, savedAt: new Date().toISOString() });
    };
    window.addEventListener("beforeunload", flushDraft);
    return () => {
      window.removeEventListener("beforeunload", flushDraft);
      flushDraft();
    };
  }, [date]);

  const availableTopics = useMemo(() => {
    const query = topicQuery.trim().toLocaleLowerCase();
    const focused = state.settings.currentFocusTopicIds;
    return roadmapTopics.filter((topic) => !topicIds.includes(topic.id) && (!query || topic.title.toLocaleLowerCase().includes(query))).sort((a, b) => Number(focused.includes(b.id)) - Number(focused.includes(a.id))).slice(0, 12);
  }, [state.settings.currentFocusTopicIds, topicIds, topicQuery]);

  const touchDraft = () => {
    draftDirtyRef.current = true;
    setDraftDirty(true);
    setDraftStatus("saving");
  };
  const toggle = (items: string[], id: string, setter: (items: string[]) => void) => {
    setter(items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
    touchDraft();
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!work.trim()) return;
    const draft: DailyLogDraft = { date, work: work.trim(), learned: learned.trim() || undefined, problems: problems.trim() || undefined, next: next.trim() || undefined, tags, roadmapItemIds: topicIds, projectIds };
    const id = saveDailyLog(draft, log?.id);
    draftDirtyRef.current = false;
    setDraftDirty(false);
    clearDailyLogDraft(date);
    setDraftStatus("idle");
    setDraftSavedAt(undefined);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
    onSaved?.(id);
  };

  const remove = () => {
    if (!log || !window.confirm(`删除 ${log.date} 的 Daily Log？`)) return;
    draftDirtyRef.current = false;
    setDraftDirty(false);
    clearDailyLogDraft(date);
    deleteDailyLog(log.id);
    onDeleted?.();
  };

  return (
    <form className="daily-editor" onSubmit={submit}>
      <label className="daily-primary-field"><span>今天主要做了什么？</span><textarea rows={8} value={work} onChange={(event) => { setWork(event.target.value); touchDraft(); }} placeholder="不用整理格式。写下今天真实做过的工作、学习和遇到的事情……" required /></label>
      <div className="daily-tags"><span>Tags</span><div>{dailyTags.map((tag) => <button type="button" className={tags.includes(tag.id) ? "active" : ""} aria-pressed={tags.includes(tag.id)} onClick={() => toggle(tags, tag.id, setTags)} key={tag.id}>{tag.label}</button>)}</div></div>
      <button className="daily-expand" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}{expanded ? "收起详细记录" : "+ 展开更多"}</button>
      {expanded ? (
        <div className="daily-more-fields">
          <label><span>今天学到了什么？</span><textarea rows={5} value={learned} onChange={(event) => { setLearned(event.target.value); touchDraft(); }} placeholder="可选：新的理解、概念或纠正的误区" /></label>
          <label><span>遇到了什么问题？</span><textarea rows={5} value={problems} onChange={(event) => { setProblems(event.target.value); touchDraft(); }} placeholder="可选：现象、检查过程、结果" /></label>
          <label><span>有什么想之后继续研究？</span><textarea rows={4} value={next} onChange={(event) => { setNext(event.target.value); touchDraft(); }} placeholder="可选：留下一个明确的后续问题" /></label>
          <fieldset className="daily-relations"><legend>关联学习内容</legend><input type="search" value={topicQuery} onChange={(event) => setTopicQuery(event.target.value)} placeholder="搜索 Topic，例如 SSE、pytest、CI" /><div className="selected-relations">{topicIds.map((id) => <button type="button" onClick={() => { setTopicIds((current) => current.filter((item) => item !== id)); touchDraft(); }} key={id}>{topicById.get(id)?.title ?? id}<span>×</span></button>)}</div>{topicQuery || !topicIds.length ? <div className="relation-suggestions">{availableTopics.map((topic) => <button type="button" onClick={() => { setTopicIds((current) => [...current, topic.id]); setTopicQuery(""); touchDraft(); }} key={topic.id}>+ {topic.title}</button>)}</div> : null}</fieldset>
          <fieldset className="daily-relations"><legend>关联项目</legend><div className="choice-chips">{projects.map((project) => <button type="button" className={projectIds.includes(project.id) ? "active" : ""} aria-pressed={projectIds.includes(project.id)} onClick={() => toggle(projectIds, project.id, setProjectIds)} key={project.id}>{project.name}</button>)}</div></fieldset>
        </div>
      ) : null}
      <div className="daily-editor-actions"><div className="daily-editor-meta">{log && allowDelete ? <button className="danger-button" type="button" onClick={remove}><Trash2 size={14} />删除</button> : null}{draftStatus !== "idle" ? <span className={`daily-draft-status ${draftStatus}`} role="status" aria-live="polite"><Cloud size={13} />{draftStatus === "restored" ? "已恢复本地草稿" : draftStatus === "saving" ? "正在保存草稿…" : draftStatus === "saved" ? `草稿已自动保存${draftSavedAt ? ` · ${formatDraftTime(draftSavedAt)}` : ""}` : "草稿保存失败"}</span> : null}</div><button className="primary-button daily-save" type="submit" disabled={!work.trim()}><Save size={15} />{saved ? "已保存" : "保存今天"}</button></div>
    </form>
  );
}
