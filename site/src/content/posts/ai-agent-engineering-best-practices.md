---
title: "2026 年 AI Agent 工程实践：从需求到可靠交付"
slug: "ai-agent-engineering-best-practices"
date: "2026-11-23"
tags:
  - AI
  - Agent
  - Engineering
  - Best Practices
categories:
  - AI
description: "从场景判断、Agent 架构、系统与数据接入，到 Coding Agent 协作、测试、Git 工作流和生产运维，整理一套面向真实项目的 AI Agent 工程实践。"
---

AI Agent 的发展速度很快。模型能力、工具调用、MCP、Agent Skills、Coding Agent 和各类 Agent 框架都在快速演进。今天，从零做出一个能调用工具、查询数据、完成多步骤任务的 Agent，门槛已经比过去低了很多。

但**能运行的 Demo，不等于可靠的产品；能生成代码，也不等于完成了工程交付。**

我是一名前端工程师，也正在把自己的工作重心逐步延伸到 Agent 应用开发。过去的软件工程经验让我越来越确信：Agent 开发并不是抛弃传统工程方法，而是在传统工程之上，增加模型的不确定性、上下文管理、工具权限、质量评估和运行时治理。

这篇文章不打算罗列所有框架和新名词，而是围绕一个更实际的问题展开：**在 AI Agent 快速发展的今天，如何正确、高效地开发和使用 Agent，并把它交付为一个长期可维护的系统？**

文中涉及的生态信息以 **2026 年 11 月**为观察时间。具体 SDK、模型和协议仍会继续变化，技术选型应以项目需求和官方最新文档为准。

---

## 1. 先判断：这个问题真的需要 Agent 吗？

最容易犯的错误，是先决定使用 Agent，再反过来寻找适合它的场景。

并不是所有 AI 功能都需要 Agent。一个系统如果只需要根据输入生成一段文本，普通模型调用可能已经足够；如果业务步骤固定、输入输出明确，确定性的 Workflow 通常更容易测试和维护；只有当任务需要模型根据上下文选择动作、调用工具、观察结果，并在必要时调整后续步骤时，Agent 的自主执行能力才真正有价值。

可以先用下面的方式区分：

| 形态 | 典型特征 | 更适合的场景 |
| --- | --- | --- |
| 普通 LLM 调用 | 输入一次、生成一次 | 文本生成、摘要、分类、改写 |
| RAG 应用 | 检索相关资料，再生成答案 | 企业知识问答、文档检索 |
| Workflow | 步骤和分支由代码预先定义 | 审批、固定业务流程、数据同步 |
| Agent | 模型可以根据任务和执行结果选择下一步动作 | 开放式任务、工具选择、多步骤探索和执行 |

这不是绝对的分类。一个产品可以同时包含确定性 Workflow、RAG 和 Agent：外层由代码控制权限、步骤和状态，模型只在需要理解、判断或选择动作的位置参与。

### 哪些情况值得引入 Agent？

我会重点检查以下条件：

1. **任务路径不是完全固定的。** 面对不同输入，系统需要选择不同工具或执行步骤。
2. **需要基于执行结果继续决策。** 例如先查询订单，再根据订单状态决定是否创建售后工单。
3. **自然语言理解能显著降低使用门槛。** 用户不必记住复杂的命令、筛选条件或操作路径。
4. **模型的判断空间可以被约束。** 可以定义可用工具、输入结构、权限、停止条件和人工审批点。
5. **Agent 带来的收益大于额外复杂度。** 它能节省人力、缩短流程，或完成传统自动化难以覆盖的任务。

如果只是一个固定的三步流程，不要为了“Agent 化”把三步都交给模型。**确定性逻辑应该留在代码里，不确定性才交给模型处理。**

## 2. 从零开始构建 Agent：先定义任务，再设计架构

不要从“选哪个 Agent 框架”开始。先把任务说清楚，再决定需要哪些模型能力、工具和运行时机制。

### 2.1 先写清楚 Agent 的任务契约

在写代码之前，至少要回答这些问题：

