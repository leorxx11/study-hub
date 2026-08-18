import type { Stage } from "../types";

export const stages: Stage[] = [
  {
    id: "stage-1", order: 1, period: "2026.08 → 2026.09 中旬", title: "看懂请求", theme: "基础打牢",
    description: "先看懂发生了什么，再开始做自动化。",
    learning: ["HTTP", "REST", "DevTools", "requests", "Python"],
    practice: ["每发现一个 Bug 都打开 Network", "查看 Request / Response / Status / Timing", "找到接口并手动 curl"],
    outputs: ["HTTP 学习笔记", "5–10 个接口测试脚本"],
  },
  {
    id: "stage-2", order: 2, period: "2026.09 中旬 → 2026.10 中旬", title: "接口自动化", theme: "从手工到框架",
    description: "把重复回归变成结构清晰、能生成报告的测试工程。",
    learning: ["pytest", "fixture", "parametrize", "conftest", "YAML", "Allure"],
    practice: ["识别重复测试", "Cases → Request → Assert → Report", "整理可复用 fixture 与数据"],
    outputs: ["API Automation Framework v1"],
  },
  {
    id: "stage-3", order: 3, period: "2026.10 中旬 → 2026.11 中旬", title: "问题定位", theme: "沿链路找根因",
    description: "用 Network、日志和数据把问题范围一层层缩小。",
    learning: ["Linux", "Log", "MySQL", "Redis", "traceId", "requestId", "SSE"],
    practice: ["研究模型调用中断", "研究 MCP / Skill 执行失败", "研究 Context 或 Stream 中断"],
    outputs: ["10 个完整 Bug 定位案例"],
  },
  {
    id: "stage-4", order: 4, period: "2026.11 中旬 → 2026.12 中旬", title: "自动化工程化", theme: "接入交付流程",
    description: "让自动化测试进入代码提交、构建、部署和回归链路。",
    learning: ["Playwright", "Git", "CI/CD", "Jenkins / GitHub Actions", "Docker"],
    practice: ["Git Push → CI → pytest → Report", "跟踪 Build / Artifact / Patch", "理解 Deployment 与 Regression"],
    outputs: ["CI 中稳定运行的自动化回归"],
  },
  {
    id: "stage-5", order: 5, period: "2026.12 中旬 → 2027.01 中旬", title: "AutoTestHub", theme: "平台项目",
    description: "把接口、UI 与 AI Benchmark 能力整合为可展示项目。",
    learning: ["Spring Boot Backend", "Python Test Runner", "MySQL", "pytest", "Playwright"],
    practice: ["完成 API Automation 闭环", "接入任务与历史记录", "将 AI Benchmark 设计为扩展模块"],
    outputs: ["可展示的 AutoTestHub GitHub 项目"],
  },
  {
    id: "stage-6", order: 6, period: "2027.01 中旬 → 春节", title: "沉淀", theme: "为校招表达",
    description: "停止追逐新技术，把已有能力整理成能展示、能讲清的成果。",
    learning: ["查漏补缺", "技术表达", "面试复盘"],
    practice: ["项目打磨", "架构图与 README", "Bug 案例整理", "简历与面试表达"],
    outputs: ["完整项目材料", "技术总结", "校招简历"],
  },
];
