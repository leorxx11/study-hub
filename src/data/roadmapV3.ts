import type { RoadmapModule, RoadmapPath, RoadmapTopic } from "../types";

interface ModuleSeed {
  id: string;
  title: string;
  description: string;
  topics: string[];
  skillIds?: string[];
}

interface PathSeed {
  id: string;
  code: string;
  title: string;
  description: string;
  stageId?: string;
  modules: ModuleSeed[];
}

const seeds: PathSeed[] = [
  {
    id: "path-interface", code: "A", title: "接口与测试基础", description: "从 HTTP 请求开始，建立接口测试、DevTools 与流式通信基础。", stageId: "stage-1",
    modules: [
      { id: "http-basics", title: "HTTP 基础", description: "理解一次请求和响应最核心的结构。", skillIds: ["http"], topics: ["HTTP 是什么", "URL", "HTTP Request", "HTTP Response", "GET / POST / PUT / DELETE", "HTTP Status Code", "HTTP Header", "JSON"] },
      { id: "identity-state", title: "身份与状态", description: "理解认证、会话和请求状态如何保持。", skillIds: ["http"], topics: ["Cookie", "Session", "Token", "Authorization"] },
      { id: "devtools", title: "DevTools", description: "用浏览器把真实请求看清楚。", skillIds: ["devtools", "http"], topics: ["DevTools Network", "DevTools Headers", "DevTools Payload", "DevTools Response", "DevTools Timing", "DevTools Initiator", "Copy as curl"] },
      { id: "api-practice", title: "接口实战", description: "从观察请求走向主动复现与脚本化。", skillIds: ["http", "python"], topics: ["REST API", "curl", "Python requests", "文件上传", "Timeout", "Retry"] },
      { id: "streaming", title: "长连接 / 流式", description: "理解持续响应和实时双向通信。", skillIds: ["http", "devtools"], topics: ["SSE", "SSE Event Stream", "SSE 中断排查", "WebSocket", "SSE vs WebSocket"] },
    ],
  },
  {
    id: "path-api-automation", code: "B", title: "接口自动化", description: "把单次接口验证变成可复用、可报告的测试工程。", stageId: "stage-2",
    modules: [
      { id: "pytest-basics", title: "pytest 基础", description: "掌握 pytest 的组织、复用和数据化能力。", skillIds: ["pytest", "python"], topics: ["pytest 项目结构", "第一个 test", "assert", "fixture", "fixture scope", "conftest.py", "parametrize", "setup / teardown"] },
      { id: "automation-engineering", title: "自动化工程", description: "建立可维护的请求、数据、日志和报告层。", skillIds: ["pytest", "python"], topics: ["requests 封装", "测试数据", "YAML", "JSON 数据", "数据驱动", "Assertion 封装", "日志", "Allure", "测试报告"] },
      { id: "automation-project", title: "小项目", description: "用一个完整框架串起接口自动化能力。", skillIds: ["pytest", "python", "http"], topics: ["登录接口", "用户接口", "文件上传自动化", "错误场景", "批量回归", "API Automation Framework v1"] },
    ],
  },
  {
    id: "path-debugging", code: "C", title: "问题定位", description: "沿请求、日志和数据链路缩小问题范围。", stageId: "stage-3",
    modules: [
      { id: "debug-entry", title: "定位入口", description: "先判断问题层级，再建立追踪线索。", skillIds: ["devtools", "http"], topics: ["前端还是后端？", "HTTP 4xx / 5xx", "Console", "requestId", "traceId"] },
      { id: "linux-debug", title: "Linux 排查", description: "在服务环境中查看文件、进程和日志。", skillIds: ["linux"], topics: ["Linux 文件与目录", "grep", "tail", "less", "ps / top"] },
      { id: "service-data", title: "服务与数据", description: "通过服务日志和数据状态验证判断。", skillIds: ["linux", "mysql", "redis"], topics: ["Java / 服务日志", "MySQL 查询", "Redis 基础"] },
      { id: "debug-cases", title: "完整案例", description: "把技术点带回真实问题定位。", skillIds: ["devtools", "linux"], topics: ["一次完整 Bug 定位", "SSE 中断", "超时", "Tool / MCP 调用失败"] },
    ],
  },
  {
    id: "path-ui-automation", code: "D", title: "UI Automation", description: "用 Playwright 覆盖稳定的关键用户路径。", stageId: "stage-4",
    modules: [
      { id: "playwright", title: "Playwright", description: "从浏览器对象到一条完整 UI 自动化流程。", skillIds: ["playwright", "pytest"], topics: ["Playwright 是什么", "Browser / Context / Page", "Locator", "Selector", "Click / Fill", "Wait", "Assertion", "Login", "Upload", "Screenshot / Trace", "pytest 集成", "一条完整业务流程"] },
    ],
  },
  {
    id: "path-cicd", code: "E", title: "CI/CD", description: "理解代码、构建、制品、部署和回归的完整交付链路。", stageId: "stage-4",
    modules: [
      { id: "git-ci", title: "Git 与 CI", description: "理解版本协作和流水线入口。", skillIds: ["cicd"], topics: ["Git 基础", "Branch", "CI 是什么", "Pipeline"] },
      { id: "ci-tools", title: "CI 工具", description: "掌握常用流水线平台的基本使用。", skillIds: ["cicd"], topics: ["GitHub Actions", "Jenkins"] },
      { id: "delivery", title: "交付流程", description: "看懂从 Build 到 Regression 的每个对象。", skillIds: ["cicd", "docker"], topics: ["Build", "Artifact", "Docker", "Environment", "Deployment", "Patch", "Regression"] },
      { id: "test-in-ci", title: "测试接入 CI", description: "让测试成为稳定的工程环节。", skillIds: ["cicd", "pytest"], topics: ["pytest 接入 CI", "自动生成 Report"] },
    ],
  },
  {
    id: "path-backend", code: "F", title: "Java Backend", description: "保持服务端开发副线，为测试平台和后端岗位保留能力。", stageId: "stage-5",
    modules: [
      { id: "java-backend", title: "后端主线", description: "从语言、框架、数据到服务治理。", skillIds: ["java", "spring-boot", "mysql", "redis"], topics: ["Java", "Spring Boot", "REST API Backend", "MySQL Backend", "MyBatis", "Redis Backend", "Log / Exception"] },
    ],
  },
];

