import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LogEntry, isLogEntry } from "./schema.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, "../..");
const LOG_DIR = path.resolve(projectRoot, "data/logs");

function ensureLogDir() {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLogFilePath(date: Date) {
  return path.join(LOG_DIR, `${getDateKey(date)}.jsonl`);
}

export function createEntry(content: string, tags: string[] = [], source = "cli"): LogEntry {
  const now = new Date();
  const cleanTags = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
  const timestamp = now.toISOString();
  const millis = String(now.getMilliseconds()).padStart(3, "0");
  return {
    id: `${timestamp.replace(/[-:.TZ]/g, "").slice(0, 14)}-${millis}`,
    content: content.trim(),
    created_at: timestamp,
    source,
    tags: cleanTags,
    type: "note",
  };
}

export function appendEntry(entry: LogEntry) {
  ensureLogDir();
  const filePath = getLogFilePath(new Date(entry.created_at));
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, "utf8");
  return filePath;
}

function parseFile(filePath: string): LogEntry[] {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const entries: LogEntry[] = [];
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as unknown;
      if (isLogEntry(parsed)) entries.push(parsed);
    } catch {
      // Ignore invalid lines to keep append-only store resilient.
    }
  }
  return entries;
}

export function readEntriesForDate(date: Date) {
  return parseFile(getLogFilePath(date));
}

export function readEntriesForDateKey(dateKey: string) {
  return parseFile(path.join(LOG_DIR, `${dateKey}.jsonl`));
}

export function listAvailableDates() {
  ensureLogDir();
  return fs
    .readdirSync(LOG_DIR)
    .filter((name) => name.endsWith(".jsonl"))
    .map((name) => name.replace(/\.jsonl$/, ""))
    .sort();
}

export function readAllEntries() {
  return listAvailableDates().flatMap((dateKey) => readEntriesForDateKey(dateKey));
}
