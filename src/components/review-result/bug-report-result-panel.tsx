"use client";

import {
  Clipboard,
  Download,
  FileWarning,
  ListChecks,
  MessageSquareText,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { bugReportResultToMarkdown } from "@/lib/utils/markdown";
import type { BugPriority, BugReportResult, BugSeverity } from "@/types/review";

type BugReportResultPanelProps = {
  result: BugReportResult | null;
};

const severityClassName: Record<BugSeverity, string> = {
  low: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  medium: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  high: "border-rose-300/25 bg-rose-400/10 text-rose-200",
  critical: "border-red-300/30 bg-red-500/15 text-red-100",
};

const priorityClassName: Record<BugPriority, string> = {
  low: "border-slate-300/20 bg-slate-300/10 text-slate-200",
  medium: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  high: "border-rose-300/25 bg-rose-400/10 text-rose-200",
  urgent: "border-red-300/30 bg-red-500/15 text-red-100",
};

function markdownFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `bug-report-${stamp}.md`;
}

function ListBlock({
  items,
  empty,
  ordered = false,
}: {
  items: string[];
  empty: string;
  ordered?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">{empty}</p>;
  }

  const List = ordered ? "ol" : "ul";

  return (
    <List
      className={[
        "space-y-2 text-sm leading-6 text-slate-300",
        ordered ? "list-decimal pl-5" : "list-disc pl-5",
      ].join(" ")}
    >
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </List>
  );
}

export function BugReportResultPanel({ result }: BugReportResultPanelProps) {
  const markdown = result
    ? result.markdown || bugReportResultToMarkdown(result)
    : "";

  const copyMarkdown = async () => {
    if (!markdown) {
      return;
    }

    await navigator.clipboard.writeText(markdown);
    toast.success("Bug report Markdown copied");
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
    toast.success("Bug report exported");
  };

  if (!result) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
        className="flex min-h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center"
      >
        <div className="max-w-md">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200 ring-1 ring-amber-300/20">
            <FileWarning className="size-7" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            No bug report yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Fill the QA fields or load the sample to generate a structured,
            developer-ready bug report.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-left">
            {["Steps", "Severity", "Comment"].map((item) => (
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
              <span className="flex size-8 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200 ring-1 ring-amber-300/20">
                <FileWarning className="size-4" />
              </span>
              {result.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {result.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Badge className={`capitalize ${severityClassName[result.severity]}`}>
              {result.severity} severity
            </Badge>
            <Badge className={`capitalize ${priorityClassName[result.priority]}`}>
              {result.priority} priority
            </Badge>
            <Badge className="border-cyan-300/20 bg-cyan-300/10 capitalize text-cyan-100">
              {result.reproductionRate}
            </Badge>
          </div>
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
        </div>
      </div>

      <div className="space-y-7 px-4 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase text-slate-500">Environment</p>
            <p className="mt-1 text-sm font-medium text-slate-200">
              {result.environment || "Not provided"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase text-slate-500">Module</p>
            <p className="mt-1 text-sm font-medium text-slate-200">
              {result.module || "Not provided"}
            </p>
          </div>
        </div>

        <Card className="rounded-2xl border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <ListChecks className="size-4 text-cyan-200" />
              Steps to Reproduce
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ListBlock
              ordered
              items={result.stepsToReproduce}
              empty="No steps were provided."
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="rounded-2xl border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-slate-100">Actual Result</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="max-h-48 overflow-y-auto text-sm leading-6 text-slate-300">
                {result.actualResult}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-slate-100">Expected Result</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="max-h-48 overflow-y-auto text-sm leading-6 text-slate-300">
                {result.expectedResult}
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="rounded-2xl border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-slate-100">
                Additional Observations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ListBlock
                items={result.additionalObservations}
                empty="No additional observations."
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-slate-100">
                Missing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ListBlock
                items={result.missingInformation}
                empty="No missing information identified."
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-slate-100">
                Suggested Test Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ListBlock
                items={result.suggestedTestCases}
                empty="No suggested test cases."
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <MessageSquareText className="size-4 text-cyan-200" />
            Developer Comment
          </h3>
          <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
            {result.developerComment}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
