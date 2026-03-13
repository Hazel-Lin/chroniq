# AGENTS.md — Chroniq Project Map

> This file is a map, not an encyclopedia. Follow pointers to docs/ for details.

## What is Chroniq?

Local-first, CLI-first, agent-friendly personal context input layer.
Append-only JSONL storage. Zero cloud dependency. One command to log anything.

## Tech Stack

| Item           | Value                                    |
| -------------- | ---------------------------------------- |
| Language       | TypeScript (strict: true)                |
| Runtime        | Node.js, ES Module (type: "module")      |
| CLI Framework  | Commander.js                             |
| Storage        | JSONL append-only, per-day files         |
| Package Mgr    | pnpm                                     |
| Version        | 0.1.0                                    |

## Project Layout

```
src/
  cli.ts              ← Entry point (Commander setup, parse args)
  commands/
    add.ts             ← runAdd()   — create entries
    list.ts            ← runList()  — list dates or date entries
    today.ts           ← runToday() — show today's entries
    export.ts          ← runExport()— export all entries
  lib/
    schema.ts          ← LogEntry type + isLogEntry() validator
    store.ts           ← createEntry(), appendEntry(), read helpers
    format.ts          ← Output formatting utilities
data/logs/             ← Runtime data: YYYY-MM-DD.jsonl files
bin/chroniq.js         ← Bin entry (aliases: chroniq, cq)
docs/                  ← Knowledge base (see below)
```

## Commands

| Command               | Script             | Description    |
| --------------------- | ------------------ | -------------- |
| `pnpm build`          | `tsc -p tsconfig`  | Compile TS     |
| `pnpm check`          | `tsc --noEmit`     | Type check     |
| `pnpm dev`            | `tsx src/cli.ts`    | Dev run        |

## Key Invariants — DO NOT VIOLATE

1. **Append-only**: Never modify or delete existing records in JSONL files.
2. **Validation at boundary**: All entries MUST pass `isLogEntry()` (schema.ts).
3. **One file per day**: `data/logs/YYYY-MM-DD.jsonl` — no other layout.
4. **Schema fields only grow**: Add fields, never remove existing ones.
5. **Dependency direction**: `CLI → Commands → Lib → Schema` — one-way downward, no reverse imports.

## Coding Conventions

- **Strict TypeScript**: `strict: true`, target ES2022, module NodeNext.
- **ES Module**: All imports use `.js` extension in source.
- **File naming**: `kebab-case.ts`.
- **Command pattern**: One file per command, exports `run<Command>()` function.
- **Validation**: Boundary validation via `isLogEntry()` in schema.ts.
- **Language**: UI text in Chinese (用户界面中文), code comments and variable names in English.

## Docs Knowledge Base

For deeper context, consult these docs:

| Document                                | Purpose                    |
| --------------------------------------- | -------------------------- |
| `docs/product-specs/product-roadmap.md` | Product direction & phases |
| `docs/product-specs/positioning-icp-competitors.md` | Positioning, ICP, competitors |
| `docs/v0.2-dev-checklist.md`            | v0.2 development checklist |
| `docs/exec-plans/`                      | Execution plans (active/completed) |
| `docs/design-docs/`                     | Design documents           |
| `ARCHITECTURE.md`                       | System architecture & data flow |

## Adding a New Command (Quick Reference)

1. Create `src/commands/<name>.ts`, export `run<Name>()`.
2. Register in `src/cli.ts` with Commander.
3. Follow dependency rule: import only from `lib/`, never from other commands.
4. Run `pnpm check` to verify types.

## Extending the Schema

1. Add field to `LogEntry` interface in `src/lib/schema.ts`.
2. Update `isLogEntry()` — new fields should be optional for backward compatibility.
3. Update `createEntry()` in `src/lib/store.ts` to populate the new field.
4. Never remove existing fields.
