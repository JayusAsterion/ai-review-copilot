"use client";

import {
  FileCode2,
  GitCompareArrows,
  Loader2,
  Sparkles,
  TextCursorInput,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { LineNumberedTextarea } from "@/components/review-input/line-numbered-textarea";
import { MultiFileDiffBuilder } from "@/components/review-input/multi-file-diff-builder";
import { TextDiffBuilder } from "@/components/review-input/text-diff-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  sampleNewFileContent,
  sampleOldFileContent,
  sampleReviewContext,
  sampleReviewDiff,
  sampleTextDiffFilePath,
} from "@/data/sample-review";
import { runOllamaCodeReview } from "@/lib/ai/ollama-client";
import { runStaticHeuristics } from "@/lib/static-analysis/heuristics";
import type {
  OllamaSettings,
  ReviewInput,
  ReviewProvider,
  ReviewResult,
} from "@/types/review";

type CodeReviewFormProps = {
  provider: ReviewProvider;
  ollamaSettings: OllamaSettings;
  onResult: (result: ReviewResult) => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
};

type DiffSource = "manual" | "files" | "text";

const sampleDiffPlaceholder = `diff --git a/src/components/button.tsx b/src/components/button.tsx
--- a/src/components/button.tsx
+++ b/src/components/button.tsx
@@ -1,5 +1,7 @@
-type Props = any;
+type Props = {
+  label: string;
+};
 
 export function Button(props: Props) {
   return <button>{props.label}</button>;
 }`;

export function CodeReviewForm({
  provider,
  ollamaSettings,
  onResult,
  onAnalyzingChange,
}: CodeReviewFormProps) {
  const [context, setContext] = useState("");
  const [manualDiff, setManualDiff] = useState("");
  const [generatedFilesDiff, setGeneratedFilesDiff] = useState("");
  const [generatedTextDiff, setGeneratedTextDiff] = useState("");
  const [diffSource, setDiffSource] = useState<DiffSource>("manual");
  const [sampleTextSeed, setSampleTextSeed] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const activeDiff =
    diffSource === "manual"
      ? manualDiff
      : diffSource === "files"
        ? generatedFilesDiff
        : generatedTextDiff;
  const hasReviewInput =
    context.trim().length > 0 || activeDiff.trim().length > 0;

  const loadSampleReview = () => {
    setContext(sampleReviewContext);
    setManualDiff(sampleReviewDiff);
    setGeneratedTextDiff("");
    setDiffSource("manual");
    setSampleTextSeed((current) => current + 1);
    toast.success("Sample review loaded");
  };

  const handleAnalyze = async () => {
    if (!hasReviewInput) {
      toast.error("Add PR context or a diff before analyzing.");
      return;
    }

    if (provider === "cloud") {
      toast.error("Cloud AI is not implemented yet.");
      return;
    }

    const input: ReviewInput = {
      mode: "code-review",
      provider,
      context,
      diff: activeDiff,
      files: [],
    };

    setIsAnalyzing(true);
    onAnalyzingChange?.(true);

    try {
      const result =
        provider === "static"
          ? runStaticHeuristics(input)
          : await runOllamaCodeReview(input, ollamaSettings);

      onResult(result);
      toast.success("Review analysis completed");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Review analysis failed.";

      if (message.toLowerCase().includes("model not found")) {
        toast.error(message);
      } else if (provider === "ollama") {
        toast.error(
          `${message} Check Ollama, Docker, model name, and OLLAMA_ORIGINS.`
        );
      } else {
        toast.error(message);
      }
    } finally {
      setIsAnalyzing(false);
      onAnalyzingChange?.(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-card/70 text-card-foreground shadow-2xl shadow-black/25 backdrop-blur-xl"
    >
      <div className="border-b border-white/10 bg-white/[0.035] px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white">
              Input and configuration
            </h2>
            <p className="text-sm leading-6 text-slate-400">
              Add context, paste a diff, or generate one from files before
              analysis.
            </p>
          </div>
          <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
            Live workspace
          </Badge>
        </div>
      </div>

      <div className="space-y-8 px-4 py-5 sm:px-6 sm:py-6">
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Label htmlFor="review-context" className="text-slate-200">
              PR / Ticket Context
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadSampleReview}
            className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
            >
              <Sparkles />
              Load sample review
            </Button>
          </div>
          <Textarea
            id="review-context"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Describe the change, expected behavior, affected module, environment, or QA notes..."
            className="h-40 max-h-40 min-h-40 resize-none overflow-y-auto rounded-2xl border-white/10 bg-black/25 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300/25"
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Label className="text-slate-200">Diff Source</Label>
              <p className="text-xs leading-5 text-slate-500">
                Paste an existing PR diff or generate a combined PR diff from
                old and new file uploads.
              </p>
            </div>
            {diffSource === "files" && generatedFilesDiff.trim() ? (
              <Badge className="w-fit border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                Generated
              </Badge>
            ) : null}
            {diffSource === "text" && generatedTextDiff.trim() ? (
              <Badge className="w-fit border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                Generated
              </Badge>
            ) : null}
          </div>

          <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/30 p-1 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => setDiffSource("manual")}
              className={[
                "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                diffSource === "manual"
                  ? "bg-white/10 text-white shadow-lg shadow-black/15"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100",
              ].join(" ")}
            >
              <FileCode2 className="size-4" />
              Paste Diff
              {manualDiff.trim() ? (
                <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                  Edited
                </Badge>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setDiffSource("files")}
              className={[
                "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                diffSource === "files"
                  ? "bg-white/10 text-white shadow-lg shadow-black/15"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100",
              ].join(" ")}
            >
              <GitCompareArrows className="size-4" />
              Generate Diff from Files
              {generatedFilesDiff.trim() ? (
                <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                  Ready
                </Badge>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setDiffSource("text")}
              className={[
                "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                diffSource === "text"
                  ? "bg-white/10 text-white shadow-lg shadow-black/15"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100",
              ].join(" ")}
            >
              <TextCursorInput className="size-4" />
              Generate Diff from Text
              {generatedTextDiff.trim() ? (
                <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                  Ready
                </Badge>
              ) : null}
            </button>
          </div>

          <div hidden={diffSource !== "manual"} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="review-diff" className="text-slate-200">
                Pull Request Diff
              </Label>
              <p className="text-xs leading-5 text-slate-500">
                Paste a Git, GitHub, Azure DevOps, or manually generated
                unified diff.
              </p>
            </div>
            <LineNumberedTextarea
              id="review-diff"
              value={manualDiff}
              onChange={(event) => setManualDiff(event.target.value)}
              placeholder={sampleDiffPlaceholder}
              containerClassName="h-80"
            />
          </div>

          <div hidden={diffSource !== "files"}>
            <MultiFileDiffBuilder
              value={generatedFilesDiff}
              onChange={setGeneratedFilesDiff}
            />
          </div>

          <div hidden={diffSource !== "text"}>
            <TextDiffBuilder
              key={sampleTextSeed}
              value={generatedTextDiff}
              onChange={setGeneratedTextDiff}
              sampleKey={sampleTextSeed}
              sampleFilePath={sampleTextDiffFilePath}
              sampleOldContent={sampleOldFileContent}
              sampleNewContent={sampleNewFileContent}
            />
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-white/10 pt-4">
          <Button
            type="button"
            size="lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="rounded-2xl bg-cyan-300 px-5 text-slate-950 shadow-lg shadow-cyan-950/30 hover:bg-cyan-200"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isAnalyzing ? "Analyzing" : "Analyze"}
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
