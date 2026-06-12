import { createTwoFilesPatch } from "diff";

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
