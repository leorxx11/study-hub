# Study Hub V3

Study Hub 是 Leo 的个人学习成长记录站：

> 记录每一天，复盘每一周，规划下一步学习。

它不再尝试管理所有任务或量化“能力等级”，而是围绕一个更短的循环工作：每天留下真实记录，把记录关联到正在学习的 Topic，每周复盘，再决定下一步。

## 产品逻辑

```text
Today / Daily Log
        │
        ├── 关联 Roadmap Topic ──→ 更新 Learning / Practiced / Done
        ├── 关联 Project ────────→ 形成项目最近更新
        │
        └── 汇总到 Weekly
                 ├── 7 天 Timeline + 轻量统计
                 ├── 5 问 Weekly Review + Growth Check
                 └── Export for AI（只生成 Markdown）
                              │
                              └── 带回任意模型分析下一阶段
```

Daily Log 是唯一的日常记录入口。Roadmap 负责回答“下一步学什么、怎样算学会”，Weekly 负责回答“这周真正发生了什么”，Projects 只保留推进项目所需的最少信息。

## 页面与操作

### Today

- “今天主要做了什么”是唯一必填项；其余内容通过“展开更多”按需填写。
- 可选字段包括：学到了什么、遇到的问题、之后继续研究什么、关联 Topic、关联 Project。
- Bug、Learning、Automation、Deployment 四个快捷模板只填充提示，不创建额外数据类型。
- 一天默认维护一条 Daily Log；已保存内容可以继续修改。
- 最近日期中的记录可以直接打开、编辑或删除。

### Roadmap

- 六条路线：接口与测试基础、接口自动化、问题定位、UI Automation、CI/CD、Java Backend。
- 每条路线按 Path → Module → Topic 展开，每个 Topic 都包含预计时间、学习原因、理解要点、完成标准、实践建议和下一 Topic。
- Topic 状态由用户明确更新：`Not Started → Learning → Practiced → Done`，系统不会因为写了一条日志就自动升级。
- Current Focus 始终保留 1–3 个 Topic，并显示在 Today 首页。
- 当一个 Learning Topic 已关联至少 3 条真实日志时，页面只提示是否改为 Practiced，仍由用户确认。

### Weekly

- 支持查看上周、本周和下一周，7 天 Timeline 可直接编辑任意 Daily Log。
- 只显示轻量事实统计：记录天数、Bug、学习、自动化、部署、完成 Topic 数。
- Weekly Review 固定为 5 个问题，并附带四个三档 Growth Check；它们不用于排名或打分。
- Export for AI 支持 This Week、Last 2 Weeks、This Month、Internship So Far。
- 导出只在浏览器中生成 Markdown，可预览、复制或下载，不会调用任何 AI API，也不会自动上传数据。

### Projects

- 当前项目为 API Automation Framework 和 AutoTestHub。
- 每个项目只展示目标、状态、Milestones、最近更新和关联 Roadmap。
- “记录项目更新”实际写入今天的 Daily Log，并自动带上项目和推荐 Topic 关联。
- 勾选 Milestone 会计算项目进度；项目日志可以直接打开编辑。

### Settings 与搜索

- 设置显示名称、实习开始日期、1–3 个 Current Focus、Light / Dark / System 主题以及 AI Export 默认范围。
- 左侧搜索或 `Cmd/Ctrl + K` 可搜索 Daily Log 正文、Tag、关联 Topic、关联 Project、Roadmap Topic 和 Project。
- Settings 支持完整 JSON 备份、V1/V2/V3 备份导入和输入 `RESET` 后重置。

主导航固定为 Today、Roadmap、Weekly、Projects、Settings。旧链接会自动跳转：

- `/skills` → `/roadmap`
- `/practice` → `/`
- `/notes` → `/`
- `/progress` → `/weekly`

## 技术栈

- Vite 8 + React 19 + TypeScript
- Tailwind CSS 4 + 项目设计变量
- React Router 7 + Lucide Icons
- Repository 抽象下的 `localStorage` V3 持久化
- Nginx 静态部署

这是纯前端 SPA，不包含后端、数据库、登录、云同步、游戏化机制或 AI API。

## V3 数据模型

主要模型位于 `src/types/index.ts`：

