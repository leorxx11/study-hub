import { ArrowRight, Bot, Bug, CalendarDays, GraduationCap, Pencil, Rocket } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DailyLogEditor, type TemplateRequest } from "../components/daily/DailyLogEditor";
import { Modal } from "../components/ui/Modal";
import { dailyTemplates, type DailyTemplateKey } from "../data/dailyTemplates";
import { useStudyState } from "../hooks/useStudyState";
import { getCurrentTopics, getNextRoadmapTopic, getTopicStatus, topicStatusLabels } from "../services/v3Selectors";
import type { DailyLog } from "../types";
import { formatLongDay, getInternshipWeek, getLocalDateKey } from "../utils/date";

const templateIcons = { bug: Bug, learning: GraduationCap, automation: Bot, deployment: Rocket };

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了";
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function summarize(log: DailyLog) {
  return log.work.replace(/^\[[^\]]+\]\s*/gm, "").replace(/[#*_`>-]/g, "").replace(/\s+/g, " ").trim();
}

export function Overview() {
  const { state } = useStudyState();
  const [searchParams, setSearchParams] = useSearchParams();
  const today = getLocalDateKey();
  const todayLog = state.dailyLogs.find((log) => log.date === today);
  const [templateRequest, setTemplateRequest] = useState<TemplateRequest>();
  const templateNonce = useRef(0);
  const [editingLog, setEditingLog] = useState<DailyLog>();
  const currentTopics = getCurrentTopics(state);
  const nextTopic = getNextRoadmapTopic(state);
  const recentLogs = [...state.dailyLogs].filter((log) => log.date !== today).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const applyTemplate = (key: DailyTemplateKey) => {
    templateNonce.current += 1;
    setTemplateRequest({ key, nonce: templateNonce.current });
    requestAnimationFrame(() => document.querySelector<HTMLTextAreaElement>(".daily-primary-field textarea")?.focus());
  };
  useEffect(() => {
    const id = searchParams.get("log");
    if (!id) return;
    const match = state.dailyLogs.find((log) => log.id === id);
    if (match) setEditingLog(match);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, state.dailyLogs]);

  return (
    <>
      <header className="today-hero"><p className="today-date">{formatLongDay()}</p><h1>{getGreeting()}，{state.settings.displayName}。</h1><div><span>实习第 {getInternshipWeek(state.settings.internshipStartDate)} 周</span><span>当前学习：{currentTopics.map((topic) => topic?.title).filter(Boolean).slice(0, 2).join(" / ") || state.settings.weeklyFocus}</span></div></header>

      <section className="today-editor-card"><div className="v3-section-heading"><div><span>TODAY</span><h2>今天做了什么？</h2></div><small>{todayLog ? "已保存，可继续补充" : "30 秒也可以完成"}</small></div><DailyLogEditor log={todayLog} date={today} templateRequest={templateRequest} /></section>

      <section className="quick-template-section"><div className="v3-section-heading"><div><span>QUICK TEMPLATE</span><h2>需要一点提示？</h2></div><small>模板只帮助你写，不增加额外流程</small></div><div className="v3-template-grid">{(Object.keys(dailyTemplates) as DailyTemplateKey[]).map((key) => { const Icon = templateIcons[key]; return <button type="button" onClick={() => applyTemplate(key)} key={key}><span><Icon size={17} /></span><strong>{dailyTemplates[key].label}</strong><ArrowRight size={14} /></button>; })}</div></section>

      <div className="today-lower-grid">
        <section className="current-learning-card"><div className="v3-section-heading"><div><span>CURRENT LEARNING</span><h2>现在只看这几件事</h2></div><Link className="text-link" to="/roadmap">Roadmap <ArrowRight size={13} /></Link></div><div className="focus-topic-list">{currentTopics.map((topic) => topic ? <Link to={`/roadmap?topic=${topic.id}`} key={topic.id}><span className={`topic-status-dot ${getTopicStatus(state, topic.id)}`} /><div><strong>{topic.title}</strong><small>{topicStatusLabels[getTopicStatus(state, topic.id)]}</small></div><ArrowRight size={14} /></Link> : null)}</div>{nextTopic ? <div className="next-topic-callout"><span>下一步</span><strong>{nextTopic.title}</strong><Link to={`/roadmap?topic=${nextTopic.id}`}>继续学习 <ArrowRight size={13} /></Link></div> : null}</section>
        <section className="recent-days-card"><div className="v3-section-heading"><div><span>RECENT DAYS</span><h2>最近留下的记录</h2></div><CalendarDays size={17} /></div>{recentLogs.length ? <div className="recent-log-list">{recentLogs.map((log) => <button type="button" onClick={() => setEditingLog(log)} key={log.id}><time>{log.date.slice(5).replace("-", ".")}</time><div><strong>{summarize(log)}</strong><span>{log.tags.map((tag) => `#${tag}`).join(" ")}</span></div><Pencil size={13} /></button>)}</div> : <div className="compact-empty">保存几天后，这里会自然形成你的成长轨迹。</div>}</section>
      </div>

      <Modal open={Boolean(editingLog)} onClose={() => setEditingLog(undefined)} title={`${editingLog?.date ?? ""} Daily Log`} eyebrow="EDIT PAST DAY" wide><DailyLogEditor log={editingLog} date={editingLog?.date} onDeleted={() => setEditingLog(undefined)} /></Modal>
    </>
  );
}
