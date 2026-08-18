import { Check, ChevronDown, ChevronUp, Circle } from "lucide-react";
import { useState } from "react";
import { stages } from "../../data/stages";
import { useStudyState } from "../../hooks/useStudyState";
import { getStageProgress } from "../../services/selectors";
import { ProgressBar } from "../ui/ProgressBar";
import { StatusBadge } from "../ui/StatusBadge";

export function StageTimeline() {
  const { state, toggleStage } = useStudyState();
  const [expandedId, setExpandedId] = useState(state.currentStageId);

  return (
    <section className="timeline-section">
      <div className="section-title-row">
        <div><p className="page-eyebrow">2026.08 — 2027 春节</p><h2>阶段时间线</h2></div>
        <p>一次只解决一个阶段的问题。</p>
      </div>
      <div className="timeline-list">
        {stages.map((stage) => {
          const stageProgress = getStageProgress(state, stage.id);
          const isCompleted = state.completedStages.includes(stage.id) || stageProgress === 100;
          const isCurrent = state.currentStageId === stage.id && !isCompleted;
          const status = isCompleted ? "Completed" : isCurrent ? "In Progress" : "Planned";
          const isExpanded = expandedId === stage.id;
          return (
            <article className={`timeline-card${isCurrent ? " current" : ""}${isCompleted ? " completed" : ""}`} key={stage.id}>
              <div className="timeline-marker" aria-hidden="true">{isCompleted ? <Check size={13} /> : <Circle size={10} fill={isCurrent ? "currentColor" : "none"} />}</div>
              <button className="timeline-summary" type="button" onClick={() => setExpandedId(isExpanded ? "" : stage.id)} aria-expanded={isExpanded}>
                <span className="timeline-number">0{stage.order}</span>
                <span className="timeline-main"><small>{stage.period}</small><strong>{stage.title}</strong><em>{stage.theme}</em></span>
                <StatusBadge tone={isCompleted ? "green" : isCurrent ? "blue" : "gray"}>{stageProgress}% · {status}</StatusBadge>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {isExpanded ? (
                <div className="timeline-detail">
                  <p>{stage.description}</p>
                  <div className="timeline-progress"><span>真实行动进度</span><strong>{stageProgress}%</strong><ProgressBar value={stageProgress} label={`${stage.title} 进度`} tone={stageProgress === 100 ? "green" : "blue"} /></div>
                  <div className="timeline-detail-grid">
                    <div><h3>学习</h3><ul>{stage.learning.map((item) => <li key={item}>{item}</li>)}</ul></div>
                    <div><h3>公司实践</h3><ul>{stage.practice.map((item) => <li key={item}>{item}</li>)}</ul></div>
                    <div><h3>阶段成果</h3><ul>{stage.outputs.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  </div>
                  <button className={isCompleted ? "secondary-button" : "primary-button"} type="button" onClick={() => toggleStage(stage.id)}>
                    {isCompleted ? "撤销完成" : "标记阶段完成"}
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
