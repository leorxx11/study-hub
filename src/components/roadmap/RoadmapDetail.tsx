import { BriefcaseBusiness, CircleCheckBig, Code2, Lightbulb, Link2, X } from "lucide-react";
import { useStudyState } from "../../hooks/useStudyState";
import { getStageProgress } from "../../services/selectors";
import type { RoadmapNode } from "../../types";
import { formatDate } from "../../utils/date";
import { ProgressBar } from "../ui/ProgressBar";

export function RoadmapDetail({ node, onClose }: { node: RoadmapNode; onClose?: () => void }) {
  const { state } = useStudyState();
  const stageProgress = getStageProgress(state, node.stageId);
  const evidence = state.evidence.filter((item) => node.skillIds.includes(item.skillId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const activities = state.activities.filter((activity) => activity.skillIds?.some((id) => node.skillIds.includes(id)) || activity.stageId === node.stageId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  return (
    <aside className="roadmap-detail" aria-live="polite">
      <div className="detail-heading"><div><span className="detail-kicker">{node.shortTitle}</span><h2>{node.title}</h2></div>{onClose ? <button type="button" className="icon-button detail-close" onClick={onClose} aria-label="关闭详情"><X size={16} /></button> : null}</div>
      <p className="detail-summary">{node.summary}</p>

      <section className="roadmap-live-progress"><div><span>STAGE PROGRESS</span><strong>{stageProgress}%</strong></div><ProgressBar value={stageProgress} label={`${node.title} 阶段进度`} /><div className="roadmap-live-stats"><span><strong>{evidence.length}</strong> Evidence</span><span><strong>{activities.length}</strong> Recent</span></div></section>
      <div className="detail-section"><h3><Code2 size={15} />学习什么</h3><ul>{node.learn.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div className="detail-section why-section"><h3><Lightbulb size={15} />为什么学</h3><p>{node.why}</p></div>
      <div className="detail-section"><h3><BriefcaseBusiness size={15} />公司怎么实践</h3><ul>{node.practice.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div className="detail-section output-section"><h3><CircleCheckBig size={15} />最终产出</h3><ul>{node.outputs.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div className="detail-section"><h3><Link2 size={15} />Evidence</h3>{evidence.length ? <div className="mini-evidence-list">{evidence.slice(0, 4).map((item) => <div key={item.id}><strong>{item.title}</strong><small>{formatDate(item.createdAt)}</small></div>)}</div> : <p>完成关联 Task、Practice、Note 或 Milestone 后自动出现。</p>}</div>
      <div className="detail-section"><h3>Recent Activity</h3>{activities.length ? <div className="mini-activity-list">{activities.map((activity) => <div key={activity.id}><time>{formatDate(activity.createdAt)}</time><span>{activity.title}</span></div>)}</div> : <p>暂无关联动态。</p>}</div>
      <div className="tag-list">{node.technologies.map((item) => <span key={item}>{item}</span>)}</div>
    </aside>
  );
}
