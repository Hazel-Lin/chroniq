# Architecture — Chroniq

> Local-first, CLI-first, agent-friendly personal context input layer.

## System Overview

Chroniq is a single-user CLI tool that captures timestamped log entries into
append-only JSONL files. No server, no database, no network — just files.

## Layered Architecture

```
┌─────────────────────────────────────────────┐
│                 CLI Entry                    │
│              src/cli.ts                      │
│  Commander.js setup, arg parsing, routing    │
└──────────────────┬──────────────────────────┘
                   │ calls run<Command>()
                   ▼
┌─────────────────────────────────────────────┐
│               Commands                       │
│           src/commands/*.ts                   │
│  add.ts | list.ts | today.ts | export.ts     │
│  Each exports one run<Command>() function    │
└──────────────────┬──────────────────────────┘
                   │ imports from lib/
                   ▼
┌─────────────────────────────────────────────┐
│                  Lib                         │
│             src/lib/*.ts                     │
│  store.ts  — createEntry, appendEntry, read  │
│  format.ts — output formatting               │
└──────────────────┬──────────────────────────┘
                   │ imports from schema
                   ▼
┌─────────────────────────────────────────────┐
│                Schema                        │
│          src/lib/schema.ts                   │
│  LogEntry type + isLogEntry() validator      │
│  Pure types, zero side effects               │
└─────────────────────────────────────────────┘
```

## Dependency Rules

```
CLI  ──→  Commands  ──→  Lib  ──→  Schema
                    ✗ reverse imports
```

- **CLI** may import Commands. Nothing imports CLI.
- **Commands** may import Lib. Commands must NOT import each other.
- **Lib** may import Schema. Lib must NOT import Commands or CLI.
- **Schema** imports nothing. It is the leaf dependency.

## Data Flow

### Write Path (cq add "some note")

```
User input
  │
  ▼
cli.ts ── parse args ──→ commands/add.ts
                              │
                    runAdd(content, tags)
                              │
                              ▼
                    store.createEntry(content, tags, "cli")
                              │  generates id, timestamp, builds LogEntry
                              ▼
                    store.appendEntry(entry)
                              │  JSON.stringify + "\n"
                              ▼
                    data/logs/YYYY-MM-DD.jsonl  (fs.appendFileSync)
```

### Read Path (cq today / cq list)

```
cli.ts ── parse args ──→ commands/today.ts or list.ts
                              │
                    store.readEntriesForDate(date)
                              │
                    parseFile(filePath)
                              │  read file → split lines → JSON.parse
                              │  validate each with isLogEntry()
                              ▼
                    LogEntry[] → format.ts → stdout
```

## Storage Model

- **Format**: JSONL (one JSON object per line, newline-delimited)
- **Location**: `data/logs/YYYY-MM-DD.jsonl`
- **Principle**: Append-only. Never modify or delete existing lines.
- **Resilience**: Invalid lines are silently skipped during reads.
- **ID Format**: `YYYYMMDDHHMMSS-mmm[-seq]` (timestamp-based, collision-safe)

## Schema: LogEntry

```typescript
interface LogEntry {
  id: string;          // Timestamp-based unique ID
  content: string;     // User-provided text (trimmed)
  created_at: string;  // ISO 8601 with local timezone offset
  source: string;      // Origin identifier ("cli", or agent name)
  tags: string[];      // Deduplicated, trimmed tag list
  type: EntryType;     // Currently only "note"
}
```

`isLogEntry()` validates all fields at read boundary. Every value read from
disk must pass this check before entering the application.

## Extension Points

### Adding a New Command

1. Create `src/commands/<name>.ts` with `export function run<Name>()`.
2. Import and register in `src/cli.ts` via Commander.
3. Only import from `src/lib/` — never from other commands.

### Extending the Schema

1. Add new optional field to `LogEntry` in `schema.ts`.
2. Update `isLogEntry()` — keep backward-compatible (new fields optional).
3. Populate in `createEntry()` in `store.ts`.
4. Existing JSONL files remain valid — fields only grow, never shrink.

### Adding a New Source

The `source` field distinguishes CLI input from agent input.
Set `source` parameter in `createEntry(content, tags, "your-agent-name")`.
No code changes needed — it's already a free-form string.
