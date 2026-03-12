import { Command } from "commander";
import { runAdd } from "./commands/add.js";
import { runExport } from "./commands/export.js";
import { runList } from "./commands/list.js";
import { runToday } from "./commands/today.js";
import { AddCommandOptions } from "./lib/add-contract.js";
import { renderWelcomeScreen } from "./lib/welcome.js";

const program = new Command();

program
  .name("chroniq")
  .description("Chroniq: local-first, CLI-first, agent-friendly personal logging")
  .version("0.1.0");

function collectTag(val: string, prev: string[] = []) {
  return prev.concat(val.split(",").map((t) => t.trim()).filter(Boolean));
}

program
  .command("add")
  .description("新增一条或多条记录")
  .argument("[content...]", "记录内容（多个词会自动拼接）；不提供内容则进入多行模式")
  .addHelpText("after", "\n示例:\n  cq add 想到一个方案 #idea           # 单条记录\n  cq add 完成任务A 完成任务B #work    # 行内标签\n  cq add                              # 多行模式（Ctrl+D 结束）\n  cq --tag work add                   # 多行模式 + 全局标签\n  cq --tag work,idea add              # 多个全局标签")
  .action(async (parts: string[], options, command) => {
    // 从父级 program 获取 --tag 选项
    const parentOpts = command.parent?.opts();
    const addOptions: AddCommandOptions = {
      tags: parentOpts?.tag || [],
    };
    const content = parts.length > 0 ? parts.join(" ") : undefined;
    await runAdd(content, addOptions);
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
program.action(async (parts: string[], options: { tag: string[] }) => {
  // 如果没有任何参数且在终端环境，显示欢迎卡片
  // 如果有 --tag 参数但没有内容，进入多行模式
  if (parts.length === 0 && options.tag.length === 0 && process.stdin.isTTY) {
    console.log(renderWelcomeScreen());
  } else {
    const content = parts.length > 0 ? parts.join(" ") : undefined;
    await runAdd(content, { tags: options.tag });
  }
});

program.parse();
