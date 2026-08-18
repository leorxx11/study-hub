import { ArrowRight, Check, Circle, Clock3, History, LockKeyhole, Play, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ChecklistGroupCard } from "../components/checklist/ChecklistGroupCard";
import { NoteModal } from "../components/notes/NoteModal";
import { PracticeSessionModal } from "../components/practice/PracticeSessionModal";
import { PageHeader } from "../components/ui/PageHeader";
import { noteTemplates } from "../data/noteTemplates";
import { deploymentFlow, practiceGroups, safeWorkLabels } from "../data/practice";
import { useStudyState, type NoteDraft } from "../hooks/useStudyState";
import type { PracticeGroup, PracticeRecord, PracticeRecordType } from "../types";
import { formatDate, getLocalDateKey } from "../utils/date";

const templateRelations: Record<Exclude<PracticeRecordType, "general">, string[]> = {
  bug: ["http", "devtools", "linux"],
  automation: ["http", "python", "pytest"],
  deployment: ["cicd", "docker", "linux"],
};

function toType(groupId: string): Exclude<PracticeRecordType, "general"> {
  return groupId === "automation" ? "automation" : groupId === "deployment" ? "deployment" : "bug";
}

function recordToNote(record: PracticeRecord): Partial<NoteDraft> {
  const noteType = record.type === "general" ? "learning" : record.type;
  const checklist = record.checklist.map((item) => `${item.completed ? "- [x]" : "- [ ]"} ${item.label}`).join("\n");
  return {
    type: noteType,
    title: record.title.replace("Practice", noteType === "bug" ? "Bug Case" : noteType === "automation" ? "Automation Record" : "Deployment Record"),
    content: `${noteTemplates[noteType]}\n## Practice Checklist\n\n${checklist}\n\n## Practice Notes\n\n${record.notes ?? ""}`,
    skillIds: record.skillIds,
    stageId: record.stageId,
  };
}

