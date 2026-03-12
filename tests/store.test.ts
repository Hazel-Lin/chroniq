import test from "node:test";
import assert from "node:assert/strict";
import { buildEntryId } from "../src/lib/store.js";

test("buildEntryId stays unique across different process salts at same timestamp", () => {
  const now = new Date("2026-03-12T12:26:00.136+08:00");
  const left = buildEntryId(now, 0, "aaaa");
  const right = buildEntryId(now, 0, "bbbb");

  assert.notEqual(left, right);
  assert.equal(left, "20260312122600-136-aaaa");
  assert.equal(right, "20260312122600-136-bbbb");
});

test("buildEntryId stays unique within one process for same millisecond", () => {
  const now = new Date("2026-03-12T12:26:00.136+08:00");

  assert.equal(buildEntryId(now, 0, "salt"), "20260312122600-136-salt");
  assert.equal(buildEntryId(now, 1, "salt"), "20260312122600-136-salt-1");
});
