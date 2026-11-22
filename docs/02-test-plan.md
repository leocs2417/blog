# 迁移测试文档

> 关联：《01-implementation-plan.md》《03-acceptance-criteria.md》
> 工具：Playwright（或 puppeteer-core + 系统 Chrome）+ Node 脚本，全部可重复执行

## 1. 构建期测试（T-Build）

| ID | 用例 | 通过标准 |
|---|---|---|
| T-B01 | `npm run build` | 退出码 0，无 Astro 报错/警告阻断 |
| T-B02 | 文章全部渲染 | `src/content/posts` 中每篇 md 生成对应 `posts/<slug>/index.html`，数量一致 |
| T-B03 | frontmatter 完整性 | 每篇含 title/slug/tags/date，date 仅用于排序不输出到 DOM |
| T-B04 | 内链完整性 | 全站 HTML 中内部链接（含 base 前缀）无 404（脚本抓取校验） |
| T-B05 | 图片完整性 | 所有 `<img>` src 可解析、文件存在，含 `alt` |
| T-B06 | 搜索索引 | `pagefind` 运行成功，`pagefind/pagefind-entry.json` 生成，抽样词可命中 |
| T-B07 | 旧链接跳转页 | §4 每个旧路径存在 index.html 且含 meta-refresh 指向新 slug |

## 2. 内容解析测试（T-Content，逐篇）

**背景**：需求方明确要求"文档解析要完全没问题，不要显示错乱"。以下对每篇文章执行：

| ID | 用例 | 通过标准 |
|---|---|---|
| T-C01 | 标题渲染 | `<h1>` 与 frontmatter title 完全一致（含中英文、标点、`?`） |
| T-C02 | 正文结构 | 章节数（h2/h3 数量）与 Markdown 源文件一致 |
| T-C03 | 代码块 | 每个代码块渲染为 `<pre><code>`，换行保留（`white-space:pre`）、语言 class 正确、无 HTML 转义错乱（如 `&lt;` 直接可见于文本） |
| T-C04 | 行内代码 | `` `code` `` 均转为 `<code>`，无残留反引号 |
| T-C05 | 列表/引用 | ul/ol/blockquote 结构还原，缩进层级正确 |
| T-C06 | 表格 | 渲染为 `<table>`，无错位（如有表格） |
| T-C07 | 特殊字符 | 标题含 `&`、`()`、中英文混排正常显示与换行 |
| T-C08 | 字数比对 | 渲染页纯文本长度 ≥ 源文件正文长度 × 0.8（防大段内容丢失） |
| T-C09 | 截图存证 | 每篇详情页桌面(1440)+移动(375)全页截图存至 `site/test-results/posts/<slug>/` |

## 3. 页面/交互测试（T-Page）

| ID | 用例 | 通过标准 |
|---|---|---|
| T-P01 | 首页结构 | Hero（头像/简介/GitHub+Email chips）、1 张作品集占位卡、最新文章列表、无日期显示 |
| T-P02 | 标签页默认态 | pill 列表 + 全部文章（8/页）+ 分页器可翻页 |
| T-P03 | 标签筛选态 | `/tags/<tag>/` 仅显示该标签文章，对应 pill active 高亮（与 URL 绑定） |
| T-P04 | 文章页标签跳转 | 点击详情页标签 → 落地 `/tags/<tag>/` 且高亮筛选正确 |
| T-P05 | 搜索 | 导航图标打开弹层；输入关键词有结果且高亮；ESC 关闭；↑↓ 可切换 |
| T-P06 | 404 | 访问不存在路径渲染 404 页 |
| T-P07 | Footer | 内容不足一屏（404/搜索态）时 footer 贴住视口底部；GitHub 链接带 logo |
| T-P08 | 导航 | 无「归档」入口；active 态随页面正确切换 |
| T-P09 | 旧链接跳转 | 抽样打开旧路径 URL，1s 内 meta-refresh 到新文章页 |

## 4. 布局与规范测试（T-Layout，依 ui-ux-pro-max）

| ID | 用例 | 通过标准 |
|---|---|---|
| T-L01 | 溢出检查 | 375 / 768 / 1440 三档：`scrollWidth == clientWidth`，无越界元素（代码块滚动容器内部除外） |
| T-L02 | 对比度 | 正文 ≥ 4.5:1；辅助文字 muted `#475569` on `#FAFAFA` ≥ 4.5:1 |
| T-L03 | 可访问性 | 图标按钮有 `aria-label`；focus 可见；键盘可遍历导航/搜索弹层 |
| T-L04 | 动效降级 | `prefers-reduced-motion: reduce` 下无 transition |
| T-L05 | 视觉还原 | 与 `design/preview/*-desktop.png` 关键区块（Nav/Hero/作品集/文章列表/分页/Footer）对比一致；字号、间距、色值与 §6 token 匹配 |
| T-L06 | 触控目标 | 移动端可点击元素 ≥ 24px（chips/pager/搜索按钮 ≥ 36px） |

## 5. 回归测试（T-Reg）

| ID | 用例 | 通过标准 |
|---|---|---|
| T-R01 | Hexo 零改动 | master 分支 Hexo 文件（`_config.yml`、`source/`、`themes/`）与迁移前 diff 为空 |
| T-R02 | 构建可重复 | clean build 两次产物 diff 仅时间戳差异 |

## 6. 执行方式

- 所有用例脚本化存放于 `site/tests/`，一条命令跑全量：`npm run test:all`
- 测试报告输出 `site/test-results/report.md`（含每篇截图路径、失败项明细）
- 任一用例失败 → 修复后全量重跑
