import { bugReportResultToMarkdown } from "@/lib/utils/markdown";
import type {
  BugPriority,
  BugReportInput,
  BugReportResult,
  BugSeverity,
} from "@/types/review";

function splitSteps(value?: string): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:\d+[\).]|[-*])\s*/, "").trim())
    .filter(Boolean);
}

function sentenceFrom(value?: string, fallback = "Reported QA issue"): string {
  const text = value?.trim().replace(/\s+/g, " ");

  if (!text) {
    return fallback;
  }

  return text.length > 96 ? `${text.slice(0, 93)}...` : text;
}

function includesAny(text: string, words: string[]): boolean {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

function inferSeverity(input: BugReportInput): BugSeverity {
  const text = [
    input.environment,
    input.roughNotes,
    input.actualResult,
    input.expectedResult,
    input.additionalContext,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const isProduction = input.environment?.toLowerCase() === "production";
  const isBlocking = includesAny(text, [
    "block",
    "cannot",
    "unable",
    "crash",
    "error 500",
    "data loss",
    "security",
  ]);

  if (isProduction && isBlocking) {
    return "critical";
  }

  if (isBlocking || includesAny(text, ["save", "missing button", "incorrect data"])) {
    return isProduction ? "high" : "medium";
  }

  if (includesAny(text, ["format", "alignment", "spacing", "label", "visual"])) {
    return "low";
  }

  if (includesAny(text, ["arrow", "expand", "pointer", "mismatch", "display"])) {
    return "medium";
  }

  return "medium";
}

function priorityFromSeverity(severity: BugSeverity): BugPriority {
  switch (severity) {
    case "critical":
      return "urgent";
    case "high":
      return "high";
    case "medium":
      return "medium";
    case "low":
      return "low";
  }
}

function buildMissingInformation(input: BugReportInput): string[] {
  const missing: string[] = [];

  if (!input.application?.trim()) missing.push("Application or product name");
  if (!input.module?.trim()) missing.push("Module or page name");
  if (!input.environment?.trim()) missing.push("Environment");
  if (!input.browser?.trim()) missing.push("Browser");
  if (!input.device?.trim()) missing.push("Device");
  if (!input.buildVersion?.trim()) missing.push("Build or version");
  if (!input.stepsToReproduce?.trim()) missing.push("Exact steps to reproduce");
  if (!input.actualResult?.trim()) missing.push("Actual result");
  if (!input.expectedResult?.trim()) missing.push("Expected result");

  return missing;
}

function buildTestCases(input: BugReportInput): string[] {
  const moduleLabel = input.module?.trim() || "the affected module";

  return [
    `Verify the reported behavior in ${moduleLabel} using the documented reproduction steps.`,
    "Confirm the issue no longer appears after the fix is applied.",
    "Run a regression check for the same workflow with a newly created record and an existing record.",
    "Verify the UI state accurately reflects whether related child records or expandable content exists.",
  ];
}

export function generateStaticBugReport(
  input: BugReportInput
): BugReportResult {
  const steps = splitSteps(input.stepsToReproduce);
  const severity = inferSeverity(input);
  const priority = priorityFromSeverity(severity);
  const reproductionRate = input.reproductionRate ?? "unknown";
  const moduleLabel = input.module?.trim() || "Affected module";
  const title = `${moduleLabel}: ${sentenceFrom(
    input.actualResult || input.roughNotes,
    "QA issue reported"
  )}`;
  const attachmentNames =
    input.attachments && input.attachments.length > 0
      ? input.attachments.map((attachment) => attachment.name)
      : [];
  const additionalObservations = [
    input.additionalContext?.trim(),
    input.screenshotNotes?.trim()
      ? `Screenshot notes: ${input.screenshotNotes.trim()}`
      : null,
    attachmentNames.length > 0
      ? `Attached context files: ${attachmentNames.join(", ")}`
      : null,
    input.url?.trim() ? `URL: ${input.url.trim()}` : null,
    input.userRole?.trim() ? `User role: ${input.userRole.trim()}` : null,
    input.buildVersion?.trim()
      ? `Build / version: ${input.buildVersion.trim()}`
      : null,
  ].filter((item): item is string => Boolean(item));

  const result: BugReportResult = {
    title,
    summary:
      input.roughNotes?.trim() ||
      sentenceFrom(input.actualResult, "A QA issue was reported."),
    severity,
    priority,
    reproductionRate,
    environment: input.environment?.trim(),
    module: input.module?.trim(),
    stepsToReproduce: steps,
    actualResult: input.actualResult?.trim() || "Not provided.",
    expectedResult: input.expectedResult?.trim() || "Not provided.",
    additionalObservations,
    missingInformation: buildMissingInformation(input),
    suggestedTestCases: buildTestCases(input),
    developerComment: [
      `Please investigate ${moduleLabel}.`,
      `Actual result: ${input.actualResult?.trim() || "Not provided."}`,
      `Expected result: ${input.expectedResult?.trim() || "Not provided."}`,
    ].join("\n"),
    markdown: "",
  };

  return {
    ...result,
    markdown: bugReportResultToMarkdown(result),
  };
}
