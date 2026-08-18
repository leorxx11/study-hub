import { SkillMatrix } from "../components/skills/SkillMatrix";
import { PageHeader } from "../components/ui/PageHeader";
import { useStudyState } from "../hooks/useStudyState";

export function Skills() {
  const { progress } = useStudyState();
  return (
    <>
      <PageHeader
        eyebrow="CAPABILITY MATRIX"
        title="能力矩阵"
        description="关注当前能力与目标能力之间的差距。点击技能可查看下一步行动，并随学习进展调整等级。"
        action={<div className="header-stat"><span>目标达成度</span><strong>{progress.skillPercent}%</strong></div>}
      />
      <SkillMatrix />
    </>
  );
}
