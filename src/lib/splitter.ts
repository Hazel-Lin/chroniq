import { SplitMode } from "./add-contract.js";

const BULLET_LINE_RE = /^\s*(?:[-*+]|(?:\d+[.)])|(?:\[[ xX]\]))\s+(.*)$/;

function normalizeBlock(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function splitParagraphs(text: string): string[] {
  const normalized = normalizeBlock(text);
  if (!normalized) {
    return [];
  }

  const chunks = normalized
    .split(/\n\s*\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks;
}

function splitBullets(text: string): string[] {
  const normalized = normalizeBlock(text);
  if (!normalized) {
    return [];
  }

  const entries: string[] = [];
  let current: string[] = [];

  for (const rawLine of normalized.split("\n")) {
    const line = rawLine.trimEnd();
    const bulletMatch = line.match(BULLET_LINE_RE);

    if (bulletMatch) {
      if (current.length > 0) {
        entries.push(current.join("\n").trim());
      }
      current = [bulletMatch[1]];
      continue;
    }

    if (!line.trim()) {
      if (current.length > 0) {
        entries.push(current.join("\n").trim());
        current = [];
      }
      continue;
    }

    if (current.length === 0) {
      current = [line.trim()];
    } else {
      current.push(line.trim());
    }
  }

  if (current.length > 0) {
    entries.push(current.join("\n").trim());
  }

  return entries.filter(Boolean);
}

export function splitInputBlock(text: string, mode: SplitMode): string[] {
  if (mode === "bullets") {
    return splitBullets(text);
  }

  if (mode === "paragraphs") {
    return splitParagraphs(text);
  }

  const bulletCount = normalizeBlock(text)
    .split("\n")
    .filter((line) => BULLET_LINE_RE.test(line))
    .length;

  if (bulletCount >= 2) {
    return splitBullets(text);
  }

  return splitParagraphs(text);
}
