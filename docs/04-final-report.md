# 迁移执行报告

> 分支：`codex/astro-blog-migration` · 日期：2026-11-23
> 测试结论：**205/205 全部通过**（site/test-results/report.md）；reviewer 已用 ego lite 完成 375 / 768 / 1440 本地走查

## 实际交付

| 模块 | 说明 |
|---|---|
| `site/` | Astro v7.4.13 工程（Node ≥ 22.23.4，CI 用 Node 24） |
| 内容 | 17 篇文章迁移完成，frontmatter 规范化 + 短 slug，图片全部本地化 |
| 页面 | 首页 / 文章详情 / 标签页（默认+筛选态）/ 关于 / 404，无归档 |
| 搜索 | Pagefind（17 篇文章页，5573 词），导航按钮 + 弹层（首条默认选中、↑↓/↵/ESC） |
| 旧链接 | 17 个 meta-refresh 跳转页 + `dist/redirect-map.json` |
| 部署 | `.github/workflows/deploy-pages.yml` + `scripts/deploy-server.sh` |

## 执行过程中发现并修复的问题（体现"文档解析完全没问题"的要求）

1. **smartypants 排版转换破坏技术文本**：Astro 默认把 `...`→`…`、`--`→`–`、直引号→弯引号（如 "for...in" 变 "for…in"、"--save-dev" 变 "–save-dev"）→ 已关闭 `smartypants`
2. **正文裸 HTML 被当作真实元素渲染**：v-if 文章中未包代码栅栏的 `<template>` 模板块、浏览器文章中会被真实加载的 `<img src=xxx.com>`（老博客遗留问题）→ 迁移脚本对栅栏外裸 HTML 统一转义显示（行内代码、块引用、箭头符号不受影响）
3. **移动端溢出**：正文长 URL 无断行点 → 按 ui-ux-pro-max `long-token-wrapping` 规范用 `overflow-wrap:anywhere` 修复
4. **代码块换行/语言高亮**：Shiki github-dark 主题，`white-space:pre` 保证换行
5. **React Virtual DOM 嵌套列表被渲染成代码块**：reviewer 全量走查发现末尾 `场景 / 改善 / 注` 下方的列表行进入 `<pre>` → 已规范化 Markdown 缩进，并新增自动用例 `no list rendered as code`
6. **搜索索引包含标签页/首页**：导致结果标题与摘要不匹配 → 给文章正文增加 `data-pagefind-body`、给标题增加 `data-pagefind-meta`，Pagefind 仅索引 17 个文章页
7. **搜索键盘导航失效**：`clearCurrent()` 在 ↑/↓ 后把索引重置为 -1，导致选中态丢失；且首条结果不自动选中 → 已修复并补充 ↑/↓/↵ 自动测试

## 已知源文件格式说明

- 老博客 Hexo 产物中 `React Virtual DOM` HTML 为 0 字节（Hexo 对含空格路径的异常），无法直接比对；新站文本完整，末尾嵌套列表已规范化。
- Hexo 源目录零改动；本次 reviewer 修复只落在 `site/` 内。

## 验证摘要

- 内容逐篇：标题/章节/代码块/行内代码/转义/字数覆盖/无日期 → 全部通过
- 布局：375 / 768 / 1440 三档溢出检查（6 类核心页面 + 全部文章页）→ 全部通过
- 交互：搜索命中、标签筛选高亮、分页、旧链接跳转、footer sticky → 全部通过
- 截图存证：`site/test-results/`（每篇双端截图 + 搜索弹层）及 `site/test-results/review/`
- reviewer 本地走查：首页 / 标签默认与筛选 / 分页 / 全部 17 篇文章 / 关于 / 404 / 旧链接 / 移动端与平板 → 通过

## 待需求方验收

按《03-acceptance-criteria.md》执行；重点人工抽验 3 篇（const-in-for-loops / vue-v-if-vs-v-show / browser-working-principles）+ 移动端走查。
