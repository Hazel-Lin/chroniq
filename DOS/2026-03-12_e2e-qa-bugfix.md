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

## 修复结果

- `src/lib/store.ts`
  - 新增 `buildEntryId()`，将 ID 生成从“仅时间戳 + 进程内计数器”改为“时间基底 + 进程级随机盐 + 同毫秒序号”
- `tests/store.test.ts`
  - 新增跨进程盐唯一性与同进程序号唯一性测试

## 验证结果

- `pnpm test` 通过
- `pnpm check` 通过
- `pnpm build` 通过
- 真实 CLI 写入验证：
  - `qa-id-check-one` -> `20260312122741-358-1228`
  - `qa-id-check-two` -> `20260312122741-358-7dac`
  - 两条记录时间基底完全相同，但 ID 已不同
