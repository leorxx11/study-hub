export type DailyTemplateKey = "bug" | "learning" | "automation" | "deployment";

export const dailyTags = [
  { id: "work", label: "工作" },
  { id: "bug", label: "Bug" },
  { id: "learning", label: "学习" },
  { id: "automation", label: "自动化" },
  { id: "deployment", label: "部署" },
  { id: "project", label: "项目" },
] as const;

export const dailyTemplates: Record<DailyTemplateKey, { label: string; tag: string; field: "work" | "learned" | "problems"; content: string }> = {
  bug: { label: "Bug 定位", tag: "bug", field: "problems", content: "问题现象：\n\n复现过程：\n\n我检查了什么：\n\n最终根因：\n\n回归结果：\n" },
  learning: { label: "学习记录", tag: "learning", field: "learned", content: "今天学了什么：\n\n核心概念：\n\n以前哪里理解错了：\n\n现在能做什么：\n" },
  automation: { label: "自动化", tag: "automation", field: "work", content: "原来的人工流程：\n\n哪里重复：\n\n我尝试怎么自动化：\n\n结果怎么样：\n" },
  deployment: { label: "部署", tag: "deployment", field: "work", content: "这次做了什么：\n\n涉及：\n- Issue\n- Build\n- Artifact\n- Patch\n- Environment\n- Service\n\n我理解了什么：\n" },
};
