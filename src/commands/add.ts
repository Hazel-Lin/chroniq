import { appendEntry, createEntry } from "../lib/store.js";

export function runAdd(content: string, tags: string[]) {
  const entry = createEntry(content, tags, "cli");
  const filePath = appendEntry(entry);
  console.log(`已记录: ${entry.content}`);
  console.log(`文件: ${filePath}`);
  console.log(`ID: ${entry.id}`);
}
