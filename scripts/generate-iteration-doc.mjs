import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function runGit(args, fallback = "") {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return fallback;
  }
}

function safeStat(args) {
  return runGit(args, "");
}

function parseChangedPaths(output) {
  if (!output) return [];

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.includes("\t")) {
        const parts = line.split("\t");
        return parts[parts.length - 1]?.trim() ?? "";
      }

      return line.replace(/^[A-Z?]+\s+/, "").trim();
    })
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

function classifyArea(filePath) {
  if (filePath.startsWith("src/")) return "cli";
  if (filePath.startsWith("scripts/")) return "automation";
  if (filePath.startsWith("docs/")) return "docs";
  if (filePath.startsWith("bin/")) return "distribution";
  if (filePath === "package.json" || filePath.endsWith(".lock")) return "tooling";
  if (filePath.startsWith(".githooks/")) return "automation";
  if (filePath.startsWith(".github/")) return "automation";
  return "project";
}

function describeArea(area) {
  switch (area) {
    case "cli":
      return "CLI behavior or command surface";
    case "automation":
      return "local automation or project workflow";
    case "docs":
      return "product docs or iteration guidance";
    case "distribution":
      return "binary entrypoint or packaging wrapper";
    case "tooling":
      return "package metadata or development tooling";
    default:
      return "general project files";
  }
}

function inferFocus(areas) {
  if (areas.includes("cli")) return "CLI capability and user-facing command flow";
  if (areas.includes("automation")) return "developer workflow automation";
  if (areas.includes("docs")) return "product framing and documentation";
  if (areas.includes("tooling")) return "tooling and package surface";
  return "general project iteration";
}

function inferDecision(commitMessage, areas, mode) {
  const lower = commitMessage.toLowerCase();

  if (lower.includes("docs") || areas.includes("docs")) {
    return "This iteration sharpened product framing or developer guidance so the project direction is easier to follow.";
  }

  if (lower.includes("feat") || areas.includes("cli")) {
    return "This iteration prioritized the command surface and the capture workflow over broader platform expansion.";
  }

  if (areas.includes("automation")) {
    return "This iteration invested in workflow automation so iteration traces become easier to preserve and reuse.";
  }

  if (areas.includes("tooling") || areas.includes("distribution")) {
    return "This iteration adjusted the package and command surface to reduce friction in daily use.";
  }

  if (mode === "manual") {
    return "This checkpoint captures work in progress before it hardens into a commit, so the main value is preserving intent and traceability.";
  }

  return "This iteration moved the project forward in a focused slice, with the main goal inferred from the touched files and latest commit.";
}

function inferNextSteps(areas, workingTreeStatus) {
  const steps = [];

  if (areas.includes("cli")) {
    steps.push("Run the updated CLI flow against a real Chroniq use case and verify the output shape.");
  }

  if (areas.includes("automation")) {
    steps.push("Validate the automation on the next real iteration to confirm it stays low-friction.");
  }

  if (areas.includes("docs")) {
    steps.push("Check whether the new docs imply a follow-up code change or just clarify existing behavior.");
  }

  if (workingTreeStatus) {
    steps.push("Resolve the remaining working tree changes so the next snapshot is easier to compare.");
  } else {
    steps.push("Use the next meaningful checkpoint to confirm this iteration changed real usage, not just repo shape.");
  }

  return steps.slice(0, 3);
}

function inferRisks(areas, paths, workingTreeStatus, mode, stagedDiffStat, unstagedDiffStat) {
  const risks = [];

  if (workingTreeStatus) {
    risks.push("Working tree is not clean, so the next commit may partially overlap with this checkpoint.");
  }

  if (areas.includes("docs") && !areas.includes("cli") && !areas.includes("automation")) {
    risks.push("This iteration is documentation-heavy, so product clarity may advance faster than shipped behavior.");
  }

  if (paths.includes("package.json") && !paths.some((filePath) => filePath.endsWith("pnpm-lock.yaml"))) {
    risks.push("Package metadata changed without a lockfile update, so dependency state may drift later.");
  }

  if (mode === "manual" && !stagedDiffStat && !unstagedDiffStat) {
    risks.push("Manual checkpoint was created with no visible diff stat, so it may not represent a meaningful iteration.");
  }

  if (risks.length === 0) {
    risks.push("No obvious structural risk detected from git metadata alone; validate with one real usage pass.");
  }

  return risks.slice(0, 3);
}

const repoRoot = runGit(["rev-parse", "--show-toplevel"], process.cwd());
const args = process.argv.slice(2);
const modeArgIndex = args.findIndex((arg) => arg === "--mode");
const mode = modeArgIndex >= 0 ? args[modeArgIndex + 1] ?? "manual" : "manual";

