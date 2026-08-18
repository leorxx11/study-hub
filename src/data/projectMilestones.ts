import type { ProjectMilestone } from "../types";

export const defaultProjectMilestones: ProjectMilestone[] = [
  { id: "api-init", projectId: "api-automation-framework", title: "初始化 pytest 项目", completed: false, skillIds: ["python", "pytest"] },
  { id: "api-http-client", projectId: "api-automation-framework", title: "HTTP Client 封装", completed: false, skillIds: ["http", "python"] },
  { id: "api-fixture", projectId: "api-automation-framework", title: "fixture", completed: false, skillIds: ["pytest"] },
  { id: "api-parametrize", projectId: "api-automation-framework", title: "参数化", completed: false, skillIds: ["pytest"] },
  { id: "api-yaml", projectId: "api-automation-framework", title: "YAML 数据驱动", completed: false, skillIds: ["python", "pytest"] },
  { id: "api-assertion", projectId: "api-automation-framework", title: "Assertion 封装", completed: false, skillIds: ["python", "pytest"] },
  { id: "api-allure", projectId: "api-automation-framework", title: "Allure", completed: false, skillIds: ["pytest"] },
  { id: "api-ci", projectId: "api-automation-framework", title: "CI", completed: false, skillIds: ["cicd"] },
  { id: "api-readme", projectId: "api-automation-framework", title: "README", completed: false, skillIds: ["python"] },
  { id: "hub-backend", projectId: "autotesthub", title: "Spring Boot Backend", completed: false, skillIds: ["java", "spring-boot"] },
  { id: "hub-case-api", projectId: "autotesthub", title: "Test Case API", completed: false, skillIds: ["spring-boot", "mysql"] },
  { id: "hub-task-api", projectId: "autotesthub", title: "Test Task API", completed: false, skillIds: ["spring-boot", "mysql"] },
  { id: "hub-runner", projectId: "autotesthub", title: "Python Runner", completed: false, skillIds: ["python", "pytest"] },
  { id: "hub-result", projectId: "autotesthub", title: "Result", completed: false, skillIds: ["spring-boot", "mysql"] },
  { id: "hub-report", projectId: "autotesthub", title: "Report", completed: false, skillIds: ["spring-boot", "python"] },
  { id: "hub-history", projectId: "autotesthub", title: "History", completed: false, skillIds: ["spring-boot", "mysql"] },
  { id: "hub-playwright", projectId: "autotesthub", title: "Playwright", completed: false, skillIds: ["playwright"] },
  { id: "hub-cicd", projectId: "autotesthub", title: "CI/CD", completed: false, skillIds: ["cicd"] },
  { id: "hub-docker", projectId: "autotesthub", title: "Docker", completed: false, skillIds: ["docker"] },
  { id: "hub-ai", projectId: "autotesthub", title: "AI Benchmark Extension", completed: false, skillIds: ["python"] },
];
