# 迁移执行报告

> 分支：`codex/astro-blog-migration` · 日期：2026-11-23
> 测试结论：**184/184 全部通过**（site/test-results/report.md）

## 实际交付

| 模块 | 说明 |
|---|---|
| `site/` | Astro v7.4.13 工程（Node ≥ 22.23.4，CI 用 Node 24） |
| 内容 | 17 篇文章迁移完成，frontmatter 规范化 + 短 slug，图片全部本地化 |
| 页面 | 首页 / 文章详情 / 标签页（默认+筛选态）/ 关于 / 404，无归档 |
| 搜索 | Pagefind（34 页 5753 词），导航按钮 + 弹层（↑↓/↵/ESC） |
| 旧链接 | 17 个 meta-refresh 跳转页 + `dist/redirect-map.json` |
| 部署 | `.github/workflows/deploy-pages.yml` + `scripts/deploy-server.sh` |

## 执行过程中发现并修复的问题（体现"文档解析完全没问题"的要求）

1. **smartypants 排版转换破坏技术文本**：Astro 默认把 `...`→`…`、`--`→`–`、直引号→弯引号（如 "for...in" 变 "for…in"、"--save-dev" 变 "–save-dev"）→ 已关闭 `smartypants`
2. **正文裸 HTML 被当作真实元素渲染**：v-if 文章中未包代码栅栏的 `<template>` 模板块、浏览器文章中会被真实加载的 `<img src=xxx.com>`（老博客遗留问题）→ 迁移脚本对栅栏外裸 HTML 统一转义显示（行内代码、块引用、箭头符号不受影响）
3. **移动端溢出**：正文长 URL 无断行点 → 按 ui-ux-pro-max `long-token-wrapping` 规范用 `overflow-wrap:anywhere` 修复
4. **代码块换行/语言高亮**：Shiki github-dark 主题，`white-space:pre` 保证换行

## 已知源文件格式 quirk（非迁移引入，保持与原渲染一致）

- `React Virtual DOM` 等个别文章存在缩进异常的列表段落（4 空格缩进的 "- xxx" 行），按 CommonMark 规则渲染为普通文本；与 Hexo/marked 行为一致，文本内容无丢失
- 老博客 Hexo 产物中该文章 HTML 为 0 字节（Hexo 对含空格路径的异常），无法直接比对；新站文本完整

## 验证摘要

- 内容逐篇：标题/章节/代码块/行内代码/转义/字数覆盖/无日期 → 全部通过
- 布局：375/768/1440 三档溢出检查（34 个页面 + 全部文章页）→ 全部通过
- 交互：搜索命中、标签筛选高亮、分页、旧链接跳转、footer sticky → 全部通过
- 截图存证：`site/test-results/`（每篇双端截图 + 搜索弹层）

## 待需求方验收

按《03-acceptance-criteria.md》执行；重点人工抽验 3 篇（const-in-for-loops / vue-v-if-vs-v-show / browser-working-principles）+ 移动端走查。
