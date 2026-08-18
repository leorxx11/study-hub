# Study Hub V2

Leo 的 Personal Engineering Growth System，用于把日常 Task、公司实践、工程记录与个人项目沉淀为可追溯的 SDET 成长证据。

> 从测试执行到测试开发，从自动化到工程能力。

## 技术栈

- Vite + React 19 + TypeScript
- Tailwind CSS 4 + 项目原有设计变量
- React Router + Lucide Icons
- Repository 抽象下的 `localStorage` V2 持久化
- Nginx 静态部署

项目仍是纯前端 SPA，不包含后端、数据库、登录、云同步或 AI 功能。

## V2 功能

- Overview：Today Task CRUD、Quick Record、最近 10 条 Activity、本周真实指标
- Notes / Engineering Log：Learning、Bug、Automation、Deployment、Project、Review 六类模板，支持 CRUD、详情、搜索与筛选
- Practice：Bug、Automation、Deployment 可重复 Session、独立 Checklist、History、完成/重开、转为 Note；Initiative 保留 V1 长期清单
- Projects：API Automation Framework 与 AutoTestHub 的可勾选 Milestone、实时进度、项目 Activity、Evidence、Notes 与关联 Task
- Skills：保留手工 Level，同时展示可追溯 Evidence 与 Recent Activity；完成一条记录不会自动升级
- Roadmap：保留原能力树与阶段时间线，新增真实 Stage Progress、Evidence、Activity
- Progress：Weekly Growth Report、Recent Evidence、Skills Activity、当前阶段待完成项、完整 Activity、Weekly Review
- Settings：Light / Dark / System、完整 JSON Export / Import、导入前安全快照、输入 `RESET` 的二次确认
- 响应式 Sidebar、移动端底部导航、纵向表单与安全高度 Modal

## 数据闭环

```text
Task done ───────────────→ Activity ──→ optional Evidence
Practice completed ──────→ Activity ──→ Evidence ──→ Skill
                    └────→ Note
Project Milestone done ──→ Activity ──→ Evidence ──→ Skill

Task / Practice / Milestone ──→ Stage Progress
全部真实行动 ────────────────→ Progress ──→ Weekly Review
```

## 数据模型与存储

V2 核心模型位于 `src/types/index.ts`：

- `Task`
- `Note`
- `PracticeRecord`
- `Activity`
- `SkillEvidence`
- `ProjectMilestone`
- `WeeklyReview`

页面只通过 `useStudyState` 使用业务动作，不直接访问浏览器存储。`src/services/storage/repository.ts` 定义 `StudyRepository`，当前实现为 `LocalStorageStudyRepository`。未来可用相同接口增加 `ApiStudyRepository`，将数据源替换为 Spring Boot API + MySQL，而不需要重写页面。

### V1 → V2 迁移

- V1 key：`study-hub:state:v1`
- V2 key：`study-hub:state:v2`
- 首次加载优先读取 V2；只有 V2 不存在时才读取并迁移 V1
- 保留 V1 Checklist、完成阶段、能力等级、当前阶段、主题和个人设置
- V1 首页任务迁移为 V2 `Task`
- 已使用的一次性 Bug / Automation / Deployment Checklist 迁移为 `PracticeRecord`
- 无法映射的 V1 字段完整保存在 `legacyData`
- 自动迁移只写入 V2 key，不删除或覆盖 V1 key

导入备份前，当前状态还会写入 `study-hub:state:v2:before-import` 安全快照。

### Progress 计算

- Project Progress = `completed milestones / total milestones`
- Stage Progress = 当前 Stage 下已完成的 `Task + PracticeRecord + ProjectMilestone` / 总数；V1 已完成阶段保持 100%
- Overall Progress = 全部已完成的 `Task + PracticeRecord + ProjectMilestone` / 全部记录数
- Skills 目标达成度继续使用手工确认的当前 Level / 目标 Level
- Weekly Growth Report 只统计当前 ISO Week 内有真实完成时间的记录

### Skill Evidence

- Note 创建、Practice 完成与 Project Milestone 完成时，根据关联 `skillIds` 自动建立 Evidence
- 已完成 Task 由用户明确点击 “Add as Evidence” 后建立 Evidence
- Skills 页面也支持添加 Manual Evidence
- 取消完成或删除来源记录时，对应自动 Activity / Evidence 会同步移除
- Evidence 不会自动修改 Skill Level

## 项目结构

```text
src/
├── components/
│   ├── activity/       # Activity feed
│   ├── forms/          # Skill / Stage / Project 关联字段
│   ├── notes/          # Note editor
│   ├── practice/       # Practice session
│   ├── progress/       # Weekly review
│   ├── task/           # Task list / editor
│   └── ui/             # Modal、进度条等通用 UI
├── data/               # 路线、技能、实践模板、项目与 Note 模板
├── hooks/              # 统一业务 Context
├── pages/              # 8 个现有路由页面
├── services/
│   ├── selectors.ts    # Progress / Evidence / Activity 派生数据
│   └── storage/        # Repository、migration、storage constants
├── types/
└── utils/
```

## 本地开发与验证

当前仓库保留 npm lockfile：

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run verify:v2
npm run build
```

如本地统一使用 pnpm，也可安装依赖后执行 `pnpm build`。生产文件输出到 `dist/`。

## 备份、导入与重置

- Settings → Export Backup 下载 `study-hub-backup-YYYY-MM-DD.json`，内容含所有 V2 数据
- Settings → Import Backup 选择 JSON 并二次确认；支持 V2 envelope、V2 raw state 与 V1 备份迁移
- Reset 会明确列出删除内容，只有输入大写 `RESET` 才能执行

## 部署到 study.leorxx.xyz

部署脚本会重新构建，并以带 UTC 时间戳的 release 目录原子更新 `current` 软链接。默认不 reload Nginx，也不会操作其他站点：

```bash
sudo WEB_ROOT=/var/www/study.leorxx.xyz RELOAD_NGINX=0 ./deploy/deploy.sh
```

现有 Nginx server block 保留 React Router history fallback、gzip、哈希资源长期缓存与 `index.html` 禁止长期缓存。发布后验证：

```bash
curl -I https://study.leorxx.xyz
curl -I https://study.leorxx.xyz/roadmap
```

## 未来切换 Spring Boot + MySQL

1. 在 Spring Boot 中按 V2 模型提供 Task、Note、Practice、Activity、Evidence、Milestone、Review API。
2. 新建 `ApiStudyRepository` 实现与本地 Repository 对应的加载、保存、导入与导出能力。
3. 把 Context 中的持久化实现通过 Provider / configuration 注入，而不是修改页面组件。
4. 将一次性全量 `save` 逐步替换为各聚合的异步 CRUD，并增加错误、重试与冲突状态。
5. 后端稳定后提供一次显式的本地 V2 → API 导入流程；在用户确认成功前始终保留本地备份。
