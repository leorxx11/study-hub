import { ArrowRight, Bot, Bug, Code2, GitBranch, GraduationCap, Plus, Rocket, Server, Sparkles, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ActivityFeed } from "../components/activity/ActivityFeed";
import { NoteModal } from "../components/notes/NoteModal";
import { TaskList } from "../components/task/TaskList";
import { TaskModal } from "../components/task/TaskModal";
import { ProgressBar } from "../components/ui/ProgressBar";
import { stages } from "../data/stages";
import { useStudyState, type NoteDraft } from "../hooks/useStudyState";
import { getRecentActivities } from "../services/selectors";
import type { NoteType, Task } from "../types";
import { getLocalDateKey, getWeekKey } from "../utils/date";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const quickRecords: { type: NoteType; label: string; icon: typeof Bug }[] = [
  { type: "learning", label: "Learning", icon: GraduationCap },
  { type: "bug", label: "Bug", icon: Bug },
  { type: "automation", label: "Automation", icon: Bot },
  { type: "deployment", label: "Deployment", icon: Rocket },
];

export function Overview() {
  const { state, progress, weeklyMetrics } = useStudyState();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [noteDefaults, setNoteDefaults] = useState<Partial<NoteDraft> | undefined>();
  const currentStage = stages.find((stage) => stage.id === state.currentStageId) ?? stages[0];
  const todayKey = getLocalDateKey();
  const todayTasks = useMemo(() => state.tasks.filter((task) => task.date === todayKey || (task.status !== "done" && Boolean(task.date) && task.date! < todayKey)).sort((a, b) => Number(a.status === "done") - Number(b.status === "done")), [state.tasks, todayKey]);
  const todayDone = todayTasks.filter((task) => task.status === "done").length;
  const recentActivities = getRecentActivities(state, 10);
  const weekLabel = getWeekKey().replace("-W", " · Week ");

  const openNewTask = () => { setEditingTask(undefined); setTaskModalOpen(true); };
  const openNote = (type: NoteType) => setNoteDefaults({ type, stageId: currentStage.id, skillIds: [] });

  return (
    <>
      <header className="overview-hero">
        <div>
          <p className="page-eyebrow"><span className="status-dot" /> STAGE 0{currentStage.order} · IN PROGRESS</p>
          <h1>{getGreeting()}, {state.settings.displayName}.</h1>
          <p>从测试执行到测试开发，从自动化到工程能力。</p>
        </div>
        <div className="date-pill">{weekLabel}</div>
      </header>

      <section className="daily-command-grid">
        <article className="today-panel">
          <header className="panel-header-row">
            <div><span className="detail-kicker">TODAY</span><h2>今天要推进什么</h2><p>{todayDone} / {todayTasks.length} 项已完成</p></div>
            <button className="primary-button" type="button" onClick={openNewTask}><Plus size={15} />Add Task</button>
          </header>
          <TaskList tasks={todayTasks} onEdit={(task) => { setEditingTask(task); setTaskModalOpen(true); }} emptyText="今天还没有任务，先定义一个最小行动。" />
        </article>

        <aside className="quick-record-panel">
          <div><span className="detail-kicker">QUICK RECORD</span><h2>把经验留下来</h2><p>从真实工作与学习中形成可追溯证据。</p></div>
          <div className="quick-record-grid">
            {quickRecords.map((item) => { const Icon = item.icon; return <button type="button" onClick={() => openNote(item.type)} key={item.type}><span><Icon size={17} /></span><strong>{item.label}</strong><Plus size={13} /></button>; })}
          </div>
        </aside>
      </section>

      <section className="recent-activity-card">
        <header className="panel-header-row"><div><span className="detail-kicker">RECENT ACTIVITY</span><h2>最近发生的成长</h2></div><Link className="text-link" to="/progress">View all <ArrowRight size={14} /></Link></header>
        <ActivityFeed activities={recentActivities} />
      </section>

      <section className="metric-grid overview-metrics" aria-label="学习概览">
        <article className="metric-card"><span>当前阶段</span><strong>阶段 {currentStage.order} · {currentStage.theme}</strong><small>{currentStage.title}</small></article>
        <article className="metric-card"><span>真实进度</span><strong className="metric-value">{progress.overall}%</strong><ProgressBar value={progress.overall} label="总体学习进度" /></article>
        <article className="metric-card"><span>本周行动</span><strong>{state.settings.weeklyFocus}</strong><small>{weeklyMetrics.tasksCompleted} Tasks · {weeklyMetrics.practices} Practices</small></article>
        <article className="metric-card"><span>本周沉淀</span><strong>{weeklyMetrics.notes} Notes</strong><small>{weeklyMetrics.bugCases} Bug Cases · {weeklyMetrics.milestones} Milestones</small></article>
      </section>

      <div className="overview-grid overview-context-grid">
        <section className="focus-panel">
          <div className="section-heading"><div className="icon-box"><Target size={18} /></div><div><span>MAIN OBJECTIVE</span><h2>服务端测试开发 / SDET</h2></div></div>
          <p className="panel-copy">以测试为入口，向代码、自动化、问题定位和后端工程能力纵深发展。</p>
          <div className="capability-list">{["能写代码", "能做自动化", "能定位问题", "懂 CI/CD", "懂后端"].map((item) => <span key={item}><Sparkles size={14} />{item}</span>)}</div>
          <div className="direction-grid"><div><Code2 size={15} /><small>主线</small><strong>测试开发 / SDET</strong></div><div><Server size={15} /><small>副线</small><strong>Java Backend</strong></div><div><GitBranch size={15} /><small>差异化</small><strong>AI 质量场景</strong></div></div>
          <div className="principle-note"><strong>职业定位</strong><p>AI 是业务场景和差异化经验，不是限制就业面的职业标签。即使移除 AI 模块，主线仍是一套完整的测试开发能力体系。</p></div>
        </section>

        <section className="stage-snapshot overview-stage-card">
          <div className="stage-snapshot-main"><span className="stage-number">0{currentStage.order}</span><div><span className="detail-kicker">CURRENT MILESTONE</span><h2>{currentStage.title}</h2><p>{currentStage.description}</p></div></div>
          <div className="snapshot-columns"><div><span>LEARN</span>{currentStage.learning.slice(0, 4).map((item) => <small key={item}>{item}</small>)}</div><div><span>PRACTICE</span>{currentStage.practice.slice(0, 3).map((item) => <small key={item}>{item}</small>)}</div><div><span>OUTPUT</span>{currentStage.outputs.map((item) => <small key={item}>{item}</small>)}</div></div>
        </section>
      </div>

      <TaskModal open={taskModalOpen} task={editingTask} onClose={() => { setTaskModalOpen(false); setEditingTask(undefined); }} />
      <NoteModal open={Boolean(noteDefaults)} defaults={noteDefaults} onClose={() => setNoteDefaults(undefined)} />
    </>
  );
}
