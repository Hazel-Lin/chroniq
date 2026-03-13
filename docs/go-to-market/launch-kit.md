# Chroniq Launch Kit

## Positioning

Chroniq is a local-first, CLI-first, agent-friendly capture layer for lightweight notes.

It is not trying to replace a full journal, PKM tool, or cloud sync product. The wedge is simple:

- capture fast
- store append-only JSONL locally
- keep output stable for scripts and agents

## Target audience

- developers already living in terminal workflows
- AI-heavy builders who need a clean context input layer
- local-first users who do not want to depend on cloud note apps

## Core message

If you already use AI tools, the missing layer is often not "better summarization". It is a reliable, local, append-only place to capture raw context before later processing.

Chroniq gives you that layer with one command.

## Launch sequence

1. Publish package to npm.
2. Create a GitHub release with a short changelog and install command.
3. Post the English version on X and GitHub.
4. Post the Chinese version on V2EX and Jike.
5. Turn the launch into a short demo GIF for README and follow-up posts.

## Channel drafts

### X / English

> I built `Chroniq`, a local-first CLI for capturing lightweight notes in append-only JSONL.
>
> It is designed for people who already work in terminal + AI workflows and need a clean input layer for context, not another heavy notes app.
>
> Install:
> `npm i -g @hazellin/chroniq`
>
> Repo: https://github.com/Hazel-Lin/chroniq

### V2EX / 中文

标题：

`[开源] Chroniq：一个给终端和 Agent 用的本地优先轻记录 CLI`

正文：

我把自己日常记灵感/碎片上下文的那层输入工具整理成了一个开源 CLI：Chroniq。

它的边界很克制，不做知识库、不做同步、不做 GUI，只做一件事：

- 用命令行快速记录
- 以追加式 JSONL 本地存储
- 让后续脚本、LLM、Agent 都能稳定消费

适合这类场景：

- 终端里随手记一条想法
- 给 AI 工作流喂当天上下文
- 保持记录格式简单、可导出、可追踪

安装：

`npm i -g @hazellin/chroniq`

项目地址：

`https://github.com/Hazel-Lin/chroniq`

### 即刻 / 中文短帖

做了个很克制的开源小工具 `Chroniq`。

不是笔记软件，也不是知识库，而是一个给终端和 Agent 用的输入层：

- 本地优先
- CLI 优先
- 追加式 JSONL
- `cq add` 记一条，`cq today --json` 直接给 AI 用

安装：
`npm i -g @hazellin/chroniq`

Repo:
`https://github.com/Hazel-Lin/chroniq`

## Follow-up content ideas

- Why append-only JSONL beats heavy note structure for AI workflows
- Why local-first capture is a better wedge than building another AI note app
- Terminal demo: from `cq add` to `cq today --json | llm-tool`
