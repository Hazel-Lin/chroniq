# Chroniq - 项目配置

## 项目简介
本地优先、CLI 优先、Agent 友好的个人日志工具,专注于快速捕获笔记并导出为 JSON 供 AI 消费。

## 项目位置
`/Users/linhuizi/Desktop/Chroniq`

## 技术栈
- TypeScript + Node.js
- 数据存储: 本地 JSONL 文件 (`data/logs/YYYY-MM-DD.jsonl`)
- CLI 框架: Commander.js

## 核心命令
```bash
# 添加笔记
cq add "内容"
cq add "内容 #thought"
cq --tag thought,work add "内容"
cq add

# 查看今日笔记
cq today
cq today --json

# 列出日期
cq list
cq list --date 2026-03-10
cq list --date 2026-03-10 --json

# 导出所有笔记
cq export
cq export --format json
```

别名: `chroniq` / `cq` / `pt`

## 数据格式
每条记录为一行 JSON:
```json
{
  "id": "20260310121030-123",
  "content": "笔记内容",
  "created_at": "2026-03-10T12:10:30.123+08:00",
  "source": "cli",
  "tags": ["thought"],
  "type": "note"
}
```

存储路径: `data/logs/YYYY-MM-DD.jsonl`

## 开发命令
```bash
# 开发模式
pnpm dev

# 编译
pnpm build

# 检查
pnpm check

# 全局链接
pnpm link --global
```

## 设计原则
1. **Fast input over heavy structure** - 快速输入优先于复杂结构
2. **Local files over cloud** - 本地文件优先于云端
3. **JSON output over opaque state** - JSON 输出优先于黑盒状态
4. **Agent-friendly workflows** - 对 AI Agent 友好

## 项目范围
**当前范围**:
- 轻量级捕获
- 简单检索
- 稳定的本地存储
- 机器可读导出

**不在范围内**:
- 自动分类
- 全文搜索引擎
- 同步服务
- GUI 应用

## Agent 使用示例
```bash
# 添加笔记
cq add "讨论了 CLI 输入设计 #idea"

# 导出今日笔记供 AI 分析
cq today --json | your-ai-tool

# 导出所有笔记
cq export --format json > all-notes.json
```

## 当前输入行为
- `cq add "内容"`: 直接记录单条内容
- `cq add`: 在 TTY 下打开默认编辑器，按行批量输入
- `echo -e "A\nB" | cq add`: 管道模式按行批量记录
- 全局标签推荐使用 `cq --tag thought,work add`

## 注意事项
1. 数据存储在用户目录,不适合存储敏感信息
2. 保持工具的轻量和 CLI-first 特性
3. 不要把简单捕获变成重型工作流引擎
4. 保持 JSON 输出格式稳定,供 Agent 使用

## 当前阶段
MVP 验证阶段,核心功能已完成,保持简洁
