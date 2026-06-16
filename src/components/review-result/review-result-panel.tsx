"use client";

import {
  Clipboard,
  Download,
  FileSearch,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { reviewResultToMarkdown } from "@/lib/utils/markdown";
import type { ReviewFinding, ReviewResult } from "@/types/review";

type ReviewResultPanelProps = {
  result: ReviewResult | null;
  isLoading?: boolean;
  onClear?: () => void;
};

const severityClassName: Record<ReviewFinding["severity"], string> = {
  info: "border-slate-300/20 bg-slate-300/10 text-slate-200",
  low: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  medium: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  high: "border-rose-300/25 bg-rose-400/10 text-rose-200",
  critical: "border-red-300/30 bg-red-500/15 text-red-100",
};

const confidenceClassName = {
  high: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  medium: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  low: "border-slate-300/20 bg-slate-300/10 text-slate-200",
} as const;

const riskClassName: Record<ReviewResult["riskLevel"], string> = {
  low: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  "low-medium": "border-lime-300/20 bg-lime-300/10 text-lime-200",
  medium: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  high: "border-rose-300/25 bg-rose-400/10 text-rose-200",
};

function markdownFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `code-review-${stamp}.md`;
}

function LoadingState() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] text-card-foreground">
      <div className="border-b border-white/10 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
            <Loader2 className="size-5 animate-spin" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Analyzing review
            </h2>
            <p className="text-sm text-slate-400">
              Building structured findings, QA checks, and PR-ready notes.
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <Skeleton className="h-24 rounded-2xl bg-white/[0.06]" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-2xl bg-white/[0.06]" />
          <Skeleton className="h-28 rounded-2xl bg-white/[0.06]" />
        </div>
        <Skeleton className="h-48 rounded-2xl bg-white/[0.06]" />
      </div>
    </section>
  );
}

function formatFalsePositiveCheck(
  check: ReviewFinding["falsePositiveCheck"]
) {
  if (!check) {
    return null;
  }

  if (typeof check === "string") {
    return [
      "False-positive check:",
      "Existing handling found in diff: No",
      `If yes, why this is still an issue: ${check}`,
    ].join("\n");
  }

  return [
    "False-positive check:",
    `Existing handling found in diff: ${
      check.existingHandlingFound === "yes" ? "Yes" : "No"
    }`,
    `Existing handling: ${check.existingHandling}`,
    `If yes, why this is still an issue: ${check.remainingIssue}`,
  ].join("\n");
}

function formatSelfContradictionCheck(
  check: ReviewFinding["selfContradictionCheck"]
) {
  if (!check) {
    return null;
  }

  if (typeof check === "string") {
    return [
      "Self-contradiction check:",
      "Title matches evidence: Yes",
      "Failure path supported by evidence: Yes",
      "Suggested fix matches the issue: Yes",
    ].join("\n");
  }

  return [
    "Self-contradiction check:",
    `Title matches evidence: ${
      check.titleMatchesEvidence === "yes" ? "Yes" : "No"
    }`,
    `Failure path supported by evidence: ${
      check.failurePathSupportedByEvidence === "yes" ? "Yes" : "No"
    }`,
    `Suggested fix matches the issue: ${
      check.suggestedFixMatchesIssue === "yes" ? "Yes" : "No"
    }`,
  ].join("\n");
}

