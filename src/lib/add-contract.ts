export type AddSourceMode = "argv" | "batch" | "multiline" | "stdin" | "file";

export type SplitMode = "auto" | "bullets" | "paragraphs";
export type BlockReadMode = "editor" | "stdin";

export interface AddCommandOptions {
  tags: string[];
  multiline?: boolean;
  stdin?: boolean;
  file?: string;
  split?: SplitMode;
}

export interface ResolvedAddContract {
  content?: string;
  file?: string;
  sourceMode: AddSourceMode;
  split?: SplitMode;
  tags: string[];
}

export class AddContractError extends Error {}

export function resolveBlockReadMode(sourceMode: AddSourceMode, stdinIsTTY: boolean): BlockReadMode {
  if (sourceMode === "multiline") {
    return "editor";
  }

  if (sourceMode === "stdin") {
    return stdinIsTTY ? "editor" : "stdin";
  }

  throw new AddContractError(`source mode ${sourceMode} does not support block input`);
}

export function resolveAddContract(
  content: string | undefined,
  options: AddCommandOptions,
): ResolvedAddContract {
  const normalizedContent = content?.trim() ? content : undefined;

  const enabledSources = [
    Boolean(normalizedContent),
    Boolean(options.multiline),
    Boolean(options.stdin),
    Boolean(options.file),
  ].filter(Boolean).length;

  if (enabledSources > 1) {
    throw new AddContractError("输入来源冲突：content、--multiline、--stdin、--file 只能选一种");
  }

  if (options.file && !options.file.trim()) {
    throw new AddContractError("--file 不能为空");
  }

  if (normalizedContent) {
    return {
      content: normalizedContent,
      sourceMode: "argv",
      split: options.split,
      tags: options.tags,
    };
  }

  if (options.multiline) {
    return {
      sourceMode: "multiline",
      split: options.split,
      tags: options.tags,
    };
  }

  if (options.stdin) {
    return {
      sourceMode: "stdin",
      split: options.split,
      tags: options.tags,
    };
  }

  if (options.file) {
    return {
      file: options.file.trim(),
      sourceMode: "file",
      split: options.split,
      tags: options.tags,
    };
  }

  return {
    sourceMode: "batch",
    split: options.split,
    tags: options.tags,
  };
}
