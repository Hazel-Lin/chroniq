import { appendEntry, createEntry } from "../lib/store.js";

export function runAdd(content: string, tags: string[]) {
  if (!content.trim()) {
    console.error("内容不能为空");
    process.exit(1);
  }
  const entry = createEntry(content, tags, "cli");
  appendEntry(entry);
  const single = entry.content.replace(/\n/g, " ↵ ");
  const preview = single.length > 60 ? single.slice(0, 59) + "…" : single;
  console.log(`✓ 已记录: ${preview}  (ID: ${entry.id})`);
}