export function ReviewResultPanel({
  result,
  isLoading = false,
  onClear,
}: ReviewResultPanelProps) {
  const markdown = result ? reviewResultToMarkdown(result) : "";

  const copyMarkdown = async () => {
    if (!markdown) {
      return;
    }

    await navigator.clipboard.writeText(markdown);
    toast.success("Markdown copied");
  };

  const exportMarkdown = () => {
    if (!markdown) {
      return;
    }

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = markdownFilename();
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("Markdown exported");
  };

  const copyFinding = async (finding: ReviewFinding) => {
    const text = [
      `**${finding.title}**`,
      finding.file ? `File: \`${finding.file}\`` : null,
      finding.line ? `Line: ${finding.line}` : null,
      `Severity: ${finding.severity}`,
      finding.confidence ? `Confidence: ${finding.confidence}` : null,
      finding.classification
        ? `Classification: ${finding.classification}`
        : null,
      finding.evidence ? `Evidence: ${finding.evidence}` : null,
      finding.description,
      finding.failurePath ? `Failure path: ${finding.failurePath}` : null,
      finding.actualImpact ? `Actual impact: ${finding.actualImpact}` : null,
      finding.whyThisMatters && !finding.actualImpact
        ? `Why this matters: ${finding.whyThisMatters}`
        : null,
      `Suggested fix: ${finding.suggestedFix}`,
      formatFalsePositiveCheck(finding.falsePositiveCheck),
      formatSelfContradictionCheck(finding.selfContradictionCheck),
    ]
      .filter(Boolean)
      .join("\n\n");

    await navigator.clipboard.writeText(text);
    toast.success("PR comment copied");
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!result) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
      className="flex min-h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center"
      >
        <div className="max-w-md">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
            <FileSearch className="size-7" />
          </div>
          <h2 className="text-lg font-semibold text-white">No review yet</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Run an analysis to see structured findings, risks, test cases, and a
            PR-ready comment.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-left">
            {["Findings", "QA cases", "PR note"].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              >
                <p className="text-xs text-slate-500">{item}</p>
                <p className="mt-1 text-xs font-medium text-slate-200">
                  Ready
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-card-foreground"
    >
      <div className="space-y-4 border-b border-white/10 bg-black/15 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
                <ShieldAlert className="size-4" />
              </span>
              Review Result
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {result.summary}
            </p>
          </div>
          <Badge className={`capitalize ${riskClassName[result.riskLevel]}`}>
            {result.riskLevel} risk
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={copyMarkdown}
            className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            <Clipboard />
            Copy Markdown
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={exportMarkdown}
            className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            <Download />
            Export Markdown
          </Button>
          {onClear ? (
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
            >
              <RotateCcw />
              Clear Review
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-7 px-4 py-5 sm:px-6 sm:py-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Findings</h3>
          {result.findings.length > 0 ? (
            <div className="space-y-3">
              {result.findings.map((finding, index) => (
                <Card
                  key={`${finding.title}-${index}`}
                  className="rounded-2xl border-white/10 bg-black/20"
                >
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle className="text-slate-100">
                          {finding.title}
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                          {[finding.type, finding.file]
                            .filter(Boolean)
                            .join(" - ")}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <Badge
                          className={
                            finding.line
                              ? "border-cyan-300/20 bg-cyan-300/10 font-mono text-cyan-100"
                              : "border-slate-300/15 bg-slate-300/10 text-slate-300"
                          }
                        >
                          {finding.line
                            ? `Line ${finding.line}`
                            : "Line not specified"}
                        </Badge>
                        <Badge
                          className={`capitalize ${severityClassName[finding.severity]}`}
                        >
                          {finding.severity}
                        </Badge>
                        {finding.confidence ? (
                          <Badge
                            className={`capitalize ${confidenceClassName[finding.confidence]}`}
                          >
                            {finding.confidence} confidence
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {finding.classification || finding.evidence ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        {finding.classification ? (
                          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                            <p className="text-xs font-medium uppercase text-slate-500">
                              Classification
                            </p>
                            <p className="mt-1 text-sm capitalize leading-6 text-slate-200">
                              {finding.classification}
                            </p>
                          </div>
                        ) : null}
                        {finding.evidence ? (
                          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                            <p className="text-xs font-medium uppercase text-slate-500">
                              Evidence
                            </p>
                            <p className="mt-1 break-words font-mono text-xs leading-5 text-slate-200">
                              {finding.evidence}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <p className="text-sm leading-6 text-slate-400">
                      {finding.description}
                    </p>
                    {finding.failurePath ? (
                      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                        <p className="text-xs font-medium uppercase text-slate-500">
                          Failure path
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-200">
                          {finding.failurePath}
                        </p>
                      </div>
                    ) : null}
                    {finding.actualImpact || finding.whyThisMatters ? (
                      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                        <p className="text-xs font-medium uppercase text-slate-500">
                          Actual impact
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-200">
                          {finding.actualImpact ?? finding.whyThisMatters}
                        </p>
                      </div>
                    ) : null}
                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-xs font-medium uppercase text-slate-500">
                        Suggested fix
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-200">
                        {finding.suggestedFix}
                      </p>
                    </div>
                    {finding.falsePositiveCheck ? (
                      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                        <p className="text-xs font-medium uppercase text-slate-500">
                          False-positive check
                        </p>
                        {typeof finding.falsePositiveCheck === "string" ? (
                          <p className="mt-1 text-sm leading-6 text-slate-200">
                            {finding.falsePositiveCheck}
                          </p>
                        ) : (
                          <dl className="mt-2 space-y-2 text-sm leading-6 text-slate-200">
                            <div>
                              <dt className="text-xs text-slate-500">
                                Existing handling found in diff
                              </dt>
                              <dd className="capitalize">
                                {finding.falsePositiveCheck
                                  .existingHandlingFound === "yes"
                                  ? "Yes"
                                  : "No"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-slate-500">
                                Existing handling
                              </dt>
                              <dd>{finding.falsePositiveCheck.existingHandling}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-slate-500">
                                If yes, why this is still an issue
                              </dt>
                              <dd>{finding.falsePositiveCheck.remainingIssue}</dd>
                            </div>
                          </dl>
                        )}
                      </div>
                    ) : null}
                    {finding.selfContradictionCheck ? (
                      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                        <p className="text-xs font-medium uppercase text-slate-500">
                          Self-contradiction check
                        </p>
                        {typeof finding.selfContradictionCheck === "string" ? (
                          <p className="mt-1 text-sm leading-6 text-slate-200">
                            {finding.selfContradictionCheck}
                          </p>
                        ) : (
                          <dl className="mt-2 space-y-2 text-sm leading-6 text-slate-200">
                            <div>
                              <dt className="text-xs text-slate-500">
                                Title matches evidence
                              </dt>
                              <dd className="capitalize">
                                {finding.selfContradictionCheck
                                  .titleMatchesEvidence === "yes"
                                  ? "Yes"
                                  : "No"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-slate-500">
                                Failure path supported by evidence
                              </dt>
                              <dd className="capitalize">
                                {finding.selfContradictionCheck
                                  .failurePathSupportedByEvidence === "yes"
                                  ? "Yes"
                                  : "No"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-slate-500">
                                Suggested fix matches the issue
                              </dt>
                              <dd className="capitalize">
                                {finding.selfContradictionCheck
                                  .suggestedFixMatchesIssue === "yes"
                                  ? "Yes"
                                  : "No"}
                              </dd>
                            </div>
                          </dl>
                        )}
                      </div>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyFinding(finding)}
                      className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                    >
                      <Clipboard />
                      Copy PR comment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
              No findings were detected.
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">
            Needs Verification / Not Reported as Bugs
          </h3>
          {(result.needsVerification?.length ?? 0) > 0 ||
          (result.likelyFalsePositives?.length ?? 0) > 0 ? (
            <ul className="space-y-2">
              {(
                result.needsVerification ??
                result.likelyFalsePositives ??
                []
              ).map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm leading-6 text-slate-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">
              No weak or speculative findings were reported.
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="size-4 text-cyan-200" />
            Suggested Test Cases
          </h3>
          {result.testCases.length > 0 ? (
            <ul className="space-y-2">
              {result.testCases.map((testCase, index) => (
                <li
                  key={`${testCase}-${index}`}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm leading-6 text-slate-300"
                >
                  {testCase}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">
              No additional test cases suggested.
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">PR Comment</h3>
          <div className="max-h-96 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-3 break-words text-sm leading-6 text-slate-300 last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-slate-300">
                    {children}
                  </ol>
                ),
                code: ({ children }) => (
                  <code className="break-words rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="mb-3 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                    {children}
                  </pre>
                ),
                h1: ({ children }) => (
                  <h1 className="mb-2 text-lg font-semibold text-white">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-2 text-base font-semibold text-white">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-2 text-sm font-semibold text-white">
                    {children}
                  </h3>
                ),
              }}
            >
              {result.prComment}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
