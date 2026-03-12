import { Command, Option } from "commander";
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

function addInputOptions<T extends Command>(command: T) {
  return command
    .option("-m, --multiline", "用编辑器录入单条多行内容")
    .option("--stdin", "将整个标准输入作为单条记录写入；TTY 下自动打开编辑器")
    .addOption(new Option("--split <mode>", "按规则拆成多条记录").choices(["auto", "bullets", "paragraphs"]));
}

addInputOptions(program
  .command("add")
  .description("新增一条或多条记录")
  .argument("[content...]", "记录内容（多个词会自动拼接）；不提供内容则进入多行模式")
  .addHelpText("after", "\n示例:\n  cq add 想到一个方案 #idea                      # 单条记录\n  cq add 完成任务A 完成任务B #work               # 行内标签\n  cq add                                         # 多行模式（Ctrl+D 结束）\n  cq add --multiline                             # 编辑器录入单条多行\n  cat note.md | cq add --stdin                   # 标准输入保存为单条记录\n  cat bullets.txt | cq add --stdin --split auto  # 自动拆分多条\n  cq today --full                                # 按原换行查看正文\n  cq list --date 2026-03-12 --full               # 查看某天全文")
  .action(async (...args: unknown[]) => {
    const parts = (args[0] as string[]) || [];
    const command = args.at(-1) as Command;

    // 从父级 program 获取 --tag 选项
    const parentOpts = command.parent?.opts<{ tag?: string[] }>();
    const commandOpts = command.opts<{ multiline?: boolean; stdin?: boolean; split?: AddCommandOptions["split"] }>();
    const addOptions: AddCommandOptions = {
      tags: parentOpts?.tag || [],
      multiline: Boolean(commandOpts.multiline),
      stdin: Boolean(commandOpts.stdin),
      split: commandOpts.split,
    };
    const content = parts.length > 0 ? parts.join(" ") : undefined;
    await runAdd(content, addOptions);
  }));

program
  .command("today")
  .description("查看今天的记录")
  .option("--json", "以 JSON 输出")
  .option("--full", "按原换行展示正文")
  .action((options: { json?: boolean; full?: boolean }) => {
    runToday(Boolean(options.json), Boolean(options.full));
  });

program
  .command("list")
  .description("列出可用日期或查看指定日期的记录")
  .option("-d, --date <date>", "指定日期，格式 YYYY-MM-DD")
  .option("--json", "以 JSON 输出")
  .option("--full", "按原换行展示正文")
  .action((options: { date?: string; json?: boolean; full?: boolean }) => {
    runList(options.date, Boolean(options.json), Boolean(options.full));
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
program.action(async (...args: unknown[]) => {
  const parts = (args[0] as string[]) || [];
  const command = args.at(-1) as Command;
  const options = command.opts<{ tag: string[] }>();

  // 如果没有任何参数且在终端环境，显示欢迎卡片
  // 如果有 --tag 参数但没有内容，进入多行模式
  if (parts.length === 0 && options.tag.length === 0 && process.stdin.isTTY) {
    console.log(renderWelcomeScreen());
  } else {
    const content = parts.length > 0 ? parts.join(" ") : undefined;
    await runAdd(content, {
      tags: options.tag,
    });
  }
});

program.parse();
