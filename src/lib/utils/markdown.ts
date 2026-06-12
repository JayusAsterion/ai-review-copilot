import type { ReviewResult } from "@/types/review";

const severityLabel = {
  info: "Info",
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

export function reviewResultToMarkdown(result: ReviewResult): string {
  const findings =
    result.findings.length > 0
      ? result.findings
          .map((finding, index) => {
            const location = [
              finding.file ? `File: ${finding.file}` : null,
              finding.line ? `Line: ${finding.line}` : null,
            ]
              .filter(Boolean)
              .join(", ");

            return [
              `### ${index + 1}. ${finding.title}`,
              "",
              `- Severity: ${severityLabel[finding.severity]}`,
              `- Type: ${finding.type}`,
              location ? `- Location: ${location}` : null,
              "",
              finding.description,
              "",
              `Suggested fix: ${finding.suggestedFix}`,
            ]
              .filter(Boolean)
              .join("\n");
          })
          .join("\n\n")
      : "No findings were detected.";

  const testCases =
    result.testCases.length > 0
      ? result.testCases.map((testCase) => `- ${testCase}`).join("\n")
      : "- No additional test cases suggested.";

  return [
    "# Code Review Result",
    "",
    "## Summary",
    "",
    result.summary,
    "",
    `Risk level: ${result.riskLevel.toUpperCase()}`,
    "",
    "## Findings",
    "",
    findings,
    "",
    "## Suggested Test Cases",
    "",
    testCases,
    "",
    "## PR Comment",
    "",
    result.prComment,
  ].join("\n");
}
