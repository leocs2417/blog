# 文章目录（TOC）测试计划

> 目标：验证左侧目录功能、布局、交互与可访问性，同时确认未修改文章内容。

## 1. 构建与内容安全

| ID | 用例 | 通过标准 |
| --- | --- | --- |
| T-TOC-B01 | 构建 | `npm run build` 成功，无 Astro 渲染错误 |
| T-TOC-B02 | 文章内容零修改 | `git diff` 不包含 `site/src/content/posts/*.md` 的正文/frontmatter 变更 |
| T-TOC-B03 | 页面数量 | 文章详情页数量仍为 19，路由不变 |
| T-TOC-B04 | 搜索影响 | TOC 带 `data-pagefind-ignore`，Pagefind 文章索引数量不变 |

## 2. 数据与结构

| ID | 用例 | 通过标准 |
| --- | --- | --- |
| T-TOC-D01 | 有效目录 | 有 2 个及以上 `h2` / `h3` 的文章生成 TOC |
| T-TOC-D02 | 空目录 | 有效标题少于 2 个的文章不渲染 TOC |
| T-TOC-D03 | 层级 | 目录正确区分 `h2` 与 `h3`，层级视觉可识别 |
| T-TOC-D04 | 锚点 | 每个目录链接的目标 heading id 存在且唯一 |
| T-TOC-D05 | 标题文本 | 目录文本与源 Markdown 标题一致，不显示 Markdown 语法残留 |
| T-TOC-D06 | 中文标题 | 中文、标点、英文混排标题可定位 |
| T-TOC-D07 | 长标题 | 长标题自然换行，不造成页面横向溢出 |
| T-TOC-D08 | 语义结构 | TOC 使用 `nav[aria-label="文章目录"]` 和列表结构 |

## 3. 布局与视觉

| ID | 用例 | 通过标准 |
| --- | --- | --- |
| T-TOC-L01 | 桌面显示 | 1440px 左侧显示 TOC，正文宽度保持约 720px |
| T-TOC-L02 | 正文居中 | TOC 不导致正文明显右移，页面视觉平衡 |
| T-TOC-L03 | sticky | 滚动时 TOC 固定在 nav 下方，不跟随长文滚走 |
| T-TOC-L04 | 长目录 | 目录高度超出视口时内部滚动；高亮项始终可见，不遮挡正文/footer |
| T-TOC-L05 | 平板 | 1024px 或更窄视口下 TOC 隐藏，正文无残留空白列 |
| T-TOC-L06 | 移动端 | 375px 下 TOC 不渲染显示，无横向滚动 |
| T-TOC-L07 | footer | TOC 不遮挡 footer；footer 仍保持页面底部 |
| T-TOC-L08 | 样式一致性 | 色值、圆角、边框、字号、间距使用现有设计 token |

## 4. 交互测试

| ID | 用例 | 通过标准 |
| --- | --- | --- |
| T-TOC-I01 | 初始状态 | 首次进入文章页面 TOC 可见 |
| T-TOC-I02 | 点击跳转 | 点击目录项跳转到对应标题 |
| T-TOC-I03 | 遮挡控制 | 跳转后标题不被 sticky nav 遮挡 |
| T-TOC-I04 | 滚动高亮 | 向下滚动时当前章节链接高亮 |
| T-TOC-I05 | 反向滚动 | 向上滚动时高亮项回退到上一章节 |
| T-TOC-I06 | 底部状态 | 滚动到最后时最后一个目录项高亮 |
| T-TOC-I07 | 长目录跟随 | 滚动到底部时，最后一个高亮项自动滚动到 TOC 可视区域内 |
| T-TOC-I08 | 键盘导航 | Tab 可进入 TOC，链接 focus 态可见 |
| T-TOC-I09 | anchor直达 | 直接访问 `#heading-id` 可正确定位 |
| T-TOC-I10 | reduced motion | `prefers-reduced-motion: reduce` 下滚动行为可降级且功能正常 |

## 5. 回归测试

| ID | 用例 | 通过标准 |
| --- | --- | --- |
| T-TOC-R01 | 原有测试 | `node tests/run-all.mjs` 全部通过 |
| T-TOC-R02 | 文章解析 | 标题、正文、代码块、图片、表格、上一篇/下一篇不受影响 |
| T-TOC-R03 | Pagefind | 搜索功能继续可用，结果不被 TOC 污染 |
| T-TOC-R04 | 标签跳转 | 文章页标签跳转行为不变 |
| T-TOC-R05 | 全站布局 | 首页、标签页、关于页、404 无布局回归 |

## 6. 执行方式

1. 先执行 `npm run build`。
2. 执行 `npm run test:all`。
3. 启动 `npm run preview -- --host --port 4321`。
4. 用 ego lite 打开代表性文章与所有文章做结构抽验。
5. 在 375 / 1024 / 1440 视口分别检查布局与交互。
6. 所有截图保存在 `site/test-results/review/`。

