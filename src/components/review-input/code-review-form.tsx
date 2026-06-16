"use client";

import {
  AlertTriangle,
  FileCode2,
  GitCompareArrows,
  GitPullRequest,
  Loader2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TextCursorInput,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AzurePrImportPanel } from "@/components/review-input/azure-pr-import-panel";
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
import type { AzurePullRequestReviewContext } from "@/types/azure";
import type {
  OllamaSettings,
  ReviewInput,
  ReviewProvider,
  ReviewResult,
} from "@/types/review";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type CodeReviewFormProps = {
  provider: ReviewProvider;
  ollamaSettings: OllamaSettings;
  onResult: (result: ReviewResult) => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
};

type InputSource = "manual" | "azure-devops";
type DiffSource = "manual" | "files" | "text";
type OutputStyle = "pr-comments" | "summary" | "detailed";
type ReviewDepth = "quick" | "standard" | "deep";

const focusOptions = ["Bugs", "Security", "Performance", "Readability", "Testing"];
const outputStyles: Array<{ value: OutputStyle; label: string }> = [
  { value: "pr-comments", label: "PR comments" },
  { value: "summary", label: "Summary" },
  { value: "detailed", label: "Detailed review" },
];
const reviewDepths: Array<{ value: ReviewDepth; label: string }> = [
  { value: "quick", label: "Quick" },
  { value: "standard", label: "Standard" },
  { value: "deep", label: "Deep" },
];

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
  const [inputSource, setInputSource] = useState<InputSource>("manual");
  const [context, setContext] = useState("");
  const [manualDiff, setManualDiff] = useState("");
  const [generatedFilesDiff, setGeneratedFilesDiff] = useState("");
  const [generatedTextDiff, setGeneratedTextDiff] = useState("");
  const [importedAzureContext, setImportedAzureContext] =
    useState<AzurePullRequestReviewContext | null>(null);
  const [diffSource, setDiffSource] = useState<DiffSource>("manual");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    "Bugs",
    "Security",
    "Testing",
  ]);
  const [outputStyle, setOutputStyle] = useState<OutputStyle>("pr-comments");
  const [reviewDepth, setReviewDepth] = useState<ReviewDepth>("standard");
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

  const toggleFocus = (focus: string) => {
    setSelectedFocus((current) =>
      current.includes(focus)
        ? current.filter((item) => item !== focus)
        : [...current, focus]
    );
  };

  const loadSampleReview = () => {
    setInputSource("manual");
    setImportedAzureContext(null);
    setContext(sampleReviewContext);
    setManualDiff(sampleReviewDiff);
    setGeneratedTextDiff("");
    setDiffSource("manual");
    setSampleTextSeed((current) => current + 1);
    toast.success("Sample review loaded");
  };

  const handleAzureImport = (azureContext: AzurePullRequestReviewContext) => {
    setInputSource("azure-devops");
    setImportedAzureContext(azureContext);
    setContext(azureContext.reviewInput);
    setManualDiff("");
    setGeneratedFilesDiff("");
    setGeneratedTextDiff("");
    setDiffSource("manual");
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

    const settingsContext = [
      `Review focus: ${selectedFocus.length > 0 ? selectedFocus.join(", ") : "General"}.`,
      `Output style: ${outputStyles.find((style) => style.value === outputStyle)?.label}.`,
      `Review depth: ${reviewDepths.find((depth) => depth.value === reviewDepth)?.label}.`,
    ].join("\n");

    const input: ReviewInput = {
      mode: "code-review",
      provider,
      context: [context.trim(), settingsContext].filter(Boolean).join("\n\n"),
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
    <section className="valra-enter overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-card-foreground">
      <div className="border-b border-white/10 bg-black/15 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white">
              Source input
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
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Label className="text-slate-200">Review source</Label>
              <p className="text-xs leading-5 text-slate-500">
                Use manual input or import pull request context from the saved
                Azure DevOps repository.
              </p>
            </div>
          </div>

          <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/30 p-1 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setInputSource("manual")}
              className={[
                "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow]",
                inputSource === "manual"
                  ? "bg-white/10 text-white shadow-lg shadow-black/15"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100",
              ].join(" ")}
            >
              <FileCode2 className="size-4" />
              Manual
            </button>
            <button
              type="button"
              onClick={() => setInputSource("azure-devops")}
              className={[
                "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow]",
                inputSource === "azure-devops"
                  ? "bg-white/10 text-white shadow-lg shadow-black/15"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100",
              ].join(" ")}
            >
              <GitPullRequest className="size-4" />
              Azure DevOps PR
              {importedAzureContext ? (
                <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                  Imported
                </Badge>
              ) : null}
            </button>
          </div>
        </div>

        {inputSource === "manual" ? (
          <>
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
                    Paste an existing PR diff or generate a combined PR diff
                    from old and new file uploads.
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
                    "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow]",
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
                    "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow]",
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
                    "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow]",
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
          </>
        ) : (
          <>
            <AzurePrImportPanel onImport={handleAzureImport} />
            {importedAzureContext ? (
              <div className="space-y-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      PR #{importedAzureContext.pullRequest.id}:{" "}
                      {importedAzureContext.pullRequest.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-100/80">
                      {importedAzureContext.pullRequest.sourceRefName ??
                        "Unknown source"}{" "}
                      to{" "}
                      {importedAzureContext.pullRequest.targetRefName ??
                        "Unknown target"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="w-fit border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                      {importedAzureContext.summary.changedFileCount} changed
                    </Badge>
                    {importedAzureContext.summary.truncated ? (
                      <Badge className="w-fit border-amber-300/20 bg-amber-300/10 text-amber-100">
                        Truncated
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    [
                      "Imported files",
                      String(importedAzureContext.summary.importedFileCount),
                    ],
                    [
                      "Skipped files",
                      String(importedAzureContext.summary.skippedFileCount),
                    ],
                    [
                      "Latest iteration",
                      importedAzureContext.latestIterationId
                        ? String(importedAzureContext.latestIterationId)
                        : "Unknown",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/10 bg-black/25 p-3"
                    >
                      <p className="text-xs text-emerald-100/70">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {importedAzureContext.warnings.length > 0 ? (
                  <Alert className="border-amber-300/20 bg-amber-300/10 text-amber-100">
                    <AlertTriangle className="size-4" />
                    <AlertTitle>Partial import notes</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 grid gap-1 text-xs leading-5">
                        {importedAzureContext.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : null}

                {importedAzureContext.changedFiles.length > 0 ? (
                  <details className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <summary className="cursor-pointer text-xs font-medium text-emerald-100">
                      Changed files preview
                    </summary>
                    <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                      {importedAzureContext.changedFiles
                        .slice(0, 12)
                        .map((file) => (
                          <div
                            key={`${file.changeType}-${file.path}`}
                            className="flex flex-col gap-2 rounded-lg border border-white/10 bg-[#060a12]/80 p-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-mono text-xs text-slate-100">
                                {file.path}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {file.changeType}
                                {file.skippedReason
                                  ? ` - ${file.skippedReason}`
                                  : ""}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <Badge
                                className={
                                  file.imported
                                    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                                    : "border-slate-300/20 bg-slate-300/10 text-slate-100"
                                }
                              >
                                {file.imported ? "Imported" : "Skipped"}
                              </Badge>
                              {file.diffAvailable ? (
                                <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                                  Diff
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      {importedAzureContext.changedFiles.length > 12 ? (
                        <p className="text-xs text-slate-500">
                          {importedAzureContext.changedFiles.length - 12} more
                          files included in the imported context summary.
                        </p>
                      ) : null}
                    </div>
                  </details>
                ) : null}

                <Textarea
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                  className="h-48 max-h-48 min-h-48 resize-none overflow-y-auto rounded-2xl border-white/10 bg-black/25 font-mono text-xs text-slate-100 focus-visible:ring-cyan-300/25"
                />
              </div>
            ) : null}
          </>
        )}

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-1">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <SlidersHorizontal className="size-4 text-cyan-200" />
                Review settings
              </h3>
              <p className="max-w-xl text-xs leading-5 text-slate-500">
                These settings are added to the review context so local Ollama
                can shape the output without changing provider logic.
              </p>
            </div>

            <div className="grid flex-1 gap-4 xl:grid-cols-[1.2fr_0.9fr_0.8fr]">
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Focus</Label>
                <div className="flex flex-wrap gap-2">
                  {focusOptions.map((focus) => {
                    const selected = selectedFocus.includes(focus);

                    return (
                      <button
                        key={focus}
                        type="button"
                        onClick={() => toggleFocus(focus)}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-[0.98]",
                          selected
                            ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200",
                        ].join(" ")}
                      >
                        {focus}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Output style</Label>
                <div className="grid gap-1 rounded-xl border border-white/10 bg-black/25 p-1">
                  {outputStyles.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setOutputStyle(style.value)}
                      className={[
                        "rounded-lg px-2 py-1.5 text-left text-xs font-medium transition",
                        outputStyle === style.value
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200",
                      ].join(" ")}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Depth</Label>
                <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/25 p-1 xl:grid-cols-1">
                  {reviewDepths.map((depth) => (
                    <button
                      key={depth.value}
                      type="button"
                      onClick={() => setReviewDepth(depth.value)}
                      className={[
                        "rounded-lg px-2 py-1.5 text-xs font-medium transition",
                        reviewDepth === depth.value
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200",
                      ].join(" ")}
                    >
                      {depth.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
            {isAnalyzing ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            {isAnalyzing ? "Review running" : "Run Review"}
          </Button>
        </div>
      </div>
    </section>
  );
}
