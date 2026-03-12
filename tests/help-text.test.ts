import test from "node:test";
import assert from "node:assert/strict";
import { ADD_HELP_TEXT } from "../src/lib/help-text.js";

test("add help text quotes inline hashtag examples and explains shell comment rule", () => {
  assert.match(ADD_HELP_TEXT, /cq add "想到一个方案 #idea"/);
  assert.match(ADD_HELP_TEXT, /shell 会把 # 后内容当成注释/);
});
