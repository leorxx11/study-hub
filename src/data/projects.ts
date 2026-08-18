import type { Project } from "../types";

export const projects: Project[] = [
  {
    id: "api-automation-framework", name: "API Automation Framework", status: "Planned", stage: "Stage 2 · 2026.09",
    description: "一套配置清晰、数据驱动并能输出测试报告的通用接口自动化框架。",
    goal: "把日常重复接口回归沉淀成可复用、可维护的测试资产。",
    technologies: ["Python", "pytest", "requests", "YAML", "Allure"],
    milestones: ["请求客户端与环境配置", "fixture 与参数化用例", "数据驱动与断言", "Allure 报告与 CI"],
    stageId: "stage-2",
  },
  {
    id: "autotesthub", name: "AutoTestHub", status: "Future", stage: "Stage 5 · 2026.12",
    description: "集测试用例、任务执行、结果报告和质量分析于一体的自动化测试平台。",
    goal: "做成一个能展示测试开发、后端和工程化能力的长期项目。",
    technologies: ["Spring Boot", "Python", "pytest", "Playwright", "MySQL", "Docker", "CI/CD"],
    milestones: ["Test Case / Task 服务", "Python Runner", "Result / Report / History", "Playwright 集成", "AI Benchmark Extension"],
    stageId: "stage-5",
  },
];
