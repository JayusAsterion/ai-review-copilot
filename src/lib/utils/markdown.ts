import type {
  BugReportResult,
  GeneratedTestCase,
  ReviewResult,
  TestCaseResult,
} from "@/types/review";

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

function formatList(items: string[], fallback: string): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : `- ${fallback}`;
}

function formatNumberedList(items: string[], fallback: string): string {
  return items.length > 0
    ? items.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : `1. ${fallback}`;
}

export function bugReportResultToMarkdown(result: BugReportResult): string {
  return [
    `# Bug: ${result.title}`,
    "",
    "## Summary",
    result.summary,
    "",
    "## Environment",
    `- Environment: ${result.environment || "Not provided"}`,
    `- Module: ${result.module || "Not provided"}`,
    "- URL: Not provided",
    "- User Role: Not provided",
    "- Browser: Not provided",
    "- Device: Not provided",
    "- Build: Not provided",
    "",
    "## Steps to Reproduce",
    formatNumberedList(result.stepsToReproduce, "Steps were not provided."),
    "",
    "## Actual Result",
    result.actualResult || "Not provided",
    "",
    "## Expected Result",
    result.expectedResult || "Not provided",
    "",
    "## Severity / Priority",
    `- Severity: ${result.severity}`,
    `- Priority: ${result.priority}`,
    `- Reproduction Rate: ${result.reproductionRate}`,
    "",
    "## Additional Observations",
    formatList(result.additionalObservations, "No additional observations."),
    "",
    "## Suggested Test Cases",
    formatList(result.suggestedTestCases, "No suggested test cases."),
    "",
    "## Missing Information",
    formatList(result.missingInformation, "No missing information identified."),
    "",
    "## Developer Comment",
    result.developerComment,
  ].join("\n");
}

export function testCaseToMarkdown(testCase: GeneratedTestCase): string {
  return [
    `### ${testCase.id}: ${testCase.title}`,
    "",
    `- Priority: ${testCase.priority}`,
    `- Type: ${testCase.type}`,
    `- Preconditions: ${testCase.preconditions.join("; ") || "Not provided."}`,
    "- Steps:",
    ...formatNumberedList(testCase.steps, "Steps were not provided.").split(
      "\n"
    ),
    `- Expected result: ${testCase.expectedResult}`,
    "- Test data:",
    formatList(testCase.testData, "No specific test data provided."),
    `- Notes: ${testCase.notes || "No notes."}`,
  ].join("\n");
}

export function testCaseResultToMarkdown(
  result: Omit<TestCaseResult, "markdown">
): string {
  return [
    "# Test Case Coverage",
    "",
    "## Summary",
    result.summary,
    "",
    "## Coverage Focus",
    formatList(result.coverageFocus, "No coverage focus provided."),
    "",
    "## Test Cases",
    result.testCases.length > 0
      ? result.testCases.map(testCaseToMarkdown).join("\n\n")
      : "No test cases generated.",
    "",
    "## Edge Cases",
    formatList(result.edgeCases, "No edge cases provided."),
    "",
    "## Regression Risks",
    formatList(result.regressionRisks, "No regression risks provided."),
    "",
    "## Suggested Automation Candidates",
    formatList(
      result.automationCandidates,
      "No automation candidates suggested."
    ),
  ].join("\n");
}
