import os from "node:os";
import path from "node:path";
import packageJson from "../../package.json" with { type: "json" };

type Segment = {
  text: string;
  styles?: string[];
};

const ANSI_RESET = "\x1b[0m";

function applyStyles(text: string, styles: string[] = []) {
  if (!process.stdout.isTTY || styles.length === 0) {
    return text;
  }

  const codes = styles.map((style) => {
    switch (style) {
      case "bold":
        return "1";
      case "dim":
        return "2";
      case "cyan":
        return "36";
      case "green":
        return "32";
      case "gray":
        return "90";
      default:
        return "";
    }
  }).filter(Boolean);

  if (codes.length === 0) {
    return text;
  }

  return `\x1b[${codes.join(";")}m${text}${ANSI_RESET}`;
}

function textWidth(text: string) {
  return Array.from(text).length;
}

function padRight(text: string, width: number) {
  return text + " ".repeat(Math.max(0, width - textWidth(text)));
}

function relativizeHome(targetPath: string) {
  const home = os.homedir();
  if (targetPath === home) {
    return "~";
  }
  if (targetPath.startsWith(`${home}${path.sep}`)) {
    return `~${path.sep}${targetPath.slice(home.length + 1)}`;
  }
  return targetPath;
}

function centerTruncate(text: string, maxWidth: number) {
  if (maxWidth <= 0) {
    return "";
  }
  if (textWidth(text) <= maxWidth) {
    return text;
  }
  if (maxWidth <= 3) {
    return ".".repeat(maxWidth);
  }

  const chars = Array.from(text);
  const head = Math.ceil((maxWidth - 1) / 2);
  const tail = Math.floor((maxWidth - 1) / 2);
  return `${chars.slice(0, head).join("")}…${chars.slice(chars.length - tail).join("")}`;
}

function renderSegmentRow(segments: Segment[], innerWidth: number) {
  const plain = segments.map((segment) => segment.text).join("");
  const styled = segments
    .map((segment) => applyStyles(segment.text, segment.styles))
    .join("");
  return `│ ${styled}${" ".repeat(Math.max(0, innerWidth - textWidth(plain)))} │`;
}

function renderPlainRow(text: string, innerWidth: number) {
  return `│ ${padRight(text, innerWidth)} │`;
}

export function renderWelcomeScreen() {
  const termWidth = process.stdout.columns ?? 80;
  const maxInnerWidth = Math.max(36, Math.min(72, termWidth - 4));

  const directoryLabel = "directory: ";
  const directoryValue = centerTruncate(
    relativizeHome(process.cwd()),
    maxInnerWidth - textWidth(directoryLabel),
  );

  const rows = [
    renderSegmentRow([
      { text: ">_ ", styles: ["dim"] },
      { text: "Chroniq", styles: ["cyan", "bold"] },
      { text: ` (v${packageJson.version})`, styles: ["gray"] },
    ], maxInnerWidth),
    renderPlainRow("", maxInnerWidth),
    renderSegmentRow([
      { text: "mode:      ", styles: ["dim"] },
      { text: "local-first personal logging", styles: ["bold"] },
    ], maxInnerWidth),
    renderSegmentRow([
      { text: "storage:   ", styles: ["dim"] },
      { text: "data/logs/YYYY-MM-DD.jsonl" },
    ], maxInnerWidth),
    renderSegmentRow([
      { text: directoryLabel, styles: ["dim"] },
      { text: directoryValue },
    ], maxInnerWidth),
    renderSegmentRow([
      { text: "aliases:   ", styles: ["dim"] },
      { text: "chroniq / cq" },
    ], maxInnerWidth),
  ];

  const border = "─".repeat(maxInnerWidth + 2);
  const card = [
    applyStyles(`╭${border}╮`, ["dim"]),
    ...rows,
    applyStyles(`╰${border}╯`, ["dim"]),
  ].join("\n");

  const tips = [
    `${applyStyles("Tip:", ["green", "bold"])} 运行 ${applyStyles("chroniq add \"今天的想法 #idea\"", ["cyan"])} 快速记录`,
    `${applyStyles("›", ["cyan", "bold"])} chroniq add        # 多行多条`,
    `${applyStyles("›", ["cyan", "bold"])} chroniq add --stdin # 多行单条`,
    `${applyStyles("›", ["cyan", "bold"])} chroniq today`,
    `${applyStyles("›", ["cyan", "bold"])} chroniq list`,
    `${applyStyles("›", ["cyan", "bold"])} chroniq export`,
    `${applyStyles("›", ["cyan", "bold"])} chroniq --help`,
  ].join("\n");

  return `${card}\n\n${tips}`;
}