- `DailyLog`：每日工作、学习、问题、后续、Tags、Topic 和 Project 关联
- `RoadmapTopicProgress`：每个 Topic 的明确状态与更新时间
- `WeeklyReviewV3`：固定五问与四维 Growth Check
- `ProjectMilestone`：项目最小进度单元

V2 的 `Task`、`Note`、`PracticeRecord`、`Activity`、`SkillEvidence` 和旧 `WeeklyReview` 仍保留在状态与备份中，用于兼容和无损迁移，但不再出现在主产品流程中。

页面只通过 `useStudyState` 使用业务动作，不直接访问浏览器存储。`src/services/storage/repository.ts` 定义 Repository 接口，当前实现为 `LocalStorageStudyRepository`。

## V2 → V3 自动迁移

- V1 key：`study-hub:state:v1`
- V2 key：`study-hub:state:v2`
- V3 key：`study-hub:state:v3`
- 加载顺序为 V3 → V2 → V1；首次找到旧数据时生成并保存 V3 副本。
- 自动迁移不会删除或覆盖 V1/V2 原始 key。
- V2 Notes 按日期合并到 Daily Log，标题、正文、类型、Topic/Project 关联完整保留。
- 已完成 Practice 追加到同日 Daily Log，标题、Checklist 与备注完整保留。
- 旧 Task、Evidence 和原始记录继续保存在兼容数据中，不迁移成噪声日志。
- 旧 Weekly Review 映射到 V3 五问，原内容使用明确标签保留。
- Project Milestones 原样保留；已保存 Skill Level 仅用于给相关 Topic 建立初始状态。
- 损坏的某一版本不会被删除；加载器会继续寻找下一份可恢复的数据。

导入备份前，当前 V3 状态还会写入 `study-hub:state:v3:before-import` 安全快照。

## 项目结构

```text
src/
├── components/
│   ├── daily/          # Daily Log 编辑器
│   ├── roadmap/        # Topic 详情与学习状态
│   ├── search/         # 全局搜索
│   ├── weekly/         # Weekly Review 与 AI Markdown Export
│   └── ui/             # Modal、ProgressBar 等通用 UI
├── data/
│   ├── dailyTemplates.ts
│   └── roadmapV3.ts    # 6 Paths / Modules / Topics
├── hooks/              # 统一业务 Context 与 actions
├── pages/              # Today、Roadmap、Weekly、Projects、Settings
├── services/
│   ├── aiExport.ts
│   ├── v3Selectors.ts
│   └── storage/        # Repository、版本迁移与 key
├── types/
└── utils/
```

## 本地开发与验证

仓库使用 npm lockfile：

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run verify:v3
npm run build
```

`verify:v3` 覆盖 V2 数据迁移与保留、V3 Roadmap 完整性、派生统计、AI Markdown、持久化、导入安全、主路由和旧路由声明。生产文件输出到 `dist/`。

## 备份、导入与重置

- Settings → Export Backup 下载 `study-hub-v3-backup-YYYY-MM-DD.json`。
- Settings → Import Backup 支持 V3 envelope/raw state、V2 与 V1 备份，并在替换前保存安全快照。
- Reset 会列出删除范围，只有输入大写 `RESET` 才能执行。
- 数据默认只存在当前浏览器和当前设备；清理浏览器站点数据前应先导出备份。

## 部署到 study.leorxx.xyz

部署脚本会重新构建，并以 UTC 时间戳创建 release，然后原子更新 `current` 软链接。默认不 reload Nginx，也不会操作其他站点：

```bash
sudo WEB_ROOT=/var/www/study.leorxx.xyz RELOAD_NGINX=0 ./deploy/deploy.sh
```

现有 Nginx 配置保留 React Router history fallback、gzip、哈希资源长期缓存与 `index.html` 禁止长期缓存。发布后可验证：

```bash
curl -I https://study.leorxx.xyz/
curl -I https://study.leorxx.xyz/roadmap
curl -I https://study.leorxx.xyz/weekly
```

## 未来接入 Spring Boot + MySQL

1. 按 V3 聚合提供 DailyLog、TopicProgress、WeeklyReview 和 ProjectMilestone API。
2. 新建 `ApiStudyRepository`，保持页面与 Context 的业务接口不变。
3. 通过 Provider/configuration 注入 Repository，而不是让页面直接请求 API。
4. 增加一次显式的本地 V3 → API 导入；确认服务端保存成功前始终保留本地备份。
