import { projects } from "../../data/projects";
import { skills } from "../../data/skills";
import { stages } from "../../data/stages";

interface RelationFieldsProps {
  skillIds: string[];
  stageId?: string;
  projectId?: string;
  onSkillIdsChange: (ids: string[]) => void;
  onStageIdChange: (id: string | undefined) => void;
  onProjectIdChange: (id: string | undefined) => void;
  compact?: boolean;
}

export function RelationFields({ skillIds, stageId, projectId, onSkillIdsChange, onStageIdChange, onProjectIdChange, compact = false }: RelationFieldsProps) {
  const toggleSkill = (id: string) => onSkillIdsChange(skillIds.includes(id) ? skillIds.filter((item) => item !== id) : [...skillIds, id]);
  return (
    <div className={`relation-fields${compact ? " compact" : ""}`}>
      <fieldset>
        <legend>关联 Skills</legend>
        <div className="choice-chips">
          {skills.map((skill) => <button type="button" className={skillIds.includes(skill.id) ? "active" : ""} aria-pressed={skillIds.includes(skill.id)} onClick={() => toggleSkill(skill.id)} key={skill.id}>{skill.name}</button>)}
        </div>
      </fieldset>
      <div className="relation-selects">
        <label><span>关联 Stage</span><select value={stageId ?? ""} onChange={(event) => onStageIdChange(event.target.value || undefined)}><option value="">不关联</option>{stages.map((stage) => <option value={stage.id} key={stage.id}>Stage {stage.order} · {stage.title}</option>)}</select></label>
        <label><span>关联 Project</span><select value={projectId ?? ""} onChange={(event) => onProjectIdChange(event.target.value || undefined)}><option value="">不关联</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label>
      </div>
    </div>
  );
}
