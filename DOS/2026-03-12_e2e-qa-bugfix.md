# Chroniq E2E QA Bugfix Log

- Date: 2026-03-12
- Scope: 现有产品逻辑全流程测试
- Status: Resolved

## 测试范围

1. 命令帮助与参数解析
2. 单条写入与标签写入
3. `--stdin` 单条块输入
4. `today` / `list` / `export` 读取链路
5. 数据落盘正确性

## 发现的问题

### BUG-001: 跨进程快速写入时可能生成重复 ID

- Severity: High
- Trigger:
  - 在不同 CLI 进程中于同一毫秒内写入记录
  - 现有 ID 生成器只依赖时间戳和进程内计数器
- Evidence:
  - `quick-add-smoke` 与 `tagged-before-subcommand` 在 2026-03-12 12:26:00.136 写入，ID 同为 `20260312122600-136`
- Root Cause:
  - `src/lib/store.ts` 的 `lastId/idSeq` 仅在当前 Node 进程内有效
  - 新开一个进程时计数器会重置，无法避免跨进程碰撞
- Fix Plan:
  - 将 ID 生成改为 `时间基底 + 进程级随机盐 + 同毫秒序号`
  - 为同时间戳、不同进程盐的情况补回归测试

### BUG-002: 帮助示例中的内联 `#tag` 会被 shell 当成注释

- Severity: Medium
- Trigger:
  - 用户直接照抄 `chroniq add 想到一个方案 #idea`
- Evidence:
  - 实测运行后只记录 `想到一个方案`，标签未进入程序
- Root Cause:
  - `src/cli.ts` 中的帮助示例没有给包含 `#tag` 的内容加引号
  - shell 在命令执行前会把 `#` 后面的内容当成注释
- Fix Plan:
  - 统一改写帮助和 README 示例，所有内联标签场景一律加引号
  - 增加一条帮助文案测试，防止未来再次写出不可执行示例

## 修复结果

- `src/lib/store.ts`
  - 新增 `buildEntryId()`，将 ID 生成从“仅时间戳 + 进程内计数器”改为“时间基底 + 进程级随机盐 + 同毫秒序号”
- `tests/store.test.ts`
  - 新增跨进程盐唯一性与同进程序号唯一性测试
- `src/lib/help-text.ts`
  - 统一维护 `add` 命令帮助示例，内联标签示例全部改为带引号形式
- `tests/help-text.test.ts`
  - 增加帮助文案回归测试，确保示例可执行且明确说明 shell 注释规则

## 验证结果

- `pnpm test` 通过
- `pnpm check` 通过
- `pnpm build` 通过
- 真实 CLI 写入验证：
  - `qa-id-check-one` -> `20260312122741-358-1228`
  - `qa-id-check-two` -> `20260312122741-358-7dac`
  - 两条记录时间基底完全相同，但 ID 已不同
- 真实 shell 示例验证：
  - 运行 `node dist/cli.js add 想到一个方案 #idea` 时，只会记录 `想到一个方案`
  - 修复后帮助文案已明确要求把带 `#tag` 的内容放进引号