export function Practice() {
  const { state, startPractice, togglePracticeComplete, deletePractice } = useStudyState();
  const [activeRecordId, setActiveRecordId] = useState<string>();
  const [historyFilter, setHistoryFilter] = useState<PracticeRecordType | "all">("all");
  const [noteDefaults, setNoteDefaults] = useState<Partial<NoteDraft>>();
  const templates = practiceGroups.filter((group) => group.id !== "initiative");
  const initiative = practiceGroups.find((group) => group.id === "initiative")!;
  const activeRecord = state.practiceRecords.find((record) => record.id === activeRecordId);
  const visibleHistory = useMemo(() => [...state.practiceRecords].filter((record) => historyFilter === "all" || record.type === historyFilter).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [historyFilter, state.practiceRecords]);

  const start = (group: PracticeGroup) => {
    const type = toType(group.id);
    const id = startPractice({
      type,
      title: `${group.title.replace("Checklist", "Practice")} · ${getLocalDateKey()}`,
      checklist: group.items.map((item) => ({ ...item, id: `${item.id}-${Date.now()}`, completed: false })),
      skillIds: templateRelations[type],
      stageId: state.currentStageId,
    });
    setActiveRecordId(id);
  };

  const viewHistory = (type: PracticeRecordType) => {
    setHistoryFilter(type);
    requestAnimationFrame(() => document.getElementById("practice-history")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <>
      <PageHeader eyebrow="WORK → GROWTH" title="公司实践" description="把每次真实工作转成独立 Practice Session。这里仅记录抽象方法，不保存公司、项目或用户敏感信息。" />
      <div className="privacy-note"><LockKeyhole size={17} /><div><strong>安全记录原则</strong><p>统一使用抽象名称：{safeWorkLabels.join(" · ")}</p></div></div>
      <section className="deployment-flow-card"><div><span className="detail-kicker">DELIVERY FLOW</span><h2>真实企业交付链路</h2><p>每次补丁和回归都沿这条链路理解上下游。</p></div><div className="deployment-flow">{deploymentFlow.map((step, index) => <div className="flow-step" key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong>{index < deploymentFlow.length - 1 ? <ArrowRight size={14} /> : null}</div>)}</div></section>

      <section className="practice-template-section">
        <div className="section-title-row"><div><p className="page-eyebrow">REPEATABLE SESSIONS</p><h2>Practice Templates</h2></div><p>每次开始都会创建独立记录，不会覆盖上一次勾选。</p></div>
        <div className="practice-template-grid">
          {templates.map((group) => {
            const type = toType(group.id);
            const records = state.practiceRecords.filter((record) => record.type === type);
            const completed = records.filter((record) => record.completedAt);
            const last = [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
            return (
              <article className="practice-template-card" key={group.id}>
                <header><div><span className="detail-kicker">PRACTICE TEMPLATE</span><h2>{group.title.replace("Checklist", "Practice")}</h2></div><strong>{completed.length}<small> sessions</small></strong></header>
                <p>{group.description}</p>
                <div className="last-session"><span>LAST PRACTICE</span>{last ? <><strong>{formatDate(last.createdAt, { year: "numeric", month: "2-digit", day: "2-digit" })}</strong><small>{last.checklist.filter((item) => item.completed).length}/{last.checklist.length} checks · {last.completedAt ? "Completed" : "In progress"}</small></> : <small>还没有记录</small>}</div>
                <div className="template-preview">{group.items.slice(0, 4).map((item) => <span key={item.id}>{last?.checklist.find((entry) => entry.label === item.label)?.completed ? <Check size={12} /> : <Circle size={12} />}{item.label}</span>)}</div>
                <footer><button className="primary-button" type="button" onClick={() => start(group)}><Play size={14} />Start New Practice</button><button className="secondary-button" type="button" onClick={() => viewHistory(type)}><History size={14} />View History</button></footer>
              </article>
            );
          })}
        </div>
      </section>

      <section className="initiative-section"><div className="section-title-row"><div><p className="page-eyebrow">LONG-TERM PRACTICE</p><h2>Initiative Checklist</h2></div><p>长期目标继续保留，勾选状态从 V1 无损延续。</p></div><ChecklistGroupCard group={initiative} /></section>

      <section className="practice-history" id="practice-history">
        <div className="section-title-row"><div><p className="page-eyebrow">SESSION ARCHIVE</p><h2>Practice History</h2></div><div className="mini-filter">{(["all", "bug", "automation", "deployment"] as const).map((item) => <button type="button" className={historyFilter === item ? "active" : ""} onClick={() => setHistoryFilter(item)} key={item}>{item === "all" ? "All" : item}</button>)}</div></div>
        {visibleHistory.length ? <div className="history-list">{visibleHistory.map((record) => <article className="history-row" key={record.id}><button className="history-main" type="button" onClick={() => setActiveRecordId(record.id)}><span className={record.completedAt ? "complete" : "open"}>{record.completedAt ? <Check size={13} /> : <Clock3 size={13} />}</span><div><strong>{record.title}</strong><small>{formatDate(record.createdAt, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })} · {record.checklist.filter((item) => item.completed).length}/{record.checklist.length} checks</small></div></button><div className="row-actions">{record.completedAt ? <button type="button" onClick={() => togglePracticeComplete(record.id)} title="重新打开" aria-label={`重新打开 ${record.title}`}><RotateCcw size={14} /></button> : null}<button type="button" onClick={() => { if (window.confirm(`删除实践「${record.title}」？`)) deletePractice(record.id); }} aria-label={`删除 ${record.title}`}><Trash2 size={14} /></button></div></article>)}</div> : <div className="compact-empty">还没有 Practice Session。选择上方模板开始第一次实践。</div>}
      </section>

      <PracticeSessionModal record={activeRecord} open={Boolean(activeRecordId)} onClose={() => setActiveRecordId(undefined)} onCreateNote={(record) => { setActiveRecordId(undefined); setNoteDefaults(recordToNote(record)); }} />
      <NoteModal open={Boolean(noteDefaults)} defaults={noteDefaults} onClose={() => setNoteDefaults(undefined)} />
    </>
  );
}
