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

export function runAdd(content: string, tags: string[]) {
  if (!content.trim()) {
    console.error("内容不能为空");
    process.exit(1);
  }
  const { clean, tags: inlineTags } = extractInlineTags(content);
  const allTags = [...tags, ...inlineTags];
  const finalContent = clean || content.trim();
  const entry = createEntry(finalContent, allTags, "cli");
  appendEntry(entry);
  const single = entry.content.replace(/\n/g, " ↵ ");
  const preview = single.length > 60 ? single.slice(0, 59) + "…" : single;
  console.log(`✓ 已记录: ${preview}  (ID: ${entry.id})`);
}