- **目标用户是谁？** 谁会使用它，使用场景是什么？
- **它负责什么？** 明确具体任务，而不是笼统地写“成为一个智能助理”。
- **输入是什么？** 自然语言、结构化参数、文件、历史会话，还是外部事件？
- **输出是什么？** 自然语言回答、结构化结果，还是实际执行的业务动作？
- **允许做什么？** 可以读取哪些数据、调用哪些工具、修改哪些资源？
- **不允许做什么？** 哪些操作必须拒绝、转人工或二次确认？
- **怎样才算完成？** 用可观察、可测试的验收标准描述成功。

例如，“帮用户处理订单问题”不是足够清晰的需求。可以进一步明确：

> Agent 可以查询当前登录用户有权访问的订单，解释订单状态，并根据售后规则创建售后申请。它不能直接修改支付金额、取消已经发货的订单，也不能绕过用户身份校验。创建售后申请前，需要向用户展示申请内容并取得确认。

这种描述会直接影响工具设计、权限边界、提示词、测试用例和用户交互。

### 2.2 一个最小可用的 Agent 架构

一个可落地的 Agent 应用，通常至少包含以下部分：

```text
用户 / 前端界面
      |
      v
应用服务层（身份、租户、会话、限流）
      |
      v
Agent Runtime / Orchestrator
      |                 \
      |                  \---- 状态、会话与记忆
      |
      +---- Model Adapter ---- 模型供应商
      |
      +---- Tools ---------- 业务 API / MCP / 外部服务
      |
      +---- Retrieval ------ 数据库 / 文档 / 搜索 / RAG
      |
      +---- Guardrails ----- 权限、校验、审批与策略
      |
      v
Trace / Logs / Metrics / Evaluation
```

这里最重要的不是组件数量，而是职责边界：

- **应用服务层**负责用户身份、租户隔离、会话归属、限流和应用级权限。
- **Agent Runtime**负责模型调用循环、工具调度、上下文组织、停止条件和执行状态。
- **Model Adapter**负责供应商接入、模型配置、超时和必要的降级策略。
- **Tools**负责把模型意图转化成受控的业务操作。
- **Retrieval**负责按权限获取相关数据，而不是把所有数据直接塞进 Prompt。
- **Guardrails**负责在关键边界进行校验、拦截、审批或转人工。
- **Observability / Evaluation**负责记录执行过程，并判断行为是否达到预期。

初期不必拆成很多微服务。可以先在一个后端应用内按模块组织，等到并发、团队协作、隔离性或独立扩展需求出现时再拆分。

### 2.3 理解 Agent 的执行闭环

一个基础 Agent 循环通常可以抽象为：

1. 接收用户任务和必要上下文。
2. 模型理解任务，决定直接回答还是调用工具。
3. 应用校验工具名称、参数、权限和风险等级。
4. 执行工具，并把结果返回给模型。
5. 模型根据工具结果继续执行、调整计划或结束任务。
6. 应用检查停止条件，返回最终结果并记录 Trace。

需要明确的是：模型提出工具调用，不代表工具调用就应该被执行。**模型负责提出候选动作，应用服务负责验证和执行。** 不要把权限判断只写在 Prompt 中。