const now = new Date();
const timestamp = now.toISOString();
const fileStamp = timestamp.replace(/:/g, "-").replace(/\.\d{3}Z$/, "Z");
const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"], "unknown");
const shortSha = runGit(["rev-parse", "--short", "HEAD"], "working-tree");
const latestCommitMessage = runGit(["log", "-1", "--pretty=%s"], "No commits yet");
const latestCommitBody = runGit(["log", "-1", "--pretty=%b"], "");
const latestCommitAt = runGit(["log", "-1", "--date=iso", "--pretty=%cd"], timestamp);
const recentCommits = runGit(["log", "--oneline", "-3"], "");
const workingTreeStatus = safeStat(["status", "--short"]);
const stagedDiffStat = safeStat(["diff", "--cached", "--stat"]);
const unstagedDiffStat = safeStat(["diff", "--stat"]);
const headDiffStat = safeStat(["show", "--stat", "--format=", "HEAD"]);
const changedFiles =
  mode === "post-commit"
    ? safeStat(["show", "--name-status", "--format=", "HEAD"])
    : safeStat(["status", "--short"]);
const changedPaths = parseChangedPaths(changedFiles);
const touchedAreas = unique(changedPaths.map(classifyArea));
const focus = inferFocus(touchedAreas);
const productDecision = inferDecision(latestCommitMessage, touchedAreas, mode);
const nextSteps = inferNextSteps(touchedAreas, workingTreeStatus);
const risks = inferRisks(touchedAreas, changedPaths, workingTreeStatus, mode, stagedDiffStat, unstagedDiffStat);
const touchedAreaLabels = touchedAreas.map(describeArea);

const docsDir = path.join(repoRoot, "docs");
const iterationDir = path.join(docsDir, "iterations");
fs.mkdirSync(iterationDir, { recursive: true });

const titleMode = mode === "post-commit" ? "Post-Commit" : "Manual Checkpoint";
const primaryStat = mode === "post-commit" ? headDiffStat : stagedDiffStat || unstagedDiffStat;
const fileName = `${fileStamp}_${mode}_${shortSha}.md`;
const filePath = path.join(iterationDir, fileName);

const lines = [
  "# Chroniq Product Iteration Log",
  "",
  `- Generated at: ${timestamp}`,
  `- Mode: ${titleMode}`,
  `- Branch: ${branch}`,
  `- Head: ${shortSha}`,
  `- Focus: ${focus}`,
  "",
  "## What Changed",
  "",
  `- Latest commit: ${latestCommitMessage}`,
  `- Commit time: ${latestCommitAt}`,
];

if (latestCommitBody) {
  lines.push(`- Commit body: ${latestCommitBody.replace(/\n+/g, " | ")}`);
}

if (touchedAreaLabels.length > 0) {
  lines.push(`- Touched areas: ${touchedAreaLabels.join("; ")}`);
}

if (changedPaths.length > 0) {
  lines.push(`- Changed file count: ${changedPaths.length}`);
}

lines.push("", "### Diff Summary", "");

if (primaryStat) {
  lines.push("```text", primaryStat, "```");
} else {
  lines.push("- No diff stat available.");
}

lines.push("", "## Product Decision", "", `- ${productDecision}`);

if (touchedAreas.includes("cli")) {
  lines.push("- The iteration still fits the core product path: better capture workflow over broader app surface.");
}

if (touchedAreas.includes("docs")) {
  lines.push("- The docs now carry more product intent, which helps future decisions stay inside the capture-layer boundary.");
}

lines.push("", "## Next Step", "");

for (const step of nextSteps) {
  lines.push(`- ${step}`);
}

lines.push("- Add any human-only context here if this iteration changed priorities, scope, or validation strategy.");
lines.push("", "## Risks", "");

for (const risk of risks) {
  lines.push(`- ${risk}`);
}

lines.push("", "## Snapshot", "", "### Changed Files", "");

if (changedFiles) {
  lines.push("```text", changedFiles, "```");
} else {
  lines.push("- No changed files captured.");
}

lines.push("", "### Working Tree", "");

if (workingTreeStatus) {
  lines.push("```text", workingTreeStatus, "```");
} else {
  lines.push("- Working tree clean.");
}

lines.push("", "### Recent Commits", "");

if (recentCommits) {
  lines.push("```text", recentCommits, "```");
} else {
  lines.push("- No commit history available.");
}

if (mode !== "post-commit") {
  lines.push("", "### Unstaged Diff Stat", "");
  if (unstagedDiffStat) {
    lines.push("```text", unstagedDiffStat, "```");
  } else {
    lines.push("- No unstaged diff.");
  }
}

lines.push(
  "",
  "## Notes",
  "",
  "- Add any product reasoning that git metadata could not infer.",
  "- If this changed roadmap or scope, write the new rule explicitly.",
  "- If this exposed a risk, add the mitigation before the next checkpoint.",
  ""
);

fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
console.log(filePath);
