export type EntryType = "note";

export interface LogEntry {
  id: string;
  content: string;
  created_at: string;
  source: string;
  tags: string[];
  type: EntryType;
}

export function isLogEntry(value: unknown): value is LogEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.content === "string" &&
    typeof entry.created_at === "string" &&
    typeof entry.source === "string" &&
    Array.isArray(entry.tags) &&
    entry.tags.every((tag) => typeof tag === "string") &&
    entry.type === "note"
  );
}
