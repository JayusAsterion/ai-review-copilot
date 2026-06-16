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
  critical: "Critical",
} as const;

function formatFalsePositiveCheck(
  check: ReviewResult["findings"][number]["falsePositiveCheck"]
) {
  if (!check) {
    return null;
  }

  if (typeof check === "string") {
    return [
      "- False-positive check:",
      "  - Existing handling found in diff: No",
      `  - If yes, why this is still an issue: ${check}`,
    ].join("\n");
  }

  return [
    "- False-positive check:",
    `  - Existing handling found in diff: ${
      check.existingHandlingFound === "yes" ? "Yes" : "No"
    }`,
    `  - Existing handling: ${check.existingHandling}`,
    `  - If yes, why this is still an issue: ${check.remainingIssue}`,
  ].join("\n");
}

function formatSelfContradictionCheck(
  check: ReviewResult["findings"][number]["selfContradictionCheck"]
) {
  if (!check) {
    return null;
  }

  if (typeof check === "string") {
    return [
      "- Self-contradiction check:",
      "  - Title matches evidence: Yes",
      "  - Failure path supported by evidence: Yes",
      "  - Suggested fix matches the issue: Yes",
    ].join("\n");
  }

  return [
    "- Self-contradiction check:",
    `  - Title matches evidence: ${
      check.titleMatchesEvidence === "yes" ? "Yes" : "No"
    }`,
    `  - Failure path supported by evidence: ${
      check.failurePathSupportedByEvidence === "yes" ? "Yes" : "No"
    }`,
    `  - Suggested fix matches the issue: ${
      check.suggestedFixMatchesIssue === "yes" ? "Yes" : "No"
    }`,
  ].join("\n");
}

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
              finding.confidence
                ? `- Confidence: ${capitalize(finding.confidence)}`
                : null,
              finding.classification
                ? `- Classification: ${capitalize(finding.classification)}`
                : null,
              `- Type: ${finding.type}`,
              location ? `- Location: ${location}` : null,
              finding.evidence ? `- Evidence: ${finding.evidence}` : null,
              finding.failurePath
                ? `- Failure path: ${finding.failurePath}`
                : null,
              finding.actualImpact
                ? `- Actual impact: ${finding.actualImpact}`
                : null,
              `- Suggested fix: ${finding.suggestedFix}`,
              formatFalsePositiveCheck(finding.falsePositiveCheck),
              formatSelfContradictionCheck(finding.selfContradictionCheck),
              "",
              finding.description,
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
  const notReported =
    result.needsVerification && result.needsVerification.length > 0
      ? result.needsVerification
      : result.likelyFalsePositives ?? [];
  const needsVerification =
    notReported.length > 0
      ? notReported.map((item) => `- ${item}`).join("\n")
      : "- No weak or speculative findings were reported.";

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
    "## Needs Verification / Not Reported as Bugs",
    "",
    needsVerification,
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

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
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
