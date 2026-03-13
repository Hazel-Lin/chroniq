# Contributing

Thanks for contributing to `Chroniq`.

## Principles

- Keep the product local-first.
- Keep the interaction model CLI-first.
- Preserve append-only storage semantics unless there is a strong reason to change them.
- Preserve predictable JSON output for scripts and agents.
- Prefer small, focused changes over broad product expansion.

## Development Setup

```bash
pnpm install
pnpm check
pnpm build
```

Run the CLI locally:

```bash
pnpm dev -- --help
node ./dist/cli.js --help
```

## Pull Requests

Please:

1. Open an issue first for significant changes.
2. Keep each pull request focused on one concern.
3. Add or update docs when behavior changes.
4. Run `pnpm check` and `pnpm build` before submitting.
5. Include clear reproduction steps for bug fixes.

## Design Boundaries

Changes are less likely to be accepted if they:

- add heavy configuration early
- introduce a GUI-first workflow
- tightly couple the tool to one external service
- make machine-readable output unstable
- turn capture into a complex productivity system

## Code Style

- Use TypeScript.
- Keep dependencies minimal.
- Prefer simple file-based abstractions.
- Make CLI behavior explicit and easy to script.

## Reporting Problems

When reporting a bug, include:

- command used
- expected behavior
- actual behavior
- sample input if relevant
- environment details

## Community

By participating in this project, you agree to follow the [Code of Conduct](/Users/linhuizi/Desktop/personal-log/CODE_OF_CONDUCT.md).
