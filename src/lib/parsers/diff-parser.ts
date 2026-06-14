import { createTwoFilesPatch } from "diff";

import type { GeneratedFileDiff, ReviewSourceFile } from "@/types/review";

type GenerateUnifiedDiffParams = {
  oldContent: string;
  newContent: string;
  filePath: string;
};

export function generateUnifiedDiff({
  oldContent,
  newContent,
  filePath,
}: GenerateUnifiedDiffParams): string {
  const normalizedFilePath = filePath.trim() || "src/example.tsx";

  return createTwoFilesPatch(
    `a/${normalizedFilePath}`,
    `b/${normalizedFilePath}`,
    oldContent,
    newContent,
    "",
    "",
    { context: 3 }
  );
}

function normalizePath(value: string): string {
  return value
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .trim()
    .toLowerCase();
}

function filenameFromPath(value: string): string {
  const normalized = value.replace(/\\/g, "/");
  return normalized.split("/").filter(Boolean).pop() ?? normalized;
}

function matchKey(file: ReviewSourceFile): string {
  return normalizePath(file.path || file.name || filenameFromPath(file.path));
}

function fallbackMatchKey(file: ReviewSourceFile): string {
  return normalizePath(filenameFromPath(file.name || file.path));
}

function createDiffId(filePath: string, index: number): string {
  return `${normalizePath(filePath) || "file"}-${index}`;
}

function countChangedLines(diff: string): { additions: number; deletions: number } {
  return diff.split("\n").reduce(
    (counts, line) => {
      if (line.startsWith("+++") || line.startsWith("---")) {
        return counts;
      }

      if (line.startsWith("+")) {
        counts.additions += 1;
      } else if (line.startsWith("-")) {
        counts.deletions += 1;
      }

      return counts;
    },
    { additions: 0, deletions: 0 }
  );
}

function pickLanguage(oldFile?: ReviewSourceFile, newFile?: ReviewSourceFile): string {
  return newFile?.language || oldFile?.language || "Text";
}

function createGeneratedFileDiff({
  oldFile,
  newFile,
  index,
}: {
  oldFile?: ReviewSourceFile;
  newFile?: ReviewSourceFile;
  index: number;
}): GeneratedFileDiff {
  const filePath =
    newFile?.path ||
    oldFile?.path ||
    newFile?.name ||
    oldFile?.name ||
    "unknown-file";
  const status = oldFile && newFile ? "modified" : oldFile ? "deleted" : "added";
  const diff = generateUnifiedDiff({
    oldContent: oldFile?.content ?? "",
    newContent: newFile?.content ?? "",
    filePath,
  });
  const { additions, deletions } = countChangedLines(diff);

  return {
    id: createDiffId(filePath, index),
    filePath,
    language: pickLanguage(oldFile, newFile),
    oldFile,
    newFile,
    status,
    diff,
    additions,
    deletions,
  };
}

export function generateMultiFileDiffs({
  oldFiles,
  newFiles,
}: {
  oldFiles: ReviewSourceFile[];
  newFiles: ReviewSourceFile[];
}): GeneratedFileDiff[] {
  const oldByPath = new Map(oldFiles.map((file) => [matchKey(file), file]));
  const newByPath = new Map(newFiles.map((file) => [matchKey(file), file]));
  const oldByName = new Map(oldFiles.map((file) => [fallbackMatchKey(file), file]));
  const newByName = new Map(newFiles.map((file) => [fallbackMatchKey(file), file]));
  const usedOldIds = new Set<string>();
  const usedNewIds = new Set<string>();
  const diffs: GeneratedFileDiff[] = [];

  newFiles.forEach((newFile) => {
    const byPath = oldByPath.get(matchKey(newFile));
    const byName = oldByName.get(fallbackMatchKey(newFile));
    const oldFile =
      byPath && !usedOldIds.has(byPath.id)
        ? byPath
        : byName && !usedOldIds.has(byName.id)
          ? byName
          : undefined;

    if (oldFile) {
      usedOldIds.add(oldFile.id);
    }

    usedNewIds.add(newFile.id);
    diffs.push(
      createGeneratedFileDiff({
        oldFile,
        newFile,
        index: diffs.length,
      })
    );
  });

  oldFiles.forEach((oldFile) => {
    if (usedOldIds.has(oldFile.id)) {
      return;
    }

    const byPath = newByPath.get(matchKey(oldFile));
    const byName = newByName.get(fallbackMatchKey(oldFile));
    const newFile =
      byPath && !usedNewIds.has(byPath.id)
        ? byPath
        : byName && !usedNewIds.has(byName.id)
          ? byName
          : undefined;

    if (newFile) {
      usedNewIds.add(newFile.id);
    }

    diffs.push(
      createGeneratedFileDiff({
        oldFile,
        newFile,
        index: diffs.length,
      })
    );
  });

  return diffs.filter((diff) => {
    if (diff.status !== "modified") {
      return true;
    }

    return diff.oldFile?.content !== diff.newFile?.content;
  });
}

export function combineGeneratedDiffs(diffs: GeneratedFileDiff[]): string {
  return diffs
    .filter((fileDiff) => fileDiff.diff.trim().length > 0)
    .map((fileDiff) => fileDiff.diff.trimEnd())
    .join("\n\n");
}