const slug = (value: string) => value.toLowerCase()
  .replace(/\+/g, "plus")
  .replace(/[/?]/g, " ")
  .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
  .replace(/(^-|-$)/g, "");

const topicOverrides: Record<string, Partial<RoadmapTopic>> = {
  "http-status-code": {
    why: "测试接口时，Status Code 是第一眼判断请求结果和问题层级的重要信息。",
    understand: ["2xx：请求成功", "3xx：重定向", "4xx：客户端或权限问题", "5xx：服务端异常", "重点观察 200、201、204、400、401、403、404、409、429、500、502、503"],
    doneCriteria: ["能解释 401 和 403 的区别", "看见 500 知道大致属于服务端异常", "能结合 Response 判断具体错误", "在真实请求里观察过至少 3 种状态码"],
    practiceSuggestion: "今天测试真实接口时打开 Network，记录遇到的不同 HTTP Status，并结合 Response 写进 Daily Log。",
  },
  "http-request": {
    why: "Request 是客户端向服务端表达意图的完整载体，接口测试首先要能拆清它。",
    understand: ["Method 与 URL", "Query、Path 与 Body", "Headers 与认证信息", "Content-Type", "请求如何从浏览器发出"],
    doneCriteria: ["能口头拆解一个真实 Request", "能区分 Query 与 Body", "能用 curl 复现一个请求", "能指出敏感信息不应写入日志"],
    practiceSuggestion: "在 DevTools 中选择一个真实请求，逐项记录 Method、URL、Header、Payload，再用 Copy as curl 复现。",
  },
  "devtools-network": {
    why: "Network 面板是前端现象与后端接口之间最直接的证据入口。",
    understand: ["请求过滤与类型", "Headers / Payload / Response / Timing", "请求顺序和依赖", "失败请求的快速判断"],
    doneCriteria: ["能快速找到目标请求", "能确认请求是否真正发送", "能读懂 Status 和 Response", "能保存一次排查所需的关键证据"],
    practiceSuggestion: "今天选择一个核心操作，从点击开始完整跟踪它产生的所有 Network 请求。",
  },
  "python-requests": {
    why: "requests 让你从观察接口走向可重复执行，是接口自动化最短的起点。",
    understand: ["Session 与单次请求", "params、json、data、files", "timeout", "Response 对象", "异常处理"],
    doneCriteria: ["能复现一个 GET 和 POST 请求", "能设置 Header 与 Token", "能解析 JSON Response", "能加入 timeout 和基础异常处理"],
    practiceSuggestion: "把今天在 DevTools 中确认的一个接口改写成最小 requests 脚本，敏感参数使用占位符。",
  },
  sse: {
    why: "SSE 是智能产品流式输出的常见方式，理解它有助于判断中断、超时和内容缺失。",
    understand: ["持续保持的 HTTP Response", "text/event-stream", "Event Stream 格式", "连接关闭和异常中断", "浏览器中的观察方式"],
    doneCriteria: ["能解释 SSE 为什么仍是 HTTP", "能在 Network 中找到 Event Stream", "能区分正常结束和异常中断", "观察过一次真实流式响应"],
    practiceSuggestion: "打开一个流式输出请求，记录首包时间、事件格式、正常结束标记以及中断时表现。",
  },
};

