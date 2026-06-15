import type { BugReportInput, ReviewInput, TestCaseInput } from "@/types/review";

const modeLabels: Record<ReviewInput["mode"], string> = {
  "code-review": "Code Review",
  "bug-report": "Bug Report",
  "test-cases": "Test Cases",
};

function truncateContent(content: string, maxLength = 12000): string {
  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength)}\n\n[Content truncated for review prompt]`;
}

export function buildCodeReviewPrompt(input: ReviewInput): string {
  const files =
    input.files.length > 0
      ? input.files
          .map(
            (file) => `### ${file.name} (${file.language})

\`\`\`
${truncateContent(file.content)}
\`\`\``
          )
          .join("\n\n")
      : "No uploaded files.";

  return `Review mode: ${modeLabels[input.mode]}

PR / Ticket Context:
${input.context.trim() || "No context provided."}

Pull Request Diff:
\`\`\`diff
${truncateContent(input.diff.trim() || "No diff provided.")}
\`\`\`

Uploaded Files:
${files}

Return only valid JSON. Do not include markdown fences, prose before JSON, or prose after JSON.

Use this exact JSON shape:
{
  "summary": "string",
  "riskLevel": "low | medium | high",
  "findings": [
    {
      "title": "string",
      "severity": "info | low | medium | high",
      "type": "string",
      "file": "string or null",
      "line": "number or null",
      "description": "string",
      "suggestedFix": "string"
    }
  ],
  "testCases": ["string"],
  "prComment": "string"
}

Rules:
- The diff may contain multiple files. Group findings by file when possible.
- Do not invent files or line numbers.
- If a finding applies to the whole PR instead of one file, set "file" to null.
- When a finding refers to a changed line in the diff, set "line" to the best matching source line number or diff line number available.
- Use null for "line" only when the finding is general or the evidence does not identify a specific line.
- If evidence is missing, mark it as a recommendation instead of a confirmed bug.
- Prioritize practical feedback over style preferences.
- Include QA test cases when relevant.
- Keep the PR comment professional and ready to paste into GitHub or Azure DevOps.
- Focus on correctness risks, regressions, missing edge cases, test coverage, and user-visible behavior.`;
}

function formatOptionalField(label: string, value?: string): string {
  return `- ${label}: ${value?.trim() || "Not provided"}`;
}

export function buildBugReportPrompt(input: BugReportInput): string {
  const attachments =
    input.attachments && input.attachments.length > 0
      ? input.attachments
          .map(
            (attachment) =>
              `- ${attachment.name} (${attachment.type || "unknown type"}, ${attachment.size} bytes)`
          )
          .join("\n")
      : "No attachments provided.";

  return `You are transforming QA notes into a professional bug report.

Act as a senior QA engineer and technical bug report writer. Use only the facts provided. Do not invent steps, product behavior, environment details, screenshots, logs, or root causes. If important information is missing, include it in missingInformation.

Context:
${formatOptionalField("Application / Product", input.application)}
${formatOptionalField("Module / Page", input.module)}
${formatOptionalField("Environment", input.environment)}
${formatOptionalField("URL", input.url)}
${formatOptionalField("User Role", input.userRole)}
${formatOptionalField("Browser", input.browser)}
${formatOptionalField("Device", input.device)}
${formatOptionalField("Build / Version", input.buildVersion)}
${formatOptionalField("Reproduction Rate", input.reproductionRate)}

QA Notes:
${truncateContent(input.roughNotes?.trim() || "No rough QA notes provided.")}

Steps to Reproduce:
${truncateContent(input.stepsToReproduce?.trim() || "No steps provided.")}

Actual Result:
${truncateContent(input.actualResult?.trim() || "No actual result provided.")}

Expected Result:
${truncateContent(input.expectedResult?.trim() || "No expected result provided.")}

Additional Context:
${truncateContent(input.additionalContext?.trim() || "No additional context provided.")}

Screenshot Notes:
${truncateContent(input.screenshotNotes?.trim() || "No screenshot notes provided.")}

Attachment Names:
${attachments}

Return only valid JSON. Do not include markdown fences, prose before JSON, or prose after JSON.

Use this exact JSON shape:
{
  "title": "string",
  "summary": "string",
  "severity": "low | medium | high | critical",
  "priority": "low | medium | high | urgent",
  "reproductionRate": "always | sometimes | rarely | unknown",
  "environment": "string",
  "module": "string",
  "stepsToReproduce": ["string"],
  "actualResult": "string",
  "expectedResult": "string",
  "additionalObservations": ["string"],
  "missingInformation": ["string"],
  "suggestedTestCases": ["string"],
  "developerComment": "string",
  "markdown": "string"
}

Rules:
- Suggest severity and priority from user impact and environment.
- Treat production blockers, data loss, security exposure, and broken critical paths as high or critical.
- Treat visual/UI polish issues as low or medium unless they block completion.
- Generate practical regression test cases.
- Make developerComment concise and ready to paste into Jira, Azure DevOps, or GitHub Issues.
- The markdown field must include a complete bug report ready to paste into Jira, Azure DevOps, or GitHub Issues.`;
}

export function buildTestCasesPrompt(input: TestCaseInput): string {
  return `You are generating structured QA test coverage from product, bug, code review, or PR context.

Use only the provided facts. Do not invent product behavior, APIs, roles, or data beyond reasonable test placeholders. If context is unclear, call that out in notes.

Configuration:
- Test types: ${input.testTypes.join(", ") || "Functional"}
- Coverage level: ${input.coverageLevel}
- Output format: ${input.outputFormat}
- Priority baseline: ${input.priority}

Additional instructions:
${input.instructions?.trim() || "No additional instructions provided."}

Source context:
${truncateContent(input.context.trim() || "No context provided.")}

Return only valid JSON. Do not include markdown fences, prose before JSON, or prose after JSON.

Use this exact JSON shape:
{
  "summary": "string",
  "coverageFocus": ["string"],
  "testCases": [
    {
      "id": "TC-001",
      "title": "string",
      "priority": "Low | Medium | High | Critical",
      "type": "string",
      "preconditions": ["string"],
      "steps": ["string"],
      "expectedResult": "string",
      "testData": ["string"],
      "notes": "string"
    }
  ],
  "edgeCases": ["string"],
  "regressionRisks": ["string"],
  "automationCandidates": ["string"]
}

Rules:
- Generate practical QA scenarios, not generic test advice.
- Include positive, negative, edge, and regression coverage when relevant.
- Keep each test case executable by a QA engineer.
- Prefer precise expected results.
- Mark unclear assumptions in notes.
- Suggest automation candidates only when the scenario is stable and repeatable.
- Match the requested output format in the content style, but always return the JSON schema above.`;
}
