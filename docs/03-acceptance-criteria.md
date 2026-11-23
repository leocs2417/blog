# 验收文档（Acceptance Criteria）

> 验收人：Leo（需求方）
> 执行依据：《01-implementation-plan.md》《02-test-plan.md》全部用例通过

## A. 功能验收（对照需求逐条）

| # | 需求 | 验收标准 | 状态 |
|---|---|---|---|
| A1 | 换框架（Astro） | Astro 稳定版工程，`npm run build` 可重复成功 | ☐ |
| A2 | URL 保留 `/blog/` 前缀 | 所有页面路径带 `/blog/`，直接访问可用 | ☐ |
| A3 | 短 slug | 17 篇文章全部使用语义化短 slug（见映射表） | ☐ |
| A4 | 文章日期全站隐藏 | 首页/详情/标签页 DOM 中无发布日期；旧链接跳转页不受影响 | ☐ |
| A5 | 归档隐藏 | 无归档页面与导航入口，旧 `/archives/` 路径 404/跳转首页 | ☐ |
| A6 | 搜索入口 | 导航搜索按钮 + 弹层可用，中文关键词可检索 | ☐ |
| A7 | 标签单页结构 | 默认全部文章+分页；`/tags/[tag]/` 筛选态；pill active 态与 URL 绑定 | ☐ |
| A8 | 文章页标签跳转 | 详情页标签 → 标签页且自动选中高亮 | ☐ |
| A9 | 作品集 1 张占位卡片 | 首页仅一张卡，文案为占位内容 | ☐ |
| A10 | Footer 固定底部 | sticky footer；GitHub 链接带 logo；ICP 备案号保留 | ☐ |
| A11 | 外部链接仅 GitHub+Email | Hero 与关于页仅此两个外部链接 | ☐ |

## B. 内容验收（每篇文章逐项打勾，17 篇 × 9 项）

以《02-test-plan.md》§2 T-C01~T-C09 为准，验收方式：

1. 脚本自动比对（标题/结构/代码块/特殊字符/字数）
2. 每篇双端截图人工抽验
3. **重点篇目人工精读**（历史踩坑高危）：
   - `ES6变量声明&不同For循环中const的区别`（标题含 `&`）
   - `Vue中，v-if和v-show的区别`（标题尾部 `.md` 残留需清理）
   - 含大段代码的文章（nextTick、防抖节流、Virtual DOM）
   - 含图片的文章

| slug | T-C01 | T-C02 | T-C03 | T-C04 | T-C05 | T-C07 | T-C08 | T-C09 | 人工 |
|---|---|---|---|---|---|---|---|---|---|
| const-in-for-loops | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| object-create-vs-object-literal | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| react-virtual-dom | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| ssh-passwordless-login | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| vue-nexttick-implementation | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| vue-v-if-vs-v-show | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| vue-computed-vs-methods-vs-watch | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| exports-vs-module-exports | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| package-json-deps-vs-devdeps | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| console-log-evaluated-just-now | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| browser-working-principles | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| debounce-and-throttle | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| optimize-mobile-loading | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| high-performance-long-list | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| sublime-package-control-fix | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| node-sequelize-remote-mysql | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| single-sign-on-sso | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

## C. 样式验收（对照视觉稿）

| # | 验收项 | 标准 | 状态 |
|---|---|---|---|
| C1 | 设计 Token | 色值/字号/圆角/间距与 §6 token 表一致 | ☐ |
| C2 | 页面还原 | 7 类页面与 `design/preview/` 对应截图一致（允许像素级 2px 内误差） | ☐ |
| C3 | 交互还原 | hover（列表变蓝/卡片上浮/按钮加深）、搜索弹层、分页可操作 | ☐ |
| C4 | 响应式 | 375/768/1440 三档无横向滚动，布局与移动端视觉稿一致 | ☐ |
| C5 | ui-ux-pro-max 规范 | 对比度 4.5:1、aria-label、focus 可见、reduced-motion、无 emoji 图标、SVG 图标体系统一 | ☐ |

## D. 工程与部署验收

| # | 验收项 | 标准 | 状态 |
|---|---|---|---|
| D1 | Hexo 零改动 | master 分支 Hexo 文件与迁移前一致 | ☐ |
| D2 | 测试可重复 | `npm run test:all` 一键执行并产出报告 | ☐ |
| D3 | GitHub Pages | workflow 构建成功，`/blog/` 前缀页面可访问 | ☐ |
| D4 | 服务器部署脚本 | `scripts/deploy-server.sh` 支持目标服务器 rsync 发布（含重试与版本回退说明） | ☐ |
| D5 | 旧链接兼容 | 抽样 3 个旧 URL 正确跳转新文章 | ☐ |

## E. 验收流程

1. 执行方跑完全部测试并提交报告 + 截图
2. Leo 按本表抽验（内容抽 3 篇精读 + 移动端全页面走查）
3. 全部勾选后合并回 master，保留 Hexo 目录一个版本周期后清理

## F. Reviewer 本地执行记录（2026-11-23）

### 结论

- 自动化测试：**205/205 通过**（`site/test-results/report.md`）。
- ego lite 本地走查：**通过**，覆盖 375 / 768 / 1440 三档、6 类核心页面、17 篇文章详情、搜索、标签、分页、旧链接、404、footer。
- D3 GitHub Pages 部署需合并后由 GitHub Actions 实际触发验证；本次仅完成 workflow 与构建产物静态校验。

### Reviewer 发现并修复项

| # | 问题 | 影响 | 修复 | 回归结果 |
|---|---|---|---|---|
| R1 | React Virtual DOM 末尾嵌套列表缩进异常 | `场景 / 改善 / 注` 下的列表被渲染成代码块 | 规范化 Markdown 缩进层级；新增 `no list rendered as code` 用例 | 17 篇文章全部无列表误渲染 |
| R2 | Pagefind 索引包含首页与标签页 | 搜索结果标题/摘要错位，噪音多 | 文章正文加 `data-pagefind-body`，标题加 `data-pagefind-meta` | 索引数量 17/17，搜索“防抖”只返回文章 |
| R3 | 搜索键盘导航丢失选中态 | ↑/↓ 后 Enter 不跳转，交互不符合视觉稿 | 修复 `clearCurrent()` 与索引重置逻辑，首条默认选中 | ↑/↓/↵ 自动化通过 |

### Reviewer 走查矩阵

| 范围 | 结果 |
|---|---|
| 首页结构 / 作品集占位 / 无日期 / footer | ✅ |
| 导航 active / 无归档 / 无 RSS / GitHub logo | ✅ |
| 标签默认列表分页 / 筛选态高亮 / URL 绑定 | ✅ |
| 文章页标签 → 标签页并高亮 | ✅ |
| 全部 17 篇文章内容、图片、代码块、上一篇/下一篇 | ✅ |
| 搜索打开/命中/高亮/首条选中/↑↓/↵/ESC | ✅ |
| 375 / 768 / 1440 无横向滚动 | ✅ |
| 404 / 关于 / 旧链接跳转 | ✅ |
| 构建 + 一键测试 | ✅ |
