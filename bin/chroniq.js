#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distCli = path.resolve(__dirname, "../dist/cli.js");

if (!existsSync(distCli)) {
  console.error("Chroniq 尚未构建，请先运行 `pnpm install` 和 `pnpm build`。");
  process.exit(1);
}

const child = spawn(process.execPath, [distCli, ...process.argv.slice(2)], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
