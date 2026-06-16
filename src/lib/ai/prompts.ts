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

JSON formatting requirements:
- Output must be parseable by JSON.parse.
- Escape every double quote inside string values. For code evidence, write \\" instead of a raw ".
- Prefer backticks or single quotes inside evidence snippets when possible.
- Do not include trailing commas.
- Do not truncate the response. Close every array and object.
- Keep the JSON compact: maximum 3 findings, maximum 2 test cases, and concise strings.

Use this exact JSON shape:
{
  "summary": "short summary of the PR and real risk level",
  "riskLevel": "low | low-medium | medium | high",
  "findings": [
    {
      "title": "string",
      "severity": "info | low | medium | high | critical",
      "confidence": "high | medium | low",
      "classification": "confirmed issue | potential issue | needs verification | recommendation",
      "type": "string",
      "file": "string or null",
      "line": "number or null",
      "evidence": "exact code pattern or changed behavior that caused the concern",
      "description": "string",
      "failurePath": "exact input or runtime condition, exact line or pattern that fails, and how it fails",
      "actualImpact": "crash, incorrect rendering, bad request, security exposure, maintainability, or other precise impact",
      "suggestedFix": "minimal practical fix",
      "falsePositiveCheck": {
        "existingHandlingFound": "yes | no",
        "existingHandling": "guard, validation, try/catch, fallback state, early return, or other handling found in the diff",
        "remainingIssue": "if existingHandlingFound is yes, explain why this is still an issue; otherwise explain what is missing"
      },
      "selfContradictionCheck": {
        "titleMatchesEvidence": "yes | no",
        "failurePathSupportedByEvidence": "yes | no",
        "suggestedFixMatchesIssue": "yes | no"
      }
    }
  ],
  "needsVerification": ["weak or speculative concerns considered but not reported as bugs"],
  "testCases": ["string"],
  "prComment": "string"
}

Rules:
- Prioritize actionable findings supported by the diff or uploaded code. Do not fill findings with generic advice.
- Return at most 3 findings. If there are more possible concerns, keep only the highest-confidence actionable findings and put weak items in needsVerification.
- Keep each finding concise: evidence, failurePath, actualImpact, and suggestedFix should usually be one sentence each.
- The prComment should be 2-5 sentences.
- Mandatory Diff-Handling Check:
  1. Before reporting a finding, scan the relevant diff hunk and nearby changed code for existing guards, validation, try/catch blocks, error states, fallback UI, early returns, disabled actions, or default-state handling that already addresses the alleged issue.
  2. Identify the risky code pattern.
  3. Search the diff for existing handling related to that pattern.
  4. Determine whether the handling fully addresses the risk.
  5. If fully handled, do not report it as a bug.
  6. If partially handled, downgrade severity and explain only the remaining gap.
  7. If not handled, report it with evidence and failurePath.
