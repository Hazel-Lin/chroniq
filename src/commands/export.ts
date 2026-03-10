import { readAllEntries } from "../lib/store.js";

export function runExport(format: string) {
  const entries = readAllEntries();
  if (format !== "json") {
    console.error(`暂不支持导出格式: ${format}`);
    process.exit(1);
  }
  console.log(JSON.stringify(entries, null, 2));
}
