import { ArrowRight, CheckCircle2, Circle, CircleDot, FileCheck2, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { ActivityFeed } from "../components/activity/ActivityFeed";
import { WeeklyReviewForm } from "../components/progress/WeeklyReviewForm";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { projects } from "../data/projects";
import { skills } from "../data/skills";
import { stages } from "../data/stages";
import { useStudyState } from "../hooks/useStudyState";
import { getRecentActivities, getStageProgress, getWeeklySkillActivity } from "../services/selectors";
import { formatDate, getWeekKey } from "../utils/date";

export function Progress() {
  const { progress, state, weeklyMetrics } = useStudyState();
  const currentStage = stages.find((stage) => stage.id === state.currentStageId) ?? stages[0];
  const currentStageProgress = getStageProgress(state, currentStage.id);
  const weeklySkills = getWeeklySkillActivity(state);
  const recentEvidence = [...state.evidence].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  const recentActivities = getRecentActivities(state, 25);
  const stageProjectIds = projects.filter((project) => project.stageId === currentStage.id).map((project) => project.id);
  const outstanding = [
    ...state.tasks.filter((task) => task.stageId === currentStage.id && task.status !== "done").map((task) => ({ id: task.id, title: task.title, kind: "Task" })),
    ...state.practiceRecords.filter((record) => record.stageId === currentStage.id && !record.completedAt).map((record) => ({ id: record.id, title: record.title, kind: "Practice" })),
    ...state.projectMilestones.filter((milestone) => stageProjectIds.includes(milestone.projectId) && !milestone.completed).map((milestone) => ({ id: milestone.id, title: milestone.title, kind: "Milestone" })),
  ].slice(0, 7);
  const weeklyCards = [
    ["Tasks Completed", weeklyMetrics.tasksCompleted],
    ["Practices", weeklyMetrics.practices],
    ["Bug Cases", weeklyMetrics.bugCases],
    ["Notes", weeklyMetrics.notes],
    ["Milestones", weeklyMetrics.milestones],
  ] as const;

  return (
    <>
      <PageHeader eyebrow={`WEEKLY GROWTH REPORT · ${getWeekKey()}`} title="This Week" description="用真实 Task、Practice、Note、Evidence 与 Milestone 汇总行动反馈，不靠手工凑百分比。" action={<div className="header-stat"><span>总体真实进度</span><strong>{progress.overall}%</strong></div>} />

      <section className="weekly-metric-grid">{weeklyCards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>THIS WEEK</small></article>)}</section>

      <div className="growth-report-grid">
        <section className="growth-card recent-evidence-card"><div className="panel-header-row"><div><span className="detail-kicker">RECENT EVIDENCE</span><h2>能力证据</h2></div><Link className="text-link" to="/skills">Skills <ArrowRight size={13} /></Link></div>{recentEvidence.length ? <div className="progress-evidence-list">{recentEvidence.map((item) => { const skill = skills.find((entry) => entry.id === item.skillId); return <div key={item.id}><span><FileCheck2 size={14} /></span><div><strong>{item.title}</strong><small>{skill?.name ?? item.skillId} · {item.sourceType} · {formatDate(item.createdAt)}</small></div></div>; })}</div> : <div className="compact-empty">完成关联行动后，这里会出现可追溯证据。</div>}</section>
        <section className="growth-card skills-activity-card"><div className="panel-header-row"><div><span className="detail-kicker">SKILLS ACTIVITY</span><h2>本周能力投入</h2></div></div>{weeklySkills.length ? <div className="skills-activity-list">{weeklySkills.map((item) => { const skill = skills.find((entry) => entry.id === item.skillId); const max = Math.max(...weeklySkills.map((entry) => entry.count)); return <div key={item.skillId}><div><strong>{skill?.name ?? item.skillId}</strong><span>{item.count} activities</span></div><ProgressBar value={item.count} max={max} label={`${skill?.name} ${item.count} 次活动`} /></div>; })}</div> : <div className="compact-empty">本周还没有关联 Skill 的 Activity。</div>}</section>
      </div>

      <section className="current-stage-report">
        <div className="stage-report-main"><span className="stage-number">0{currentStage.order}</span><div><span className="detail-kicker">CURRENT STAGE</span><h2>Stage {currentStage.order} · {currentStage.title}</h2><p>{currentStage.description}</p><Link className="text-link" to="/roadmap">继续当前阶段 <ArrowRight size={14} /></Link></div><strong>{currentStageProgress}<small>%</small></strong></div>
        <ProgressBar value={currentStageProgress} label={`${currentStage.title} 进度`} tone={currentStageProgress === 100 ? "green" : "blue"} />
        <div className="stage-outstanding"><span>还差</span>{outstanding.length ? outstanding.map((item) => <div key={item.id}><Circle size={12} /><strong>{item.title}</strong><small>{item.kind}</small></div>) : <div><CheckCircle2 size={13} /><strong>当前已记录的行动全部完成</strong></div>}</div>
      </section>

      <section className="all-activity-card"><div className="panel-header-row"><div><span className="detail-kicker">ACTIVITY LOG</span><h2>全部近期动态</h2></div></div><ActivityFeed activities={recentActivities} /></section>

      <WeeklyReviewForm />

      <section className="stage-status-list"><div className="section-title-row"><div><p className="page-eyebrow">MILESTONES</p><h2>阶段状态</h2></div><p>状态结合 V1 手工完成标记与 V2 真实行动进度。</p></div>{stages.map((stage) => { const stageProgress = getStageProgress(state, stage.id); const completed = state.completedStages.includes(stage.id) || stageProgress === 100; const current = state.currentStageId === stage.id && !completed; return <div className={`stage-status-row${current ? " current" : ""}`} key={stage.id}>{completed ? <CheckCircle2 size={17} /> : current ? <CircleDot size={17} /> : <Target size={17} />}<span>0{stage.order}</span><strong>{stage.title}</strong><small>{stageProgress}% · {completed ? "Completed" : current ? "In Progress" : "Planned"}</small></div>; })}</section>
    </>
  );
}
