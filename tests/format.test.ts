import test from "node:test";
import assert from "node:assert/strict";
import { formatDateSummary, formatEntries } from "../src/lib/format.js";
import { LogEntry } from "../src/lib/schema.js";

const sampleEntry: LogEntry = {
  id: "1",
  content: "第一行\n第二行",
  created_at: "2026-03-12T12:00:00+08:00",
  source: "cli",
  tags: ["idea"],
  type: "note",
};

test("formatEntries full mode preserves line breaks", () => {
  const output = formatEntries([sampleEntry], true);
  assert.match(output, /第一行/);
  assert.match(output, /第二行/);
  assert.match(output, /\n/);
});

test("formatDateSummary full mode includes date header and body", () => {
  const output = formatDateSummary("2026-03-12", [sampleEntry], true);
  assert.match(output, /2026-03-12 \(1 条\)/);
  assert.match(output, /第一行/);
  assert.match(output, /第二行/);
});
