import type { ReviewInput } from "@/types/review";

const modeLabels: Record<ReviewInput["mode"], string> = {
  "code-review": "Code Review",
  "bug-report": "Bug Report",
  "pr-comment": "PR Comment",
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
- Do not invent files or line numbers.
- When a finding refers to a changed line in the diff, set "line" to the best matching source line number or diff line number available.
- Use null for "line" only when the finding is general or the evidence does not identify a specific line.
- If evidence is missing, mark it as a recommendation instead of a confirmed bug.
- Prioritize practical feedback over style preferences.
- Include QA test cases when relevant.
- Keep the PR comment professional and ready to paste into GitHub or Azure DevOps.
- Focus on correctness risks, regressions, missing edge cases, test coverage, and user-visible behavior.`;
}
