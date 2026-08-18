import { RoadmapGraph } from "../components/roadmap/RoadmapGraph";
import { StageTimeline } from "../components/timeline/StageTimeline";
import { PageHeader } from "../components/ui/PageHeader";

export function Roadmap() {
  return (
    <>
      <PageHeader eyebrow="CORE ROADMAP" title="成长路线图" description="从测试基础、工程能力到开发能力。点击任一节点，查看学习内容、实践方式和最终产出。" />
      <RoadmapGraph />
      <StageTimeline />
    </>
  );
}
