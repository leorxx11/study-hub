import { ArrowRight, BookOpenCheck, Check, Clock3, Crosshair, Lightbulb, ListChecks, Pin, PinOff, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DailyLogEditor } from "../daily/DailyLogEditor";
import { Modal } from "../ui/Modal";
import { moduleById, pathById, topicById } from "../../data/roadmapV3";
import { useStudyState } from "../../hooks/useStudyState";
import { getTopicLogs, getTopicStatus, topicStatusLabels } from "../../services/v3Selectors";
import type { DailyLog, RoadmapTopic, TopicStatus } from "../../types";
import { getLocalDateKey } from "../../utils/date";

const statuses: TopicStatus[] = ["not_started", "learning", "practiced", "done"];

export function TopicDetail({ topic, onSelectTopic }: { topic: RoadmapTopic; onSelectTopic: (id: string) => void }) {
  const { state, setTopicStatus, toggleCurrentTopic } = useStudyState();
  const [editingLog, setEditingLog] = useState<DailyLog>();
  const [creatingLog, setCreatingLog] = useState(false);
  const status = getTopicStatus(state, topic.id);
  const logs = getTopicLogs(state, topic.id);
  const today = getLocalDateKey();
  const todayLog = state.dailyLogs.find((log) => log.date === today);
  const defaultTopicIds = useMemo(() => [topic.id], [topic.id]);
  const focused = state.settings.currentFocusTopicIds.includes(topic.id);
  const nextTopic = topic.nextTopicId ? topicById.get(topic.nextTopicId) : undefined;
  return (
    <aside className="v3-topic-detail">
      <header><div><span>{pathById.get(topic.pathId)?.title} · {moduleById.get(topic.moduleId)?.title}</span><h2>{topic.title}</h2><p><Clock3 size={13} />预计学习：{topic.estimatedMinutes}</p></div><button className={focused ? "secondary-button" : "primary-button"} type="button" disabled={focused && state.settings.currentFocusTopicIds.length === 1} title={focused && state.settings.currentFocusTopicIds.length === 1 ? "至少保留 1 个 Current Topic" : undefined} onClick={() => toggleCurrentTopic(topic.id)}>{focused ? <PinOff size={14} /> : <Pin size={14} />}{focused ? "移出重点" : "设为重点"}</button></header>
      <div className="topic-status-control"><span>学习状态</span><div>{statuses.map((item) => <button type="button" className={`${item}${status === item ? " active" : ""}`} aria-pressed={status === item} onClick={() => setTopicStatus(topic.id, item)} key={item}>{item === "done" ? <Check size={12} /> : null}{topicStatusLabels[item]}</button>)}</div></div>
      {status === "learning" && logs.length >= 3 ? <div className="practice-prompt"><span>已经关联 {logs.length} 条真实记录，要标记为 Practiced 吗？</span><button type="button" onClick={() => setTopicStatus(topic.id, "practiced")}>标记 Practiced</button></div> : null}
      <section className="topic-detail-block"><h3><Lightbulb size={15} />为什么要学？</h3><p>{topic.why}</p></section>
      <section className="topic-detail-block"><h3><BookOpenCheck size={15} />你需要理解</h3><ul>{topic.understand.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="topic-detail-block"><h3><ListChecks size={15} />做到这些就算学会</h3><ul className="criteria-list">{topic.doneCriteria.map((item) => <li key={item}><span><Check size={11} /></span>{item}</li>)}</ul></section>
      <section className="topic-detail-block practice-advice"><h3><Crosshair size={15} />实践建议</h3><p>{topic.practiceSuggestion}</p></section>
      <section className="topic-detail-block"><div className="topic-block-heading"><h3>相关 Daily Logs</h3><div className="topic-block-actions"><span>{logs.length} 条</span><button type="button" onClick={() => setCreatingLog(true)}><Plus size={12} />{todayLog ? "补充今日记录" : "新建关联笔记"}</button></div></div>{logs.length ? <div className="topic-log-list">{logs.slice(0, 8).map((log) => <button type="button" onClick={() => setEditingLog(log)} key={log.id}><time>{log.date}</time><span>{log.work.replace(/\s+/g, " ").slice(0, 92)}</span></button>)}</div> : <p>还没有关联记录。可以直接在这里写一条学习笔记，保存后会出现在 Today 和 Weekly。</p>}</section>
      {nextTopic ? <button className="next-topic-button" type="button" onClick={() => onSelectTopic(nextTopic.id)}><span>下一步</span><strong>{nextTopic.title}</strong><ArrowRight size={15} /></button> : null}
      <Modal open={Boolean(editingLog)} onClose={() => setEditingLog(undefined)} title={`${editingLog?.date ?? ""} Daily Log`} eyebrow="RELATED PRACTICE" wide><DailyLogEditor log={editingLog} date={editingLog?.date} onDeleted={() => setEditingLog(undefined)} /></Modal>
      <Modal open={creatingLog} onClose={() => setCreatingLog(false)} title={`记录「${topic.title}」学习笔记`} eyebrow="NEW RELATED LOG" description={todayLog ? "今天已有 Daily Log，将在原记录中补充内容并关联当前 Topic。" : "保存后会写入今天的 Daily Log，并自动关联当前 Topic。"} wide><DailyLogEditor log={todayLog} date={today} defaultTopicIds={defaultTopicIds} allowDelete={false} onSaved={() => setCreatingLog(false)} /></Modal>
    </aside>
  );
}
