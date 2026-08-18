import { Link2, Minus, Plus, Star, Target } from "lucide-react";
import { useState, type FormEvent } from "react";
import { skillCategories, skills } from "../../data/skills";
import { useStudyState } from "../../hooks/useStudyState";
import { getSkillActivities, getSkillEvidence } from "../../services/selectors";
import { formatDate } from "../../utils/date";
import { Modal } from "../ui/Modal";
import { ProgressBar } from "../ui/ProgressBar";

const sourceLabels = { task: "Task", note: "Note", practice: "Practice", project: "Project", manual: "Manual" };

export function SkillMatrix() {
  const { state, updateSkillLevel, createManualEvidence } = useStudyState();
  const [selectedId, setSelectedId] = useState(skills[0].id);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const selected = skills.find((skill) => skill.id === selectedId) ?? skills[0];
  const selectedLevel = state.skillLevels[selected.id] ?? selected.level;
  const evidence = getSkillEvidence(state, selected.id);
  const activities = getSkillActivities(state, selected.id).slice(0, 5);
  const suggestedLevel = Math.min(selected.targetLevel, Math.max(selectedLevel, Math.floor(evidence.length / 4)));

  const submitEvidence = (event: FormEvent) => {
    event.preventDefault();
    if (!evidenceTitle.trim()) return;
    createManualEvidence({ skillId: selected.id, title: evidenceTitle.trim(), description: evidenceDescription.trim() || undefined });
    setEvidenceTitle("");
    setEvidenceDescription("");
    setEvidenceOpen(false);
  };

  return (
    <>
      <div className="skills-layout">
        <div className="skills-groups">
          {skillCategories.map((category) => (
            <section className="skill-group" key={category}>
              <div className="skill-group-heading"><h2>{category}</h2><span>{skills.filter((skill) => skill.category === category).length} SKILLS</span></div>
              <div className="skill-card-grid">
                {skills.filter((skill) => skill.category === category).map((skill) => {
                  const level = state.skillLevels[skill.id] ?? skill.level;
                  const evidenceCount = state.evidence.filter((item) => item.skillId === skill.id).length;
                  return (
                    <button className={`skill-card${selected.id === skill.id ? " active" : ""}`} type="button" onClick={() => setSelectedId(skill.id)} key={skill.id}>
                      <div className="skill-card-head"><strong>{skill.name}</strong><span>{level}<small>/10</small></span></div>
                      <ProgressBar value={level} max={10} label={`${skill.name} 当前等级 ${level}`} />
                      <div className="skill-card-foot"><span>目标 {skill.targetLevel}</span><span>{evidenceCount} Evidence</span><span>优先级 {skill.priority}/5</span></div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="skill-detail" aria-live="polite">
          <div className="detail-heading"><div><span className="detail-kicker">{selected.category}</span><h2>{selected.name}</h2></div><button className="secondary-button" type="button" onClick={() => setEvidenceOpen(true)}><Link2 size={14} />Add Evidence</button></div>
          <p className="detail-summary">{selected.description}</p>
          <div className="priority-display"><span>学习优先级</span><div>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < selected.priority ? "currentColor" : "none"} />)}</div></div>
          <div className="level-editor">
            <div><span>当前能力</span><strong>{selectedLevel}<small>/10</small></strong></div>
            <input type="range" min="0" max="10" value={selectedLevel} onChange={(event) => updateSkillLevel(selected.id, Number(event.target.value))} aria-label={`${selected.name} 能力等级`} />
            <div className="level-actions"><button type="button" onClick={() => updateSkillLevel(selected.id, selectedLevel - 1)} disabled={selectedLevel === 0} aria-label="降低一级"><Minus size={15} /></button><span>目标 {selected.targetLevel} · 建议 {suggestedLevel} · {evidence.length} 条证据</span><button type="button" onClick={() => updateSkillLevel(selected.id, selectedLevel + 1)} disabled={selectedLevel === 10} aria-label="提高一级"><Plus size={15} /></button></div>
          </div>

          <section className="skill-evidence-section"><div className="subsection-title"><span>EVIDENCE</span><strong>{evidence.length}</strong></div>{evidence.length ? <div className="evidence-list">{evidence.slice(0, 6).map((item) => <div key={item.id}><span><Link2 size={12} /></span><div><strong>{item.title}</strong><small>{sourceLabels[item.sourceType]} · {formatDate(item.createdAt)}</small></div></div>)}</div> : <div className="compact-empty">完成关联任务、实践或记录后，证据会自动汇入这里。</div>}</section>
          <section className="skill-evidence-section"><div className="subsection-title"><span>RECENT ACTIVITY</span></div>{activities.length ? <div className="mini-activity-list">{activities.map((activity) => <div key={activity.id}><time>{formatDate(activity.createdAt)}</time><span>{activity.title}</span></div>)}</div> : <div className="compact-empty">暂无关联动态。</div>}</section>
          <div className="next-action"><Target size={17} /><div><span>NEXT ACTION</span><p>{selected.nextAction}</p></div></div>
          <p className="autosave-note">Evidence 不会自动改变等级，能力等级仍由你确认。</p>
        </aside>
      </div>

      <Modal open={evidenceOpen} onClose={() => setEvidenceOpen(false)} title={`为 ${selected.name} 添加证据`} eyebrow="MANUAL EVIDENCE" description="只记录可讲清、可追溯的行动或产出。" footer={<><button className="secondary-button" type="button" onClick={() => setEvidenceOpen(false)}>取消</button><button className="primary-button" type="submit" form="evidence-form">添加证据</button></>}>
        <form id="evidence-form" className="record-form" onSubmit={submitEvidence}><label className="full-field"><span>证据标题 *</span><input type="text" value={evidenceTitle} onChange={(event) => setEvidenceTitle(event.target.value)} placeholder="例如：使用 curl 独立复现接口" required /></label><label className="full-field"><span>补充说明</span><textarea rows={5} value={evidenceDescription} onChange={(event) => setEvidenceDescription(event.target.value)} placeholder="可选：说明做了什么、结果是什么" /></label></form>
      </Modal>
    </>
  );
}
