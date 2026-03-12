import test from "node:test";
import assert from "node:assert/strict";
import { extractInlineTags } from "../src/commands/add.js";

test("extractInlineTags preserves newlines while removing tags", () => {
  const result = extractInlineTags("第一行\n第二行 #tag");
  assert.equal(result.clean, "第一行\n第二行");
  assert.deepEqual(result.tags, ["tag"]);
});
