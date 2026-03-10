# Chroniq

Chroniq is a local-first, CLI-first, agent-friendly personal logging tool.

Chroniq 是一个本地优先、CLI 优先、对 Agent 友好的轻量个人记录工具。

It is built for one narrow job: capture lightweight notes quickly, keep them append-only, and make them easy for both humans and agents to consume.

它只解决一个很窄但很核心的问题：快速记录轻量笔记，保持追加式存储，并让人和 Agent 都能直接消费这些记录。

It intentionally does not try to become a full journaling app, knowledge base, or review system.

它并不试图变成完整日记应用、知识库或复盘系统。

## Why / 为什么

- Fast input over heavy structure
- Local files over cloud dependency
- JSON output over opaque app state
- Agent-friendly workflows over GUI-first interaction

- 优先轻输入，而不是重结构
- 优先本地文件，而不是云端依赖
- 优先 JSON 输出，而不是封闭状态
- 优先 Agent 工作流，而不是 GUI 优先交互

## Features / 功能

- Add notes from the terminal with `chroniq add` or `pt add`
- Read today's notes with `chroniq today`
- Browse stored dates with `chroniq list`
- Export all entries as JSON with `chroniq export`
- Store data in append-only `jsonl` files
- Keep output readable for humans and stable for scripts

- 用 `chroniq add` 或 `pt add` 从终端快速写入记录
- 用 `chroniq today` 查看当天记录
- 用 `chroniq list` 浏览已有日期
- 用 `chroniq export` 导出全部 JSON
- 数据以追加式 `jsonl` 文件存储
- 输出同时适合人读和脚本处理

## Installation / 安装

### From source / 从源码安装

```bash
pnpm install
pnpm build
pnpm link --global
```

After installation, both `chroniq` and `pt` are available in your shell.

安装完成后，你可以在终端里使用 `chroniq` 和 `pt` 两个命令，其中 `pt` 是兼容别名。

### Local development / 本地开发

```bash
pnpm install
pnpm check
pnpm build
node ./dist/cli.js --help
```

## Usage / 用法

### Add an entry / 新增记录

```bash
chroniq add "I want my logging flow to stay CLI-first"
chroniq add "Build for agents should be the default" --tag thought
chroniq add "Discussed personal logging schema" --tag idea work
```

Example output:

```text
已记录: Build for agents should be the default
文件: /path/to/chroniq/data/logs/2026-03-10.jsonl
ID: 20260310121030-123
```

### Read today's entries / 查看今日记录

```bash
chroniq today
chroniq today --json
```

### List dates or inspect a specific date / 查看日期列表或指定日期

```bash
chroniq list
chroniq list --date 2026-03-10
chroniq list --date 2026-03-10 --json
```

### Export all entries / 导出全部记录

```bash
chroniq export
chroniq export --format json
```

## Data Format / 数据格式

Entries are stored by day under:

记录会按天落在下面的目录中：

```text
data/logs/YYYY-MM-DD.jsonl
```

Each line is one JSON object:

每一行都是一个 JSON 对象：

```json
{
  "id": "20260310121030-123",
  "content": "I want my logging flow to stay CLI-first",
  "created_at": "2026-03-10T04:10:30.123Z",
  "source": "cli",
  "tags": ["thought"],
  "type": "note"
}
```

This format is intended to be:

这个格式的设计目标是：

- Easy to append
- Safe to parse line by line
- Friendly to shell tools, scripts, and LLM or agent pipelines

- 便于追加
- 便于逐行解析
- 便于 shell 工具、脚本和 LLM / Agent 流水线直接使用

## Agent Usage / Agent 使用方式

Typical agent-friendly flow:

典型的 Agent 友好流程如下：

```bash
chroniq add "Discussed CLI input design for personal logging" --tag idea
chroniq today --json
chroniq export --format json
```

That makes downstream classification, summarization, or indexing straightforward.

这样后续做分类、汇总、索引或上下文拼装都会比较直接。

## Project Scope / 项目边界

Current scope:

当前范围：

- lightweight capture
- simple retrieval
- stable local storage
- machine-readable export

- 轻量记录
- 简单检索
- 稳定的本地存储
- 机器可读导出

Out of scope for now:

当前不做：

- automatic categorization
- review workflows
- full-text search engine
- sync service
- GUI app

- 自动分类
- 复盘工作流
- 全文搜索引擎
- 同步服务
- GUI 应用

## Development / 开发

Scripts:

```bash
pnpm dev
pnpm build
pnpm check
```

Project layout:

```text
bin/        executable wrapper
src/        TypeScript source
dist/       compiled output
data/logs/  local append-only log files
```

## Contributing / 贡献

Issues and pull requests are welcome.

欢迎提交 issue 和 pull request。

Before opening a PR:

- keep the tool local-first and CLI-first
- avoid turning simple capture into a heavy workflow engine
- preserve stable JSON output for agent use
- run `pnpm check` and `pnpm build`

- 保持工具的本地优先和 CLI 优先属性
- 不要把轻记录做成沉重的工作流系统
- 保持 JSON 输出稳定，方便 Agent 使用
- 提交前运行 `pnpm check` 和 `pnpm build`

See [CONTRIBUTING.md](/Users/linhuizi/Desktop/personal-log/CONTRIBUTING.md) for details.

## Security and Privacy / 安全与隐私

Chroniq stores entries as local plain-text JSONL files. Do not use it for secrets unless your local machine and repository workflow are already set up for that risk.

Chroniq 会把记录存成纯文本 JSONL 本地文件。如果你的本地机器、备份和仓库流程没有准备好处理敏感信息，就不要用它记录秘密内容。

See [SECURITY.md](/Users/linhuizi/Desktop/personal-log/SECURITY.md).

## License / 许可

MIT. See [LICENSE](/Users/linhuizi/Desktop/personal-log/LICENSE).
