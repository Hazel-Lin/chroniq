# Chroniq

[English README](./README.md)

Chroniq 是一个本地优先、CLI 优先、对 Agent 友好的轻量个人记录工具。

它只解决一个很窄但很核心的问题：快速记录轻量笔记，保持追加式存储，并让人和 Agent 都能直接消费这些记录。

它并不试图变成完整日记应用、知识库或复盘系统。

发布到 npm 的包名：`@hazellin/chroniq`

安装后可用命令：`chroniq`、`cq`

![Chroniq 终端演示](./assets/chroniq-demo.gif)

## 为什么

- 优先轻输入，而不是重结构
- 优先本地文件，而不是云端依赖
- 优先 JSON 输出，而不是封闭状态
- 优先 Agent 工作流，而不是 GUI 优先交互

## 功能

- 用 `chroniq add` 或 `cq add` 从终端快速写入记录
- 用 `chroniq add --multiline` 或 `cat note.md | chroniq add --stdin` 保存单条多行内容
- 交互式执行 `chroniq add --stdin` 时会自动打开编辑器，避免单条多行内容无法删除或修改
- 用 `chroniq add --split` 把一段输入按规则拆成多条记录
- 用 `chroniq today` 查看当天记录
- 用 `chroniq list` 浏览已有日期
- 用 `chroniq export` 导出全部 JSON
- 数据以追加式 `jsonl` 文件存储
- 输出同时适合人读和脚本处理

## 安装

### 从 npm 安装

```bash
npm install -g @hazellin/chroniq
chroniq --help
```

或者使用 pnpm：

```bash
pnpm add -g @hazellin/chroniq
cq today
```

### 从源码安装

```bash
pnpm install
pnpm build
pnpm link --global
```

安装完成后，你可以在终端里使用 `chroniq` 和 `cq` 两个命令。

### 本地开发

```bash
pnpm install
pnpm check
pnpm build
node ./dist/cli.js --help
```

## 用法

### 输入模式

- `chroniq add`：按行输入，一行落一条记录。
- `chroniq add --stdin`：按块输入，整段内容默认落成一条记录；如果再加 `--split`，才会拆成多条。

### 新增记录

```bash
chroniq add "I want my logging flow to stay CLI-first"
chroniq add                  # 多行输入 -> 多条记录
chroniq add --stdin          # 多行输入 -> 单条记录
chroniq add "Build for agents should be the default" --tag thought
chroniq add "Discussed personal logging schema" --tag idea work
chroniq add "带内联标签的一条记录 #idea"
chroniq add --multiline
chroniq add --stdin
cat note.md | chroniq add --stdin
cat tasks.txt | chroniq add --stdin --split auto
```

如果你想在命令里直接写 `#标签`，请把整条内容放进引号里；否则 shell 会在进入 Chroniq 之前把 `#` 后面的内容当成注释。

示例输出：

```text
已记录: Build for agents should be the default
文件: /path/to/chroniq/data/logs/2026-03-10.jsonl
ID: 20260310121030-123
```

### 查看今日记录

```bash
chroniq today
chroniq today --json
chroniq today --full
```

### 查看日期列表或指定日期

```bash
chroniq list
chroniq list --date 2026-03-10
chroniq list --date 2026-03-10 --json
chroniq list --date 2026-03-10 --full
```

### 导出全部记录

```bash
chroniq export
chroniq export --format json
```

## 数据格式

记录会按天落在下面的目录中：

```text
data/logs/YYYY-MM-DD.jsonl
```

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

这个格式的设计目标是：

- 便于追加
- 便于逐行解析
- 便于 shell 工具、脚本和 LLM / Agent 流水线直接使用

## Agent 使用方式

典型的 Agent 友好流程如下：

```bash
chroniq add "Discussed CLI input design for personal logging" --tag idea
chroniq today --json
chroniq export --format json
```

这样后续做分类、汇总、索引或上下文拼装都会比较直接。

## 项目边界

当前范围：

- 轻量记录
- 简单检索
- 稳定的本地存储
- 机器可读导出

当前不做：

- 自动分类
- 复盘工作流
- 全文搜索引擎
- 同步服务
- GUI 应用

## 开发

脚本：

```bash
pnpm dev
pnpm build
pnpm check
```

项目结构：

```text
bin/        executable wrapper
src/        TypeScript source
dist/       compiled output
data/logs/  local append-only log files
```

## 贡献

欢迎提交 issue 和 pull request。

提交前：

- 保持工具的本地优先和 CLI 优先属性
- 不要把轻记录做成沉重的工作流系统
- 保持 JSON 输出稳定，方便 Agent 使用
- 运行 `pnpm check` 和 `pnpm build`

详见 [CONTRIBUTING.md](https://github.com/Hazel-Lin/chroniq/blob/main/CONTRIBUTING.md)。

## 安全与隐私

Chroniq 会把记录存成纯文本 JSONL 本地文件。如果你的本地机器、备份和仓库流程没有准备好处理敏感信息，就不要用它记录秘密内容。

详见 [SECURITY.md](https://github.com/Hazel-Lin/chroniq/blob/main/SECURITY.md)。

## 发布

维护者发布流程：

```bash
pnpm install
pnpm release:check
npm publish --access public
```

完整清单见 [npm 发布清单](https://github.com/Hazel-Lin/chroniq/blob/main/docs/npm-release.md)。

## 许可

MIT。详见 [LICENSE](./LICENSE)。