OpenAI 的 [Building agents](https://developers.openai.com/tracks/building-agents) 和 [Agents SDK](https://developers.openai.com/api/docs/guides/agents/sdk) 将 Agent 的核心能力拆分为模型、指令、工具、状态、编排、Guardrails 和可观测性。这种组合式思路值得参考，但不代表每个项目都必须使用同一个 SDK。

### 2.4 从单 Agent 开始，不要过早 Multi-Agent

Multi-Agent 很容易在架构图上显得强大，但每增加一个 Agent，就可能增加一次模型调用、一段上下文传递、一种状态协调和一个潜在故障点。

我更倾向于按以下顺序演进：

1. 先使用一个 Agent，明确它的工具和任务边界。
2. 当流程稳定后，把确定性步骤抽离为代码或 Workflow。
3. 只有在职责确实独立、上下文需要隔离、任务可以并行，或需要不同权限边界时，再考虑拆分 Agent。
4. 拆分后用实际数据验证收益，例如任务成功率、延迟、成本、可维护性是否改善。

不要因为某个框架支持 Multi-Agent，就把它当作默认架构。

## 3. 基于现有系统和数据构建 Agent，而不是推倒重来

真实项目里，Agent 通常不是从一张白纸开始。企业已经有用户体系、订单系统、CRM、知识库、数据库、权限体系和业务 API。Agent 更合理的定位，是在这些能力之上增加自然语言理解、任务规划和智能交互层。

### 3.1 复用现有业务能力

优先复用经过验证的业务服务，不要让 Agent 重新实现一遍业务规则。

例如，订单服务已经提供：

- `getOrder(orderId)`
- `listUserOrders(userId, filters)`
- `createRefundApplication(orderId, reason)`

那么 Agent 应该通过受控的服务接口调用这些能力，而不是直接连接订单数据库并自行拼 SQL 修改数据。

推荐的原则：

- 业务规则仍由领域服务或后端业务层维护。
- Agent Tool 是业务能力的适配层，不应成为第二套业务系统。
- 所有数据访问都必须经过身份和权限校验。
- 写操作应考虑幂等、审计、事务边界和回滚方案。
- 工具的描述、参数和返回值应尽量清晰、结构化。

### 3.2 多源数据接入要先分类

“把数据接进 Agent”不是一个单一问题。不同数据源应该采用不同方式：

| 数据类型 | 推荐接入方式 | 需要关注的重点 |
| --- | --- | --- |
| 业务数据库 | 通过业务 API 或受控查询服务 | 用户权限、字段范围、查询成本、数据一致性 |
| 企业文档、PDF、知识库 | 文档解析、索引、RAG 检索 | 文档版本、切分质量、来源引用、数据更新 |
| 第三方 SaaS | 官方 API、Webhook、Connector 或 MCP | 授权、Token 生命周期、限流、接口变化 |
| 实时业务状态 | 直接调用业务服务 | 实时性、超时、重试和降级 |
| 文件与附件 | 对象存储、文件解析或专用工具 | 文件类型、大小、恶意内容和访问权限 |
| 事件与异步任务 | 消息队列、事件订阅、后台 Worker | 顺序、重复消费、任务状态和恢复 |

不要把所有数据都向量化。订单状态、余额、库存、权限等需要准确且实时的数据，通常应由业务 API 或结构化查询提供；文档知识、长文本和非结构化资料，才更适合用 RAG 检索。

### 3.3 RAG 不等于“把文档放进向量数据库”

一个基本 RAG 流程至少包含：

1. 数据采集和解析。
2. 清洗、去重、版本管理和权限元数据补充。
3. 文档切分与 Embedding。
4. 向量检索、关键词检索或混合检索。
5. 必要时进行 Rerank。
6. 将相关片段及其来源交给模型。
7. 对答案进行引用、依据和权限检查。

检索质量会直接影响最终回答质量。文档切分太大可能引入噪声，切分太小可能破坏上下文；只做向量检索可能漏掉精确编号、产品代码和专有名词；忽略权限元数据则可能导致越权检索。

尤其要避免一个严重问题：**先检索出用户无权访问的内容，再寄希望于 Prompt 要求模型不要透露。** 权限过滤应尽可能发生在检索和数据访问层。

### 3.4 Function Calling、MCP、Agent Skills 各自解决什么问题？

这些概念容易被混在一起，但它们不是同一层面的替代关系：

| 能力 | 主要解决的问题 | 典型用途 |
| --- | --- | --- |
| Function Calling / Tool Calling | 模型如何表达“我要调用哪个工具、参数是什么” | 调用应用内的业务函数 |
| MCP | Agent 客户端如何以标准方式连接外部工具和上下文服务 | 接入文件系统、内部服务、第三方工具 |
| Agent Skills | 如何把某类任务的知识、流程和资源打包成可复用能力 | 代码审查、数据分析、文档处理等重复流程 |
| Agent-to-Agent 协议 | 独立 Agent 系统之间如何发现能力、委派和协作 | 跨服务、跨组织的 Agent 协作场景 |

MCP 的核心价值是统一工具与上下文的连接方式，不是自动解决权限、业务语义、数据治理或 Agent 推理质量。**接入 MCP 不代表接入的数据天然可信，也不代表工具可以被无条件执行。**

截至 2026 年 11 月，MCP 官方文档列出的最新规范版本为 `2026-07-28`。该版本强调无状态协议核心、多轮往返请求、路由、可缓存列表结果及授权强化。采用时应以 [MCP 最新规范](https://modelcontextprotocol.io/specification/2026-07-28) 和官方 SDK 为准，不要继续依赖过期示例。

Agent Skills 则采用目录化的开放格式，最少包含 `SKILL.md`，也可以携带脚本、参考资料和资源文件。它通过渐进式披露，避免每个任务开始时都把完整流程塞进上下文。需要注意，Skill 的发现与安装路径由具体 Agent 工具决定，不要假设所有工具都使用同一个目录。具体格式见 [Agent Skills Specification](https://agentskills.io/specification)。

## 4. 指令、文档和约束：不要把所有规则都写进 Prompt

Agent 项目经常会出现大量 Markdown 文件，但必须先区分：**运行时 Agent 的行为规则**和**Coding Agent 修改代码时需要遵循的项目规则**，是两种不同的东西。

### 4.1 运行时 Agent 的指令

这是产品自身的行为约束，通常由应用服务在每次运行时提供或组装，例如：

- Agent 的角色、任务目标和回复风格。
- 可用工具和每个工具的适用条件。
- 数据来源和事实引用要求。
- 任务停止条件、失败处理和澄清策略。
- 风险操作的确认和升级规则。

但权限不能只靠指令保证。Prompt 可以告诉模型“不要访问其他用户的数据”，真正的租户隔离、资源归属和操作授权仍应在服务端校验。

### 4.2 Coding Agent 的项目指令

`AGENTS.md`、`CLAUDE.md`、Cursor Rules 等文件，是让 Codex、Claude Code、Cursor、Copilot 等编码智能体理解代码库和开发规范的机制。它们不是你线上 Agent 应用的 System Prompt，也不是业务权限系统。

常见文件和用途：

| 文件或机制 | 适合承载的内容 |
| --- | --- |
| `AGENTS.md` | 仓库说明、目录结构、常用命令、约定、测试和交付要求 |
| `CLAUDE.md` | Claude Code 使用的项目上下文和规则，也可引用更细的规则文件 |
| `.github/copilot-instructions.md` | GitHub Copilot 的仓库级指令 |
| 路径级 Rules | 某个目录、语言或模块的局部要求 |
| `docs/architecture.md` | 架构现状、模块边界、数据流和关键决策 |
| `docs/product/` | 用户故事、业务规则、流程和验收标准 |
| `docs/runbooks/` | 部署、监控、故障处理和回滚流程 |
| Agent Skills | 需要按任务触发的可复用操作流程和专业知识 |

不同工具对文件名、发现路径、继承方式和优先级的支持并不完全相同。比如 Codex 会按目录层级组合适用的 `AGENTS.md` 指令；GitHub Copilot 还支持自己的仓库级和路径级指令；Claude Code 使用 `CLAUDE.md` 及 Rules 等机制。多工具团队应检查各自官方文档，而不是假设一个文件在所有工具中都会以相同规则生效。

参考：[Codex AGENTS.md 指南](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[GitHub Copilot Custom Instructions](https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions)、[VS Code Custom Instructions Reference](https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference)、[Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)。

### 4.3 文档要分层，规则要简洁

我更推荐这样的项目文档结构：

```text
project/
├── AGENTS.md                 # 编码智能体的仓库级约束
├── README.md                 # 项目介绍、启动方式
├── docs/
│   ├── product/
│   │   ├── overview.md       # 产品目标与用户场景
│   │   └── requirements/     # 具体需求与验收条件
│   ├── architecture/
│   │   ├── overview.md       # 系统架构
│   │   └── decisions/        # ADR，关键技术决策
│   ├── engineering/
│   │   ├── conventions.md    # 工程约定
│   │   └── testing.md        # 测试策略
│   └── runbooks/
│       ├── deploy.md         # 部署
│       └── incident.md       # 故障处理
├── .agents/
│   └── skills/               # Skill 示例目录；实际加载路径按所用工具约定
└── src/
```

`AGENTS.md` 不应该成为整个项目的百科全书。它更适合记录每次任务都需要知道的关键事实，以及指向更具体文档的入口。任务相关的细节放在需求文档、架构文档或 Skill 中，按需读取。

文档还需要维护机制：代码结构发生变化时更新架构说明；测试命令变化时更新工程文档；线上故障暴露出流程缺陷时更新 Runbook。过期文档比没有文档更容易误导 Agent。

## 5. Vibe Coding：速度提升了，工程责任没有消失

Vibe Coding 降低了把想法变成代码的门槛，但它不意味着可以跳过需求分析、架构设计和验证。

我更愿意把 Vibe Coding 理解为：**开发者借助自然语言和 Coding Agent 完成更多实现工作，但仍由开发者承担目标定义、技术判断、风险控制和最终验收责任。**

### 5.1 推荐的协作流程

```text
需求输入
   |
   v
澄清目标与边界
   |
   v
阅读项目上下文 / 现状分析
   |
   v
输出方案与任务计划
   |
   v
人工确认关键决策
   |
   v
小步实现
   |
   v
自动化测试 / 构建 / 类型检查
   |
   v
Diff Review / 需求验收
   |
   v
提交、合并、部署
```

不是每个小修改都需要一份正式设计文档，但涉及数据结构、权限、跨模块、外部 API、部署方式或不可逆操作时，应该先让 Agent 分析现状和提出计划，再开始修改。

### 5.2 需求先行：先确认“做什么”和“不做什么”

需求描述不能只有“帮我做一个记忆管理功能”。至少要说明：

- **Goal：** 最终要解决什么问题？
- **Context：** 当前系统是什么样？相关模块、接口和数据在哪里？
- **Scope：** 本次具体包含哪些能力？
- **Non-goals：** 明确本次不做什么，避免 Agent 顺手扩展。
- **Constraints：** 哪些架构、接口、技术栈或数据逻辑不能改变？
- **Acceptance Criteria：** 怎样验证完成？
- **Verification：** 应运行哪些测试、构建或检查？

例如：

```text
目标：为会话列表增加重命名能力。

范围：
- 支持从会话列表打开重命名操作。
- 保存后更新当前列表展示。
- 失败时提示用户，并保留原名称。

非目标：
- 不调整会话数据结构。
- 不修改历史消息存储逻辑。
- 不重做整个会话侧边栏。

约束：
- 沿用现有 API 和错误处理方式。
- 不新增生产依赖。

验收：
- 重命名成功后刷新页面仍保持新名称。
- 空名称和超长名称被正确处理。
- API 失败时 UI 状态可以恢复。
- 相关测试和类型检查通过。
```

### 5.3 不要做一个只会说 Yes 的 Engineer

这是我认为 AI 时代尤其重要的工程能力。

如果开发者只负责提出想法，Agent 无论合理与否都立刻回答“可以”，然后开始写代码，最终就会变成“人类提出未经验证的方案，AI 快速实现未经验证的方案”。速度提高了，错误也可能更快地累积。

好的 Coding Agent 应该被鼓励去：

- 发现需求中的矛盾、歧义和缺失信息。
- 指出当前方案与现有架构的冲突。
- 识别安全、数据一致性、性能和维护风险。
- 对不合理的实现提出替代方案，并解释取舍。
- 在缺少关键信息时先提问，而不是自行补全关键业务规则。
- 当用户要求与项目硬约束冲突时明确指出，而不是悄悄绕开约束。

开发者也不能把判断责任交出去。**AI 可以提出建议，但最终决策必须由了解业务和系统的人负责。**

### 5.4 控制改动半径

大任务应拆成可验证的小任务，每次尽量围绕一个明确目标修改。先让 Agent 解释将改哪些模块、为什么改，再检查 Diff。不要让一个任务同时重构目录、升级依赖、换状态管理、调整接口和修改视觉设计，除非它们确实有不可分割的关系。

对高风险操作增加明确确认点，例如：删除数据、修改数据库结构、变更权限、执行生产部署、触发对外通知或产生实际费用。

## 6. 技术栈选择：优先匹配问题，不追逐框架

Agent 生态变化非常快，技术栈选择应围绕团队语言、系统复杂度、模型供应商、运行时要求、部署环境和维护能力展开。

### 6.1 常见技术路线

| 方向 | 可考虑的工具 | 适合的情况 |
| --- | --- | --- |
| TypeScript Agent 应用 | [Vercel AI SDK](https://ai-sdk.dev/)、[OpenAI Agents SDK for TypeScript](https://openai.github.io/openai-agents-js/) | Web 产品、TypeScript 全栈、流式 UI、多模型接入 |
| Python Agent 应用 | [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)、[Pydantic AI](https://ai.pydantic.dev/) | Python 服务、数据处理、模型与工具集成 |
| 复杂状态和长流程编排 | [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) | 需要显式状态图、持久化、恢复、中断和人工介入的流程 |
| 自主控制运行循环 | 模型厂商 SDK / 原生 API | 流程较简单，希望减少框架抽象并掌握执行细节 |
| 数据检索 | PostgreSQL / pgvector、搜索引擎、专用向量数据库 | 依据数据规模、过滤能力、混合检索和运维成本选择 |
| 异步和长任务 | 消息队列、Worker、持久化工作流 | 执行时间长、需要重试、恢复、并发控制和任务追踪 |
| 可观测性 | OpenTelemetry、Phoenix、LangSmith 等 | 需要记录模型、工具、检索和工作流的执行轨迹 |

这不是排名，也不是要求全部引入。比如，一个以 TypeScript 为主、任务链路相对简单的产品，可以从 AI SDK 或原生模型 SDK 开始；一个需要复杂状态、长时间运行、暂停恢复和人工审批的流程，则应重点评估具备持久化执行能力的框架。

截至 2026 年，Vercel AI SDK 7 已将多模型、工具、Agent 运行、审批、持久化工作流和可观测性纳入其能力范围；但具体功能仍需根据部署平台和使用场景验证。参考 [AI SDK 7 发布说明](https://vercel.com/changelog/ai-sdk-7)。

### 6.2 一个务实的技术选型原则

1. **先选择模型，再验证任务表现。** 不要只看榜单，要用自己的真实任务集比较效果、延迟和成本。
2. **框架解决复杂度，不制造复杂度。** 框架提供的抽象只有在项目确实需要时才值得引入。
3. **模型接入适度抽象。** 如果确定需要多供应商、故障切换或模型路由，可以设计统一接口；如果只有一个模型且没有切换需求，不要过早建设庞大的 Provider 平台。
4. **数据存储按职责选择。** 会话状态、业务数据、长期记忆、检索索引和任务状态不一定要放在同一个存储里。
5. **生产能力要提前考虑。** 超时、重试、幂等、权限、限流、日志、成本预算和回滚不能等上线后再补。

## 7. Git 工作流：让 Agent 的每一次修改都可审查、可回退

Coding Agent 可以一次修改很多文件，因此 Git 不只是版本管理工具，也是控制 AI 改动风险的边界。

推荐一个简单、可落地的工作流：

1. 从最新主分支创建功能分支或独立 Worktree。
2. 开始任务前检查工作区状态，避免覆盖用户已有改动。
3. 先分析与计划，再小步修改。
4. 每个阶段检查 `git diff`，确认没有无关文件和意外改动。
5. 运行与改动范围匹配的测试、类型检查、Lint 和构建。
6. 让 Agent 总结改动、风险、测试结果和未完成事项。
7. 由开发者审查后提交 Commit，必要时创建 Pull Request。
8. 合并后通过 CI 和部署流程发布，并保留回滚路径。

建议使用有意义的分支和 Commit 信息，例如：

```text
feat/session-rename
fix/tool-timeout-handling
refactor/model-provider-adapter

git commit -m "feat: add session rename support"
```

不要允许 Agent 在没有明确授权的情况下直接向主分支推送、修改生产数据或发布版本。可以逐步开放低风险权限，但要把高风险动作保留为人工确认点。

## 8. 测试先行：确定性代码测试与 Agent 评测要分开

Agent 应用有两类不同的质量问题：一类来自普通软件代码，例如权限校验、参数验证、状态更新、异常处理；另一类来自模型行为，例如理解错误、工具选择不正确、检索不充分或答案缺乏依据。

它们需要不同的测试方式。

### 8.1 传统软件测试仍然重要

对工具函数、API、权限校验、数据转换、状态机和业务规则，应优先使用普通单元测试、集成测试和端到端测试。

例如，一个 `createRefundApplication` 工具的权限判断、参数校验、幂等处理和异常映射应该由确定性测试覆盖，不应依赖模型来证明它正确。

### 8.2 Agent 行为需要 Evaluation

针对 Agent 的任务执行，建立一组真实、有代表性的测试样本，记录预期目标、允许的工具和验收标准。对每次 Prompt、模型、工具、检索或流程变更运行回归评测。

可以评估：

- 任务是否完成。
- 是否选择正确的工具。
- 工具参数是否符合业务要求。
- 答案是否有数据依据。
- 是否遵循权限和安全边界。
- 是否在适当时机澄清、拒绝或转人工。
- 任务耗时和 Token 成本是否可接受。

不要只测一条“理想问题”。正常输入、模糊输入、缺少信息、越权请求、工具故障和边界案例都应覆盖。

### 8.3 验收标准必须可观察

“体验不错”“回答更智能”“操作更流畅”都不是足够的验收标准。应该尽量转成可以观察或量化的行为。

例如：

- 对测试集中的某类任务，任务成功率达到约定门槛。
- 未授权用户无法通过 Agent 读取其他租户数据。
- 写操作执行前必须经过指定的确认流程。
- 工具超时后，任务能够在限定次数内重试或明确失败。
- 模型输出不符合结构化 Schema 时，应用能够校验并处理。
- 任务的 P95 响应时间和单次成本不超过预算。

数值门槛应该根据业务风险、基线和样本规模制定，不应照搬别人的指标。

## 9. 生产环境：Agent 需要像普通服务一样被治理

Agent 不只是一个模型接口。它会访问数据、调用工具、执行任务，可能还会跨越多个系统。因此生产环境至少需要考虑：

### 9.1 安全与权限

- 所有工具按最小权限原则开放，不给模型无边界的数据库、Shell 或管理权限。
- 读取和写入权限分开，高风险操作加入审批。
- 租户、用户和资源权限在服务端校验。
- 外部文档、网页、工具结果和用户输入都应视为不可信数据，不能让它们直接覆盖系统策略。
- 对 Prompt Injection、数据泄露、过度授权、工具滥用和不安全输出进行测试。
- 记录必要审计信息，并对日志中的个人信息和敏感数据进行脱敏。

可以参考 [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-2026/) 和 [OpenAI 安全构建 Agent 指南](https://developers.openai.com/api/docs/guides/agent-builder-safety)。

### 9.2 稳定性与任务恢复

- 对模型和工具调用设置超时及合理重试策略。
- 区分可重试错误、业务错误和权限错误。
- 对写操作设计幂等键，避免重复执行。
- 长任务使用持久化任务状态或工作流机制，支持暂停、恢复和人工接管。
- 设置最大步骤数、Token 预算、时间预算和工具调用预算。
- 为关键依赖准备明确的降级行为，而不是无限重试。

### 9.3 可观测性

至少要能回答：一次任务使用了哪个模型和哪个版本的指令？调用了哪些工具？检索了哪些来源？每一步花了多久？使用了多少 Token？在哪一步失败？最终是否完成？

推荐把模型调用、工具执行、检索和应用内部步骤串成一条 Trace，并关联会话 ID、任务 ID、Agent 版本和 Prompt 版本。OpenTelemetry 的 [GenAI Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/) 正在为模型和 Agent 相关观测建立统一属性约定。采集时要特别注意敏感信息，默认脱敏或按需采样。

### 9.4 部署与运维

- 开发、测试、预发和生产环境隔离。
- API Key、OAuth Token 和数据库凭证使用密钥管理，不写入仓库或 Prompt。
- 为模型供应商、工具服务和第三方 API 配置限流与预算。
- 配置健康检查、告警、日志保留和审计策略。
- Prompt、模型、工具 Schema 和 Agent 配置要有版本管理。
- 上线采用灰度或小流量验证，发现问题能够回滚。
- 明确人工接管、故障处理和业务中断时的备用流程。

**Agent 上线不是“接口能返回 200”就结束，而是要证明系统可以被观测、被控制、被恢复。**

## 10. 一份可以落地的 Agent 项目检查清单

### 开发之前

- [ ] 确认场景是否真的需要 Agent，而不是普通代码或 Workflow。
- [ ] 写清楚目标用户、输入、输出、任务边界和非目标。
- [ ] 定义成功标准、失败处理和高风险操作。
- [ ] 盘点已有业务 API、数据源、身份和权限体系。
- [ ] 选择最小可行的模型、框架和存储方案。

### 开发过程中

- [ ] 从单 Agent 和最小工具集开始。
- [ ] 业务规则留在确定性服务中，工具接口定义清晰。
- [ ] 将 Prompt、运行时策略、Coding Agent 规则和 Skill 分开管理。
- [ ] 文档先行，复杂任务先分析、计划和确认。
- [ ] 明确 Scope、Non-goals、Constraints 和验收标准。
- [ ] 使用小步 Git 提交，随时检查 Diff。
- [ ] 为工具和业务逻辑写普通测试，为模型行为建立评测集。

### 上线之前

- [ ] 验证权限隔离、Prompt Injection 和工具滥用风险。
- [ ] 设置超时、重试、幂等、步骤限制和成本预算。
- [ ] 记录 Trace、延迟、Token、错误和任务结果。
- [ ] 建立回归评测、灰度发布和回滚流程。
- [ ] 准备监控告警、Runbook 和人工接管方式。

## 结语

AI Agent 时代，代码实现的成本正在下降，但软件工程并没有变得不重要。相反，当模型可以更快地生成代码、规划步骤和调用工具时，需求判断、系统边界、权限治理、质量评估和交付责任会变得更加重要。

我更愿意把 Agent 看作一种新的软件系统构建方式，而不是可以替代工程能力的捷径。

一个成熟的 Agent 工程师，不只是会调用模型、编写 Prompt 或接入 MCP，更需要理解业务系统，知道哪些问题应该交给模型、哪些必须由代码确定，能够建立可测试、可观测、可控制的运行环境，并对最终结果负责。

**不要为了使用 Agent 而使用 Agent，也不要因为 Agent 能写代码，就放弃工程师应有的判断。**

---

## 参考资料

> 以下链接用于继续阅读。生态更新较快，使用具体 SDK、协议或平台能力前，请以官方文档当前版本为准。

### Agent 架构与开发

- [OpenAI — Building agents](https://developers.openai.com/tracks/building-agents)
- [OpenAI — Agents SDK](https://developers.openai.com/api/docs/guides/agents/sdk)
- [OpenAI — Agent definitions](https://developers.openai.com/api/docs/guides/agents/define-agents)
- [Vercel — AI SDK 7](https://vercel.com/changelog/ai-sdk-7)
- [LangGraph — Overview](https://docs.langchain.com/oss/python/langgraph/overview)
- [Pydantic AI — Documentation](https://ai.pydantic.dev/)

### 系统集成与协议

- [Model Context Protocol — Specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)
- [MCP — 2026-07-28 Specification Release Notes](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [Agent Skills — Specification](https://agentskills.io/specification)

### Coding Agent 与项目约束

- [Codex — Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [GitHub Copilot — Custom instructions](https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions)
- [VS Code — Custom instructions reference](https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference)
- [Claude Code — Best practices](https://code.claude.com/docs/en/best-practices)
- [Codex — Best practices](https://learn.chatgpt.com/guides/best-practices)

### 安全与可观测性

- [OWASP — Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-2026/)
- [OpenAI — Safety in building agents](https://developers.openai.com/api/docs/guides/agent-builder-safety)
- [OpenTelemetry — GenAI Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/)
