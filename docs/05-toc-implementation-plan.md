# 文章目录（TOC）实施计划

> 关联需求：恢复旧 Hexo / NexT 博客中文章详情页左侧目录体验。
> 执行范围：仅修改新版 Astro 站点的文章详情页模板、组件与样式；不修改任何文章 Markdown 内容。

## 1. 目标

1. 文章详情页桌面端左侧显示“文章目录”，用户进入页面即可了解文章结构。
2. 目录由 Markdown 中的标题结构自动生成，优先展示 `h2` / `h3`。
3. 点击目录项可以平滑定位到对应章节。
4. 页面滚动时，当前阅读章节在目录中高亮。
5. 保持现有视觉规范：使用现有色值、圆角、字号、间距、边框和动效 token。
6. 移动端保持内容优先，不新增遮挡式目录入口，避免影响现有 375px 阅读体验。

## 2. 范围

### In Scope

- `site/src/pages/posts/[slug].astro`
- 新增 `site/src/components/PostToc.astro`
- `site/src/styles/global.css`
- 新增 TOC 专属文档、测试与验收记录

### Out of Scope

- 不修改 `site/src/content/posts/*.md`
- 不修改首页、标签页、关于页、搜索页结构
- 不引入新增运行时依赖
- 不实现移动端抽屉式 TOC（第一版移动端隐藏）
- 不实现目录手动折叠（避免增加交互复杂度）

## 3. 技术方案

### 3.1 数据生成

使用 Astro Content Collections 的 `render()` 返回的 `headings` 元数据生成目录：

- 仅保留 `depth === 2` / `depth === 3` 的标题。
- 使用 Markdown 渲染生成的 heading slug 作为锚点目标。
- 若某篇文章有效标题少于 2 个，不渲染 TOC，避免空目录或无意义导航。
- TOC 节点标记 `data-pagefind-ignore`，避免目录重复影响搜索结果。

### 3.2 页面结构

文章详情页改为：

```text
article
└── article-layout
    ├── aside / nav — 文章目录
    ├── div.prose — 原有文章正文
    └── CSS pseudo spacer — 保持正文视觉居中
```

关键原则：

- TOC 使用 `nav[aria-label="文章目录"]`。
- TOC 不进入 `data-pagefind-body`。
- 正文的原有语义结构不变。
- 文章正文仍保持 `max-width:720px`。

### 3.3 布局与响应式

| 断点 | 行为 |
| --- | --- |
| `< 1200px` | 隐藏 TOC，正文保持原有居中布局 |
| `>= 1200px` | 左侧显示 TOC，正文继续限制在 720px |
| 长目录 | TOC 内部滚动，`max-height` 不超出视口；当前章节项自动保持可见 |
| sticky 位置 | `top: 96px`，避开 64px sticky nav |

桌面端使用三列 grid：

```text
[TOC] [正文] [视觉 spacer]
```

spacer 用于让正文在视口中继续保持接近原版的水平居中，避免因为左侧目录导致正文明显右移。

### 3.4 交互与可访问性

- TOC 使用语义化 `nav` 和 `aria-label`。
- 目录项全部是可聚焦链接，键盘可用。
- 当前章节链接使用 `aria-current="location"`。
- 所有标题锚点设置 `scroll-margin-top`，避免跳转后被 sticky nav 遮挡。
- hover / active 状态使用现有蓝色 accent token。
- 目录文字对比度不低于现有 muted 文本标准。
- 长标题使用自然换行，不做截断；必要时目录内部滚动。
- 尊重 `prefers-reduced-motion`；系统减少动效时不执行平滑滚动动画。

### 3.5 滚动高亮

使用一个轻量脚本在滚动时计算当前章节：

1. 收集 TOC 中所有 heading id。
2. 以 sticky nav 高度 + 阅读缓冲作为判断线。
3. 找到最后一个已经越过判断线的标题作为当前章节。
4. 页面滚动到底部时，最后一个标题视为当前章节。
5. 当前章节变化时，TOC 内部滚动到当前项附近，避免高亮项被长目录隐藏。
6. 使用 `requestAnimationFrame` 节流，并在新事件到来时替换未执行的帧回调，避免高频 layout 读取。
7. 初始加载、resize、hashchange 时重新计算。

## 4. 风险与控制

| 风险 | 控制方式 |
| --- | --- |
| 目录导致正文偏移 | 使用 spacer 三列布局，保持 720px 正文视觉居中 |
| 标题重复导致锚点冲突 | 依赖 Markdown renderer slug；自动化测试检查重复锚点 |
| 中文标题锚点异常 | 测试包含中文、英文、标点、数字的标题 |
| 长目录遮挡内容 | 限制 TOC 高度并在内部滚动 |
| 滚动性能 | rAF 节流；只处理当前页面的有限标题集合 |
| 影响搜索结果 | TOC 设置 `data-pagefind-ignore` |
| 移动端横向溢出 | TOC 小于 1200px 时完全隐藏，运行溢出检查 |

## 5. 执行顺序

1. 创建实施计划、测试计划、验收标准。
2. 新增 `PostToc.astro`。
3. 接入文章详情页和桌面端样式。
4. 增加锚点偏移与滚动高亮脚本。
5. 执行构建与自动化测试。
6. 用 ego lite 进行桌面、平板、移动端走查。
7. 记录发现的问题与修复结果。