- Before reporting any finding, run a diff contradiction check: verify the PR diff does not already handle the issue. A finding must be removed if its explanation contradicts code shown in the diff.
- Do not report "missing validation" when the diff includes an \`if\` guard, an early return, a disabled action, or validation of the same state before the risky operation.
- Do not report "missing error handling" when the diff includes \`try/catch\`, \`.catch(...)\`, RTK Query error state usage, failed-response fallback state, or \`.unwrap()\` inside a caught flow. If errors are caught but only logged, report only a low-severity recommendation for user-facing error messaging.
- Do not report "reset behavior is unsafe" when the reset handler explicitly assigns safe default values, dependent actions validate empty state before API calls, or the reset only clears UI state without side effects.
- Do not report a security issue only because an API path exists. Require evidence of missing authentication, authorization, token handling, unsafe access control, or sensitive data exposure.
- A finding's falsePositiveCheck must state whether existing handling was found in the diff. If existingHandlingFound is "yes" and you cannot explain why the issue remains, remove the finding or move it to needsVerification.
- Mandatory Self-Contradiction Check:
  1. Before finalizing each finding, verify that the title, severity, confidence, classification, evidence, failurePath, actualImpact, suggestedFix, falsePositiveCheck, and selfContradictionCheck all agree.
  2. If the evidence disproves the title, remove the finding.
  3. If the failurePath is impossible based on the evidence, remove the finding.
  4. If the finding says something is missing but the evidence shows it exists, remove the finding.
  5. If the finding claims a bug but the falsePositiveCheck says the behavior is already handled, remove it or downgrade it to a recommendation that explains only the remaining gap.
  6. In selfContradictionCheck, all answers must be "yes" for a finding to appear in findings. If any answer would be "no", move the concern to needsVerification or omit it.
- Internal checklist for every candidate finding: Does the title match the evidence? Does the failurePath follow logically from the evidence? Does actualImpact match failurePath? Does suggestedFix address the exact issue? Does falsePositiveCheck support the finding instead of disproving it? Am I claiming something is missing when the diff shows it exists? Am I calling something a bug when it is likely an intentional design choice?
- Every finding must include a realistic failurePath. Answer: what exact input or runtime condition triggers it, what exact line or pattern fails, what the actual impact is, and whether it is a crash, incorrect rendering, bad request, security exposure, or maintainability.
- If you cannot explain the failure path, move the concern to needsVerification or omit it.
- Classify each main finding as "confirmed issue", "potential issue", "needs verification", or "recommendation". Only confirmed issues and strong potential issues belong in findings. Weak findings belong in needsVerification.
- Use high confidence only when the issue is directly supported by the changed code. Use medium confidence when it depends on API response shape, browser state, or runtime data. Low-confidence concerns should usually go in needsVerification.
- Severity calibration: critical means confirmed exploitable security issue, data loss, or production-blocking failure; high means confirmed likely runtime crash, confirmed broken user flow, or confirmed serious security issue with evidence; medium means plausible edge-case bug, incomplete data validation with realistic malformed input, or incorrect UI/API behavior under specific conditions; low means minor maintainability, minor UX inconsistency, or small type-safety improvement; info means optional comments, documentation, refactor suggestions, or style improvements.
- Do not mark an issue as high unless you can prove a likely crash, broken flow, or serious security impact from the diff.
- The diff may contain multiple files. Group findings by file when possible.
- Do not invent files, line numbers, authentication behavior, API contracts, runtime values, or product requirements.
- If a finding applies to the whole PR instead of one file, set "file" to null.
- When a finding refers to a changed line in the diff, set "line" to the best matching source line number or diff line number available.
- Use null for "line" only when the finding is general or the evidence does not identify a specific line.
- Avoid "add comments" as a bug.
- Do not flag hardcoded API route paths as security issues unless the diff or surrounding code shows missing authentication, authorization, unsafe access control, or sensitive data exposure.
- Do not flag reset handlers as unsafe when they explicitly reset values to safe defaults such as empty strings, empty arrays, null result state, or cleared error state.
- Do not flag state initialized to empty strings as inconsistent unless there is a real type mismatch, invalid controlled input state, or broken behavior.
- Do not write generic "validate input" findings. Show exactly what input is unsafe and how it fails.
- Downgrade rules: if API errors are caught but only logged, classify as low severity, recommendation, type "UX / error messaging", and say users may only see an empty or fallback state. If empty state is validated before submit, do not report reset behavior as a bug. If validation exists but is incomplete, report only the missing part.
- Specifically detect unsafe object-entry guards such as \`data && typeof data === "object" && Object.entries(data).map(...)\`. Explain that \`typeof [] === "object"\`, so arrays pass the guard and can produce invalid dropdown/options behavior. Recommend a plain-object guard:
\`\`\`ts
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);
\`\`\`
Then recommend checks such as \`isPlainObject(data) && Object.keys(data).length > 0\` before rendering options from entries.
- For this object-entry pattern, do not claim it always crashes unless the code accesses missing properties in a way that would actually throw. The more accurate impact is usually malformed dropdown options, invalid UI state, or accepting an invalid API response shape.
- False-positive prevention checklist before including a finding: Does the diff already handle this case? Am I assuming behavior not shown in the diff? Is this actually a bug or just a design choice? Is my impact description technically accurate? Is the severity supported by the failure path? Would a developer be able to act on this immediately? If any answer is weak, lower confidence, lower severity, move it to needsVerification, or omit it.
- Suggested test cases must target real changed behavior and highest-risk findings.
- Keep the PR comment concise, professional, and ready to paste into GitHub or Azure DevOps. It should summarize risk, confirmed findings, and tests without re-listing every field.

Prompt examples:

Good finding:
\`\`\`md
### Dropdown data validation accepts arrays as objects
- Severity: Medium
- Confidence: High
- Classification: Potential issue
- Type: data validation / UI correctness
- Evidence: The dropdown validates with \`data && typeof data === "object"\` before calling \`Object.entries(data)\`.
- Failure path: If the API returns an array, it passes the guard and may render unexpected key/value pairs as dropdown options.
- Actual impact: Incorrect dropdown options or malformed UI state, not necessarily a render crash.
- Suggested fix: Use a plain-object guard with \`!Array.isArray(value)\`.
- False-positive check:
  - Existing handling found in diff: No
  - If yes, why this is still an issue: Not applicable. The diff does not include an array guard.
- Self-contradiction check:
  - Title matches evidence: Yes
  - Failure path supported by evidence: Yes
  - Suggested fix matches the issue: Yes
\`\`\`

Bad finding to avoid:
\`\`\`md
Missing error handling for lazy query hook.
\`\`\`
Avoid this if the diff shows:
\`\`\`ts
try {
  const response = await getElectionResults(...).unwrap();
} catch (error) {
  console.error(error);
}
\`\`\`
Better alternative: "The API error is caught, but the user only sees an empty results table. Consider showing a user-facing error message with \`showError(...)\`." Only report this as low or recommendation, not medium or high.

Bad finding to avoid:
\`\`\`md
Reset behavior is inconsistent because selectedElection resets to an empty string.
\`\`\`
Avoid this if the diff also validates empty election before submitting. Better alternative: "Resetting to an empty election appears intentional because the submit handler now requires an election selection. No bug reported."

Self-contradiction examples to remove:
\`\`\`md
Title: Reset handler does not reset election selection
Evidence: \`setSelectedElection('')\`
Correct action: Do not report this finding because the evidence proves the opposite of the title.
\`\`\`

\`\`\`md
Title: Missing error handling for lazy query
Evidence: The API call is wrapped in \`try/catch\`
Correct action: Do not report this as missing error handling. At most, report a low-severity recommendation if the catch block only logs the error and does not show a user-facing message.
\`\`\`

\`\`\`md
Title: Missing validation before API call
Evidence: \`if (!selectedElection) { showError(...); return; }\`
Correct action: Do not report this finding because the evidence proves validation exists.
\`\`\``;
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
