import { Command } from "commander";
import { runAdd } from "./commands/add.js";
import { runExport } from "./commands/export.js";
import { runList } from "./commands/list.js";
import { runToday } from "./commands/today.js";

const program = new Command();

program
  .name("chroniq")
  .description("Chroniq: local-first, CLI-first, agent-friendly personal logging")
  .version("0.1.0");

function collectTag(val: string, prev: string[]) {
  return prev.concat(val.split(",").map((t) => t.trim()).filter(Boolean));
}

program
  .command("add")
  .description("新增一条记录")
  .argument("<content...>", "记录内容（多个词会自动拼接）")
  .option("-t, --tag <tag>", "附加标签（可多次指定，或用逗号分隔）", collectTag, [] as string[])
  .addHelpText("after", "\n提示: 内容里可用 #tag 自动标记，如: cq add 想到一个方案 #idea")
  .action((parts: string[], options: { tag: string[] }) => {
    runAdd(parts.join(" "), options.tag);
  });

program
  .command("today")
  .description("查看今天的记录")
  .option("--json", "以 JSON 输出")
  .action((options: { json?: boolean }) => {
    runToday(Boolean(options.json));
  });

program
  .command("list")
  .description("列出可用日期或查看指定日期的记录")
  .option("-d, --date <date>", "指定日期，格式 YYYY-MM-DD")
  .option("--json", "以 JSON 输出")
  .action((options: { date?: string; json?: boolean }) => {
    runList(options.date, Boolean(options.json));
  });

program
  .command("export")
  .description("导出全部记录")
  .option("-f, --format <format>", "导出格式", "json")
  .action((options: { format: string }) => {
    runExport(options.format);
  });

// 默认命令：cq 内容 等同于 cq add 内容
program.argument("[content...]", "快速记录（等同于 cq add）");
program.option("-t, --tag <tag>", "附加标签", collectTag, [] as string[]);
program.action((parts: string[], options: { tag: string[] }) => {
  if (parts.length > 0) {
    runAdd(parts.join(" "), options.tag);
  } else {
    program.help();
  }
});

program.parse();
