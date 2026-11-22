# 博客迁移实施计划（Hexo → Astro）

> 分支：`codex/astro-blog-migration`
> 视觉基准：`design/`（pages/ 下各页面 + mockup.css 共享样式）
> 设计规范：ui-ux-pro-max（Minimalism & Swiss Style，设计系统见 design 会话输出）

## 1. 目标与范围

将现有 Hexo 3.9 + NexT 博客迁移为 Astro 静态博客，完成 17 篇（以 `source/_posts` 实际数量为准）文章的完整迁移与逐篇验证。

**范围外（本期不做）**：暗色模式（P2）、RSS feed 链接（UI 已按要求移除）、评论系统、归档页（产品决策：隐藏）。

## 2. 目录结构

```
site/                  # Astro 工程（新增，不动 Hexo 原文件直至验收通过）
  src/
    content/posts/     # 文章 Markdown（frontmatter: title/slug/tags/description）
    components/        # Nav / Footer / PostList / TagPills / SearchButton ...
    layouts/           # BaseLayout / PostLayout
    pages/
      index.astro          # 首页（Hero + 1 张作品集占位卡 + 最新文章）
      posts/[slug].astro   # 文章详情
      tags/index.astro     # 标签页（pill 列表 + 全部文章分页）
      tags/[tag].astro     # 标签筛选态（/tags/vue/）
      about.astro
      404.astro
    styles/            # 全局样式（自 mockup.css 移植，CSS 变量 token 化）
  public/              # 头像、favicon、CNAME
```

## 3. 关键决策（已与需求方确认）

| 决策点 | 结论 |
|---|---|
| base path | 保留 `/blog/`（Astro `base: '/blog'`） |
| 文章 slug | 短语义化 slug，见 §4 映射表 |
| 日期 | 全站隐藏（frontmatter 保留用于排序/sitemap） |
| 归档 | 页面与导航入口均移除 |
| 搜索 | Pagefind（构建期索引，零运行时依赖），导航栏图标 + 弹层 UI |
| 标签页 | 单页结构：默认全部文章 + 分页（8/页）；`/tags/[tag]/` 为筛选态，pill active 态与 URL 绑定 |
| 文章页标签 | 链接至 `/tags/[tag]/`，落地即高亮筛选 |
| 作品集 | 首页仅 1 张占位卡片 |
| Footer | sticky footer（内容不足一屏时贴住视口底部），GitHub 链接带 octocat logo |
| 部署 | 双轨：GitHub Pages（同步保留）+ 服务器部署脚本（rsync），ICP 通过后绑自有域名 |

## 4. Slug 映射表（旧 URL → 新 URL）

| 原文件/URL | 新 slug |
|---|---|
| ES6变量声明&不同For循环中const的区别 | `const-in-for-loops` |
| Object.create()和{}的区别 | `object-create-vs-object-literal` |
| React Virtual DOM | `react-virtual-dom` |
| SSH设置无密码和使用别名登录Linux服务器 | `ssh-passwordless-login` |
| Vue中的nextTick的实现原理 | `vue-nexttick-implementation` |
| Vue中，v-if和v-show的区别 | `vue-v-if-vs-v-show` |
| Vue中，计算属性vs方法vs侦听属性 | `vue-computed-vs-methods-vs-watch` |
| exports和module.exports的区别 | `exports-vs-module-exports` |
| package.json中dependencies和devDependencies的区别 | `package-json-deps-vs-devdeps` |
| value below was evaluated just now | `console-log-evaluated-just-now` |
| 浏览器的工作原理及JS的运行机制 | `browser-working-principles` |
| 防抖与节流的简单实现 | `debounce-and-throttle` |
| 如何优化Web移动端的加载速度 | `optimize-mobile-loading` |
| 如何高性能渲染长列表 | `high-performance-long-list` |
| 新版Sublime Text3的Package Control打不开的问题 | `sublime-package-control-fix` |
| 使用Node.js Sequelize操作CentOS远程服务器的Mysql | `node-sequelize-remote-mysql` |
| 单点登录(SSO) | `single-sign-on-sso` |

旧 URL 兼容：构建时为每个旧路径生成 meta-refresh 跳转页（`/blog/YYYY/MM/DD/<原标题>/index.html` → 新 slug），并输出映射表 `site/dist/redirect-map.json` 供服务器 nginx 兜底。

## 5. 实施步骤

1. **S1 环境与脚手架**：`site/` 初始化 Astro（TS strict），配置 base、site URL、Pagefind、分页
2. **S2 内容迁移**：脚本化转换 `_posts` → `src/content/posts`（frontmatter 规范化 + slug 映射 + 资源路径修正），含特殊字符标题（`&`、括号、中文）验证
3. **S3 布局与组件**：BaseLayout（Nav/Footer/sticky footer）、PostList、TagPills、分页组件
4. **S4 页面实现**：index / posts/[slug] / tags(+[tag]) / about / 404，样式 1:1 对齐 mockup（token 见 §6）
5. **S5 搜索**：Pagefind 集成，导航搜索按钮 + 弹层（↑↓/↵/ESC 快捷键）
6. **S6 验证**：按《02-test-plan.md》执行逐篇验证 + 三断点溢出检查 + 视觉对比
7. **S7 部署脚本**：GitHub Actions（Pages）+ `scripts/deploy-server.sh`（rsync）
8. **S8 旧链接跳转页** + redirect-map

## 6. 设计 Token（自 mockup.css 提取）

| Token | 值 |
|---|---|
| `--bg` | `#FAFAFA` |
| `--fg` | `#09090B` |
| `--muted` | `#475569` |
| `--card` | `#FFFFFF` |
| `--border` | `#E4E4E7` |
| `--accent` | `#2563EB` |
| `--accent-fg` | `#FFFFFF` |
| `--radius` | `12px` |
| `--maxw` | `1120px` |
| 字体 | Archivo（标题）+ Space Grotesk / PingFang SC 中文回退 |
| 动效 | 200–250ms transition；`prefers-reduced-motion` 全局降级 |

## 7. 风险与对策

| 风险 | 对策 |
|---|---|
| 中文标题/特殊字符（`&`、`()`）导致路由异常 | slug 全部 ASCII 化；原文件名仅作 frontmatter title |
| 文章内代码块含 HTML 被误解析 | marked/remark 默认转义；逐篇人工+脚本比对 |
| 文章图片相对路径失效 | 迁移脚本统一改写为 `public/assets/...` 绝对路径并断链检查 |
| 旧链接失效 | §4 meta-refresh 跳转页 + redirect-map |
| node 依赖与 Astro 版本兼容 | Astro v7 要求 Node >= 22.23.4（本机 nvm v24.12.0），CI 使用 Node 24，lockfile 提交 |