const generatedTopics: RoadmapTopic[] = [];
const generatedModules: RoadmapModule[] = [];

for (const path of seeds) {
  let pathOrder = 0;
  for (const module of path.modules) {
    const topicIds: string[] = [];
    for (const title of module.topics) {
      pathOrder += 1;
      let id = slug(title);
      if (generatedTopics.some((topic) => topic.id === id)) id = `${module.id}-${id}`;
      topicIds.push(id);
      generatedTopics.push({
        id,
        order: pathOrder,
        title,
        pathId: path.id,
        moduleId: module.id,
        estimatedMinutes: "30–45 min",
        why: `理解 ${title}，能让你在测试、定位或工程实践中做出更可靠的判断。`,
        understand: [`${title} 的核心作用`, "最常见的使用方式", "容易出现的问题和观察入口"],
        doneCriteria: [`能用自己的话解释 ${title}`, "能识别一个真实场景", "至少完成一次小练习或真实观察"],
        practiceSuggestion: `在今天的工作或个人项目中找一个与 ${title} 有关的真实场景，观察后写进 Daily Log。`,
        legacySkillIds: module.skillIds,
      });
    }
    generatedModules.push({ id: module.id, pathId: path.id, title: module.title, description: module.description, topicIds });
  }
}

export const roadmapPaths: RoadmapPath[] = seeds.map((path) => ({ id: path.id, code: path.code, title: path.title, description: path.description, stageId: path.stageId, moduleIds: path.modules.map((module) => module.id) }));
export const roadmapModules: RoadmapModule[] = generatedModules;
export const roadmapTopics: RoadmapTopic[] = generatedTopics.map((topic, index, all) => ({ ...topic, ...(topicOverrides[topic.id] ?? {}), nextTopicId: all[index + 1]?.pathId === topic.pathId ? all[index + 1].id : undefined }));

export const topicById = new Map(roadmapTopics.map((topic) => [topic.id, topic]));
export const moduleById = new Map(roadmapModules.map((module) => [module.id, module]));
export const pathById = new Map(roadmapPaths.map((path) => [path.id, path]));

export const defaultFocusTopicIds = ["http-status-code", "devtools-network", "python-requests"];

export function topicIdsForLegacySkills(skillIds: string[] | undefined): string[] {
  if (!skillIds?.length) return [];
  return roadmapTopics.filter((topic) => topic.legacySkillIds?.some((id) => skillIds.includes(id))).slice(0, 3).map((topic) => topic.id);
}
