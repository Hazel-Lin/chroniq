import fs from "node:fs";
import { randomBytes } from "node:crypto";
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

function toLocalISO(date: Date) {
  const off = date.getTimezoneOffset();
  const local = new Date(date.getTime() - off * 60_000);
  const sign = off <= 0 ? "+" : "-";
  const absOff = Math.abs(off);
  const hh = String(Math.floor(absOff / 60)).padStart(2, "0");
  const mm = String(absOff % 60).padStart(2, "0");
  return `${local.toISOString().replace("Z", "")}${sign}${hh}:${mm}`;
}

export function getLogFilePath(date: Date) {
  return path.join(LOG_DIR, `${getDateKey(date)}.jsonl`);
}

let lastId = "";
let idSeq = 0;
const PROCESS_ID_SALT = randomBytes(2).toString("hex");

function buildIdBase(date: Date) {
  const millis = String(date.getMilliseconds()).padStart(3, "0");
  return `${getDateKey(date).replace(/-/g, "")}${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}-${millis}`;
}

export function buildEntryId(date: Date, seq: number, processSalt = PROCESS_ID_SALT) {
  const baseId = buildIdBase(date);
  return seq === 0
    ? `${baseId}-${processSalt}`
    : `${baseId}-${processSalt}-${seq}`;
}

export function createEntry(content: string, tags: string[] = [], source = "cli"): LogEntry {
  const now = new Date();
  const cleanTags = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
  const localISO = toLocalISO(now);
  const baseId = buildIdBase(now);

  if (baseId === lastId) {
    idSeq++;
  } else {
    lastId = baseId;
    idSeq = 0;
  }
  const id = buildEntryId(now, idSeq);

  return {
    id,
    content: content.trim(),
    created_at: localISO,
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

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(dateKey: string) {
  if (!DATE_KEY_RE.test(dateKey)) return false;
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
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
