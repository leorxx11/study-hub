import type { Skill } from "../types";

export const skills: Skill[] = [
  { id: "http", name: "HTTP", category: "测试基础", level: 6, targetLevel: 9, priority: 5, description: "理解协议、请求结构、状态码和常见实时通信方式。", nextAction: "用 DevTools 拆解 5 个真实请求，并用 curl 复现。" },
  { id: "devtools", name: "DevTools", category: "测试基础", level: 5, targetLevel: 8, priority: 5, description: "从 Network、Console 与 Timing 中提取定位证据。", nextAction: "为每个新 Bug 保存请求与响应证据。" },
  { id: "python", name: "Python", category: "自动化", level: 5, targetLevel: 8, priority: 5, description: "编写清晰、可维护的测试脚本和执行器。", nextAction: "完成一个包含配置、日志与异常处理的小工具。" },
  { id: "pytest", name: "pytest", category: "自动化", level: 2, targetLevel: 8, priority: 5, description: "用 fixture、参数化和插件组织自动化测试工程。", nextAction: "完成 10 个参数化 API 用例并生成报告。" },
  { id: "playwright", name: "Playwright", category: "自动化", level: 1, targetLevel: 7, priority: 3, description: "覆盖稳定的端到端用户路径与异步交互。", nextAction: "先完成登录与文件上传两条关键路径。" },
  { id: "linux", name: "Linux", category: "工程能力", level: 4, targetLevel: 8, priority: 5, description: "使用命令行查看进程、日志、网络和服务状态。", nextAction: "围绕一次问题排查练习 tail、grep、ps 与 curl。" },
  { id: "mysql", name: "MySQL", category: "工程能力", level: 5, targetLevel: 8, priority: 4, description: "能通过数据状态辅助定位和验证业务问题。", nextAction: "为典型业务链路整理查询模板和数据检查点。" },
  { id: "redis", name: "Redis", category: "工程能力", level: 2, targetLevel: 6, priority: 3, description: "理解缓存、会话与临时状态对测试结果的影响。", nextAction: "掌握常用数据类型与安全的只读排查方式。" },
  { id: "cicd", name: "CI/CD", category: "工程能力", level: 2, targetLevel: 8, priority: 4, description: "把测试接入构建、部署、制品和回归流程。", nextAction: "让 pytest 在 GitHub Actions 中自动运行。" },
  { id: "docker", name: "Docker", category: "工程能力", level: 2, targetLevel: 7, priority: 4, description: "用一致环境运行服务、测试与依赖。", nextAction: "为 API Automation Framework 编写运行镜像。" },
  { id: "java", name: "Java", category: "后端开发", level: 6, targetLevel: 8, priority: 4, description: "保持服务端开发基本功与工程可读性。", nextAction: "持续用小型 REST 模块维持编码手感。" },
  { id: "spring-boot", name: "Spring Boot", category: "后端开发", level: 5, targetLevel: 8, priority: 4, description: "构建可测试、有日志、有异常治理的后端 API。", nextAction: "为 AutoTestHub 建立 Case 与 Task API。" },
];

export const skillCategories = ["测试基础", "自动化", "工程能力", "后端开发"] as const;
