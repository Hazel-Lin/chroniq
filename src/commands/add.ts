import * as readline from "node:readline";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendEntry, createEntry } from "../lib/store.js";

const HASHTAG_RE = /#([\w\u4e00-\u9fff]+)/g;

export function extractInlineTags(content: string): { clean: string; tags: string[] } {
  const tags: string[] = [];
  const clean = content.replace(HASHTAG_RE, (_, tag) => {
    tags.push(tag);
    return "";
  }).replace(/\s{2,}/g, " ").trim();
  return { clean, tags };
}

function addSingleEntry(content: string, tags: string[]) {
  const { clean, tags: inlineTags } = extractInlineTags(content);
  const allTags = [...tags, ...inlineTags];
  const finalContent = clean || content.trim();
  const entry = createEntry(finalContent, allTags, "cli");
  appendEntry(entry);
  const single = entry.content.replace(/\n/g, " ↵ ");
  const preview = single.length > 60 ? single.slice(0, 59) + "…" : single;
  console.log(`✓ 已记录: ${preview}  (ID: ${entry.id})`);
  return entry;
}

function readFromEditor(): string[] | null {
  // 获取用户的默认编辑器
  const editor = process.env.EDITOR || process.env.VISUAL || "vim";

  // 创建临时目录和文件
  const tmpDir = mkdtempSync(join(tmpdir(), "chroniq-"));
  const tmpFile = join(tmpDir, "input.txt");

  // 提示信息
  const helpText = `# 在此输入多行记录（每行一条）
# 可以使用 #标签 来添加标签
# 保存并退出编辑器后，将自动记录
#
# 提示：
# - 空行会被自动过滤
# - 以 # 开头的行会被忽略（注释）
# - 删除所有内容等同于取消

`;

  // 写入提示信息到临时文件
  writeFileSync(tmpFile, helpText, "utf8");

  try {
    // 打开编辑器
    const result = spawnSync(editor, [tmpFile], {
      stdio: "inherit",
      shell: true,
    });

    // 用户取消编辑（Ctrl+C 或编辑器退出码非0）
    if (result.status !== 0) {
      return null;
    }

    // 读取编辑后的内容
    const content = readFileSync(tmpFile, "utf8");

    // 按行分割，过滤空行和注释行
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    return lines;
  } finally {
    // 清理临时文件
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // 忽略清理错误
    }
  }
}

async function readMultilineInput(): Promise<string[] | null> {
  return new Promise((resolve) => {
    const lines: string[] = [];
    let cancelled = false;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: process.stdin.isTTY, // 终端模式下启用编辑功能
    });

    // 处理 Ctrl+C（SIGINT）取消输入
    const handleCancel = () => {
      cancelled = true;
      rl.close();
    };

    rl.on("SIGINT", handleCancel);
    process.on("SIGINT", handleCancel);

    rl.on("line", (line) => {
      const trimmed = line.trim();

      // 处理特殊命令
      if (trimmed === ":u" || trimmed === ":undo") {
        if (lines.length > 0) {
          const removed = lines.pop();
          console.log(`↶ 已撤销: ${removed}`);
        } else {
          console.log("⚠️  没有可撤销的内容");
        }
        return;
      }

      if (trimmed === ":l" || trimmed === ":list") {
        if (lines.length === 0) {
          console.log("📝 暂无内容");
        } else {
          console.log(`\n📋 已输入 ${lines.length} 行:`);
          lines.forEach((l, i) => {
            const preview = l.length > 50 ? l.slice(0, 49) + "…" : l;
            console.log(`  ${i + 1}. ${preview}`);
          });
          console.log();
        }
        return;
      }

      if (trimmed === ":c" || trimmed === ":clear") {
        const count = lines.length;
        lines.length = 0; // 清空数组
        console.log(`🗑️  已清空 ${count} 行内容`);
        return;
      }

      // 正常内容
      lines.push(line);
    });

    rl.on("close", () => {
      // 移除 SIGINT 监听器，避免影响其他操作
      process.removeListener("SIGINT", handleCancel);

      if (cancelled) {
        resolve(null); // 返回 null 表示用户取消
      } else {
        resolve(lines);
      }
    });
  });
}

export async function runAdd(content: string | undefined, tags: string[]) {
  // 如果没有提供 content，进入交互式多行模式
  if (!content) {
    let lines: string[] | null;

    // 如果是终端交互，使用编辑器模式
    if (process.stdin.isTTY) {
      console.log("📝 正在打开编辑器...");
      if (tags.length > 0) {
        console.log(`🏷️  全局标签: ${tags.join(", ")}`);
      }

      lines = readFromEditor();
    } else {
      // 管道输入，使用 readline 模式
      console.log("📝 进入多行记录模式（每行一条记录）");
      if (tags.length > 0) {
        console.log(`🏷️  全局标签: ${tags.join(", ")}`);
      }
      console.log("💡 提示：可以在每行使用 #标签 来添加标签");
      console.log("⌨️  操作：Ctrl+D 保存退出 | Ctrl+C 取消不保存");
      console.log("🔧 命令：:u 撤销上一行 | :l 列出所有行 | :c 清空重来\n");

      lines = await readMultilineInput();
    }

    // 用户按 Ctrl+C 取消
    if (lines === null) {
      console.log("\n❌ 已取消，未保存任何内容");
      process.exit(0);
    }

    const validLines = lines
      .map((line) => line.trim())
      .filter(Boolean); // 过滤空行

    if (validLines.length === 0) {
      console.error("❌ 没有输入任何内容");
      process.exit(1);
    }

    console.log(`\n开始记录 ${validLines.length} 条...\n`);
    let successCount = 0;

    for (const line of validLines) {
      try {
        addSingleEntry(line, tags);
        successCount++;
      } catch (error) {
        console.error(`❌ 记录失败: ${line}`);
      }
    }

    console.log(`\n🎉 成功记录 ${successCount}/${validLines.length} 条`);
    return;
  }

  // 单条记录模式
  if (!content.trim()) {
    console.error("❌ 内容不能为空");
    process.exit(1);
  }

  addSingleEntry(content, tags);
}
