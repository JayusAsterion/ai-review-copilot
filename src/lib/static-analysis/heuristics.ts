import type { ReviewFinding, ReviewInput, ReviewResult } from "@/types/review";

type ScanTarget = {
  file: string | null;
  content: string;
};

const findingMetadata = {
  "console.log": {
    title: "Debug logging left in code",
    severity: "low",
    type: "cleanup",
    description:
      "A console.log statement appears in the submitted code. Debug output can leak implementation details and add noise in production.",
    suggestedFix:
      "Remove the log or route it through the application's structured logger with an appropriate level.",
  },
  any: {
    title: "Broad any type weakens type safety",
    severity: "medium",
    type: "type-safety",
    description:
      "The any type bypasses TypeScript checks and can hide mismatches that become runtime bugs.",
    suggestedFix:
      "Replace any with a specific interface, generic, unknown plus narrowing, or a discriminated union.",
  },
  TODO: {
    title: "TODO comment needs follow-up",
    severity: "info",
    type: "maintainability",
    description:
      "A TODO comment is present in the submitted code. It may be acceptable, but it should not hide required work for this change.",
    suggestedFix:
      "Resolve the TODO now or link it to a tracked follow-up with clear ownership.",
  },
  FIXME: {
    title: "FIXME comment indicates unresolved work",
    severity: "medium",
    type: "maintainability",
    description:
      "A FIXME comment usually marks a known defect or incomplete logic near the changed code.",
    suggestedFix:
      "Address the FIXME before merge or document why it is outside the scope of this PR.",
  },
  localhost: {
    title: "Hardcoded local URL detected",
    severity: "medium",
    type: "configuration",
    description:
      "A hardcoded localhost or 127.0.0.1 URL can break deployed environments and shared testing.",
    suggestedFix:
      "Move the URL to configuration or environment-specific settings.",
  },
} satisfies Record<
  string,
  Omit<ReviewFinding, "file" | "line">
>;

function lineNumberFor(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

function addTextFinding(
  findings: ReviewFinding[],
  target: ScanTarget,
  pattern: RegExp,
  metadata: Omit<ReviewFinding, "file" | "line">
) {
  for (const match of target.content.matchAll(pattern)) {
    findings.push({
      ...metadata,
      file: target.file,
      line:
        typeof match.index === "number"
          ? lineNumberFor(target.content, match.index)
          : null,
    });
  }
}

function riskFromFindings(findings: ReviewFinding[]): ReviewResult["riskLevel"] {
  if (findings.some((finding) => finding.severity === "high")) {
    return "high";
  }

  if (findings.some((finding) => finding.severity === "medium")) {
    return "medium";
  }

  return "low";
}

export function runStaticHeuristics(input: ReviewInput): ReviewResult {
  const findings: ReviewFinding[] = [];
  const targets: ScanTarget[] = input.files.map((file) => ({
    file: file.name,
    content: file.content,
  }));

  if (input.diff.trim()) {
    targets.unshift({
      file: "Pull Request Diff",
      content: input.diff,
    });
  }

  if (targets.length === 0 && input.context.trim()) {
    targets.push({
      file: "PR / Ticket Context",
      content: input.context,
    });
  }

  if (targets.length === 0) {
    return {
      summary:
        "No reviewable context, diff, or files were provided for static analysis.",
      riskLevel: "low",
      findings: [],
      testCases: [
        "Add PR context, a diff, or uploaded files before running a full review.",
      ],
      prComment:
        "No reviewable input was provided. Add PR context, a diff, or source files so the review can produce useful findings.",
    };
  }

  for (const target of targets) {
    addTextFinding(
      findings,
      target,
      /\bconsole\.log\s*\(/g,
      findingMetadata["console.log"]
    );
    addTextFinding(findings, target, /\bany\b/g, findingMetadata.any);
    addTextFinding(findings, target, /\bTODO\b/g, findingMetadata.TODO);
    addTextFinding(findings, target, /\bFIXME\b/g, findingMetadata.FIXME);
    addTextFinding(
      findings,
      target,
      /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/g,
      findingMetadata.localhost
    );

    const hasNetworkOrAsync =
      /\b(async|fetch\s*\(|axios\.)/.test(target.content);
    const hasErrorHandling = /\btry\b|\bcatch\b|\.catch\s*\(/.test(
      target.content
    );

    if (hasNetworkOrAsync && !hasErrorHandling) {
      findings.push({
        title: "Async or network logic lacks visible error handling",
        severity: "medium",
        type: "resilience",
        file: target.file,
        line: null,
        description:
          "The submitted code appears to use async, fetch, or axios without nearby try/catch or promise rejection handling.",
        suggestedFix:
          "Add explicit error handling and user-facing fallback behavior for failed requests.",
      });
    }

    const lineCount = target.content.split("\n").length;

    if (lineCount > 400) {
      findings.push({
        title: "Large file may need focused review",
        severity: "low",
        type: "maintainability",
        file: target.file,
        line: null,
        description: `This content is ${lineCount} lines long, which increases review risk and can hide unrelated changes.`,
        suggestedFix:
          "Consider splitting the change into smaller modules or calling out the important sections in the PR description.",
      });
    }
  }

  const riskLevel = riskFromFindings(findings);

  if (findings.length === 0) {
    return {
      summary:
        "Static heuristics did not detect common issues in the provided context, diff, or files.",
      riskLevel: "low",
      findings: [],
      testCases: [
        "Run the existing unit and integration test suite for the touched modules.",
        "Smoke test the primary user path affected by the change.",
        "Verify error, empty, and loading states if the change touches UI or network behavior.",
      ],
      prComment:
        "Static review did not flag common issues. Please still verify behavior with the relevant automated tests and a focused manual smoke test.",
    };
  }

  return {
    summary: `Static heuristics found ${findings.length} potential issue${
      findings.length === 1 ? "" : "s"
    } across the submitted material.`,
    riskLevel,
    findings,
    testCases: [
      "Add or update tests that cover the changed behavior and the highest-severity findings.",
      "Run a regression smoke test for the affected feature area.",
      "Verify failure handling for network, async, and invalid input paths when applicable.",
    ],
    prComment: `Static review found ${findings.length} potential issue${
      findings.length === 1 ? "" : "s"
    }. Prioritize medium and high severity findings before merge, then confirm the impacted user path with targeted tests.`,
  };
}
