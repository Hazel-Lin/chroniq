import { LogEntry } from "./schema.js";

function formatTime(isoString: string) {
  const d = new Date(isoString);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function oneline(text: string) {
  return text.replace(/\n/g, " ↵ ");
}

function truncate(text: string, max: number) {
  const single = oneline(text);
  if (single.length <= max) return single;
  return `${single.slice(0, max - 1)}…`;
}

export function formatEntry(entry: LogEntry) {
  const time = formatTime(entry.created_at);
  const content = entry.content ? truncate(entry.content, 60) : "(空)";
  const tags = entry.tags.length ? ` [${entry.tags.join(", ")}]` : "";
  return `  ${time}  ${content}${tags}`;
}

export function formatEntryFull(entry: LogEntry) {
  const time = formatTime(entry.created_at);
  const tags = entry.tags.length ? ` [${entry.tags.join(", ")}]` : "";
  const body = (entry.content || "(空)")
    .split("\n")
    .map((line) => `        ${line}`)
    .join("\n");
  return `  ${time}${tags}\n${body}`;
}

export function formatEntries(entries: LogEntry[], full = false) {
  if (entries.length === 0) {
    return "暂无记录";
  }
  return full
    ? entries.map(formatEntryFull).join("\n\n")
    : entries.map(formatEntry).join("\n");
}

export function formatDateSummary(dateKey: string, entries: LogEntry[], full = false) {
  const lines: string[] = [`${dateKey} (${entries.length} 条)`];
  if (full) {
    if (entries.length === 0) {
      return lines.join("\n");
    }
    lines.push("");
    lines.push(entries.map(formatEntryFull).join("\n\n"));
    return lines.join("\n");
  }

  for (const entry of entries) {
    const time = formatTime(entry.created_at);
    const content = entry.content ? truncate(entry.content, 50) : "(空)";
    const tags = entry.tags.length ? ` [${entry.tags.join(", ")}]` : "";
    lines.push(`  ${time}  ${content}${tags}`);
  }
  return lines.join("\n");
}
