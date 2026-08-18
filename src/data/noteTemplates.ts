import type { NoteType } from "../types";

export const noteTypeLabels: Record<NoteType, string> = {
  learning: "Learning",
  bug: "Bug",
  automation: "Automation",
  deployment: "Deployment",
  project: "Project",
  review: "Review",
};

export const noteTemplates: Record<NoteType, string> = {
  learning: `## 今天学了什么？\n\n## 核心概念\n\n## 代码 / 示例\n\n## 哪里容易混淆？\n\n## 我现在能做什么？\n`,
  bug: `## 问题现象\n\n## 复现步骤\n\n## Expected\n\n## Actual\n\n## Network\n\n### Request\n\n### Response\n\n### Status Code\n\n## Console\n\n## requestId / traceId\n\n## Log\n\n## Database\n\n## 定位过程\n\n## 根因\n\n## 修复方式\n\n## Regression\n\n## 我学到了什么\n`,
  automation: `## 原来的人工流程\n\n## 重复点在哪里？\n\n## 自动化目标\n\n## 使用技术\n\n## 实现过程\n\n## 结果\n\n## 节省了什么？\n\n## 下一步\n`,
  deployment: `## Issue\n\n## Build\n\n## Artifact\n\n## Patch\n\n## Environment\n\n## Service\n\n## Regression\n\n## 遇到的问题\n\n## 我学到了什么\n`,
  project: `## 本次推进\n\n## 技术决策\n\n## 遇到的问题\n\n## 结果与证据\n\n## 下一步\n`,
  review: `## 这周学了什么？\n\n## 这周公司做了什么？\n\n## 最有价值的问题是什么？\n\n## 我自动化了什么？\n\n## 还有什么没搞懂？\n\n## 下周三个目标是什么？\n\n## 这周有什么值得未来写进简历？\n`,
};
