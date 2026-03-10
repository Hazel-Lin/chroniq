import { LogEntry } from "./schema.js";

export function formatEntry(entry: LogEntry) {
  const tags = entry.tags.length ? ` [${entry.tags.join(", ")}]` : "";
  return `- ${entry.created_at} ${entry.content}${tags}`;
}

export function formatEntries(entries: LogEntry[]) {
  if (entries.length === 0) {
    return "暂无记录";
  }
  return entries.map(formatEntry).join("\n");
}
