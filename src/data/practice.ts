import type { PracticeGroup } from "../types";

const makeItems = (prefix: string, labels: string[]) => labels.map((label, index) => ({ id: `${prefix}-${index + 1}`, label }));

export const practiceGroups: PracticeGroup[] = [
  {
    id: "bug", title: "Bug Checklist", description: "从现象到根因，保留完整证据链。",
    items: makeItems("bug", ["F12 看 Network", "请求有没有发送", "检查 Status Code", "查看 Response", "查看 Console", "记录 requestId / traceId", "尝试查看日志", "判断问题层级", "询问开发最终根因", "完成 Regression"]),
  },
  {
    id: "automation", title: "Automation Checklist", description: "判断一次重复操作能否沉淀为自动化资产。",
    items: makeItems("automation", ["这个操作是否重复？", "是否有 API？", "是否可以 requests？", "是否可以 pytest？", "是否可以参数化？", "是否可以自动统计？", "是否可以生成报告？"]),
  },
  {
    id: "deployment", title: "Deployment Checklist", description: "每次打补丁时，理解制品与环境的对应关系。",
    items: makeItems("deployment", ["这个 Issue 是什么？", "对应哪个 Build？", "使用哪个 Artifact？", "部署到哪个 Service？", "修复了什么？", "需要回归哪些 Case？"]),
  },
  {
    id: "initiative", title: "Initiative Checklist", description: "在日常实习中主动寻找高价值的成长机会。",
    items: makeItems("initiative", ["找接口自动化项目", "找回归脚本", "主动写小工具", "找机会看日志", "找机会查数据库", "跟完整 CI/CD", "研究有技术含量的 Bug", "累积 Bug 定位案例"]),
  },
];

export const deploymentFlow = ["Issue", "Build", "Artifact", "Patch", "Environment", "Service", "Regression"];

export const safeWorkLabels = ["Company Work Platform", "Internal PM", "Internal Artifact Repository", "Private Test Environment"];
