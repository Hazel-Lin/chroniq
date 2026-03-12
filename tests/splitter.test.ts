import test from "node:test";
import assert from "node:assert/strict";
import { splitInputBlock } from "../src/lib/splitter.js";

test("splitInputBlock splits bullet list deterministically", () => {
  const entries = splitInputBlock("- 任务A\n- 任务B", "bullets");
  assert.deepEqual(entries, ["任务A", "任务B"]);
});

test("splitInputBlock splits paragraphs deterministically", () => {
  const entries = splitInputBlock("第一段\n继续\n\n第二段", "paragraphs");
  assert.deepEqual(entries, ["第一段\n继续", "第二段"]);
});

test("splitInputBlock auto mode prefers bullets when multiple bullet items exist", () => {
  const entries = splitInputBlock("- 跟进定价\n- 修复边界条件", "auto");
  assert.deepEqual(entries, ["跟进定价", "修复边界条件"]);
});
