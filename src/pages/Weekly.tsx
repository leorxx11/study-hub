import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useState } from "react";
import { DailyLogEditor } from "../components/daily/DailyLogEditor";
import { AIExportPanel } from "../components/weekly/AIExportPanel";
import { WeeklyReviewV3Form } from "../components/weekly/WeeklyReviewV3Form";
import { Modal } from "../components/ui/Modal";
import { useStudyState } from "../hooks/useStudyState";
import { getWeeklyLogs, getWeeklyV3Stats } from "../services/v3Selectors";
import type { DailyLog } from "../types";
import { formatDate, getLocalDateKey, getWeekDateRange, getWeekKey, shiftWeekKey } from "../utils/date";

const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function Weekly() {
  const { state } = useStudyState();
  const [week, setWeek] = useState(getWeekKey());
  const [editingLog, setEditingLog] = useState<DailyLog>();
  const bounds = getWeekDateRange(week);
  const logs = getWeeklyLogs(state, week);
  const stats = getWeeklyV3Stats(state, week);
  const dates = Array.from({ length: 7 }, (_, index) => { const date = new Date(bounds.start); date.setDate(date.getDate() + index); return getLocalDateKey(date); });
  const cards = [["本周记录", stats.days, "天"], ["Bug", stats.bug, "次"], ["学习", stats.learning, "次"], ["自动化", stats.automation, "次"], ["部署", stats.deployment, "次"], ["完成 Topic", stats.topicsDone, "个"]] as const;
  return (
    <>
      <header className="weekly-page-header"><div><span>WEEKLY</span><h1>{week.replace("-W", " · Week ")}</h1><p>{formatDate(bounds.start.toISOString(), { month: "short", day: "numeric" })} – {formatDate(bounds.end.toISOString(), { month: "short", day: "numeric", year: "numeric" })}</p></div><div><button className="icon-button" type="button" onClick={() => setWeek((current) => shiftWeekKey(current, -1))} aria-label="上一周"><ChevronLeft size={16} /></button><button className="secondary-button" type="button" onClick={() => setWeek(getWeekKey())} disabled={week === getWeekKey()}>本周</button><button className="icon-button" type="button" onClick={() => setWeek((current) => shiftWeekKey(current, 1))} aria-label="下一周"><ChevronRight size={16} /></button></div></header>
      <section className="weekly-timeline-card"><div className="v3-section-heading"><div><span>DAILY TIMELINE</span><h2>这一周到底做了什么</h2></div><small>{logs.length} records</small></div><div className="weekly-day-list">{dates.map((date, index) => { const dayLogs = logs.filter((log) => log.date === date); return <section className={date === getLocalDateKey() ? "today" : ""} key={date}><header><span>{dayLabels[index]}</span><time>{date.slice(5).replace("-", ".")}</time></header><div>{dayLogs.length ? dayLogs.map((log) => <button type="button" onClick={() => setEditingLog(log)} key={log.id}><strong>{log.work.replace(/\s+/g, " ").slice(0, 180)}</strong><small>{log.tags.map((tag) => `#${tag}`).join(" ")}</small><Pencil size={13} /></button>) : <p>没有记录</p>}</div></section>; })}</div></section>
      <section className="weekly-light-stats">{cards.map(([label, value, unit]) => <article key={label}><span>{label}</span><strong>{value}<small>{unit}</small></strong></article>)}</section>
      <WeeklyReviewV3Form week={week} />
      <AIExportPanel />
      <Modal open={Boolean(editingLog)} onClose={() => setEditingLog(undefined)} title={`${editingLog?.date ?? ""} Daily Log`} eyebrow="WEEKLY TIMELINE" wide><DailyLogEditor log={editingLog} date={editingLog?.date} onDeleted={() => setEditingLog(undefined)} /></Modal>
    </>
  );
}
