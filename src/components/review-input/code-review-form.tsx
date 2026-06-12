"use client";

import {
  Bot,
  Bug,
  Cloud,
  Code2,
  Eraser,
  FileCode2,
  GitCompareArrows,
  Loader2,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { ReviewFileUploader } from "@/components/file-uploader/review-file-uploader";
import { LineNumberedTextarea } from "@/components/review-input/line-numbered-textarea";
import { OllamaSettingsCard } from "@/components/provider-settings/ollama-settings-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  sampleFilePath,
  sampleNewFile,
  sampleOldFile,
  sampleReviewContext,
  sampleReviewDiff,
} from "@/data/sample-review";
import { runOllamaCodeReview } from "@/lib/ai/ollama-client";
import { generateUnifiedDiff } from "@/lib/parsers/diff-parser";
import { runStaticHeuristics } from "@/lib/static-analysis/heuristics";
import type {
  OllamaSettings,
  ReviewInput,
  ReviewMode,
  ReviewProvider,
  ReviewResult,
  UploadedReviewFile,
} from "@/types/review";

type CodeReviewFormProps = {
  onResult: (result: ReviewResult) => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
};

type DiffInputMode = "paste" | "generate";

const defaultGeneratedFilePath = "src/example.tsx";

const modeOptions: Array<{
  value: ReviewMode;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "code-review", label: "Code Review", icon: Code2 },
  { value: "bug-report", label: "Bug Report", icon: Bug },
  { value: "pr-comment", label: "PR Comment", icon: MessageSquareText },
  { value: "test-cases", label: "Test Cases", icon: FileCode2 },
];

const providerOptions: Array<{
  value: ReviewProvider;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  disabled?: boolean;
}> = [
  {
    value: "ollama",
    label: "Local Ollama",
    description: "Run AI review from this browser against local Ollama.",
    icon: Bot,
  },
  {
    value: "static",
    label: "Static Only",
    description: "Use fast local heuristics without calling an AI model.",
    icon: Sparkles,
  },
  {
    value: "cloud",
    label: "Cloud AI",
    description: "Hosted providers will be added later.",
    icon: Cloud,
    disabled: true,
  },
];

const sampleDiff = `diff --git a/src/review.ts b/src/review.ts
@@ -1,4 +1,6 @@
+console.log("debug review")
 export async function loadReview() {
-  return fetch("/api/review")
+  const result = await fetch("http://localhost:3000/api/review")
+  return result.json()
 }`;

export function CodeReviewForm({
  onResult,
  onAnalyzingChange,
}: CodeReviewFormProps) {
  const [mode, setMode] = useState<ReviewMode>("code-review");
  const [provider, setProvider] = useState<ReviewProvider>("ollama");
  const [context, setContext] = useState("");
  const [diff, setDiff] = useState("");
  const [diffInputMode, setDiffInputMode] =
    useState<DiffInputMode>("paste");
  const [generatedFilePath, setGeneratedFilePath] = useState(
    defaultGeneratedFilePath
  );
  const [oldFileContent, setOldFileContent] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [generatedDiffPreview, setGeneratedDiffPreview] = useState("");
  const [files, setFiles] = useState<UploadedReviewFile[]>([]);
  const [settings, setSettings] = useState<OllamaSettings>({
    baseUrl:
      process.env.NEXT_PUBLIC_DEFAULT_OLLAMA_URL ?? "http://localhost:11434",
    model: process.env.NEXT_PUBLIC_DEFAULT_OLLAMA_MODEL ?? "qwen3-coder:30b",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const hasReviewInput =
    context.trim().length > 0 || diff.trim().length > 0 || files.length > 0;

  const handleGenerateDiff = () => {
    if (!oldFileContent.trim() || !newFileContent.trim()) {
      toast.error("Add both old and new file content before generating a diff.");
      return;
    }

    if (oldFileContent === newFileContent) {
      toast.error("Old and new file content must be different.");
      return;
    }

    const nextDiff = generateUnifiedDiff({
      oldContent: oldFileContent,
      newContent: newFileContent,
      filePath: generatedFilePath,
    });

    setDiff(nextDiff);
    setGeneratedDiffPreview(nextDiff);
    toast.success("Generated diff is ready for review");
  };

  const clearGeneratedDiff = () => {
    if (diff === generatedDiffPreview) {
      setDiff("");
    }

    setGeneratedFilePath(defaultGeneratedFilePath);
    setOldFileContent("");
    setNewFileContent("");
    setGeneratedDiffPreview("");
  };

  const loadSampleReview = () => {
    const nextDiff =
      sampleReviewDiff ||
      generateUnifiedDiff({
        oldContent: sampleOldFile,
        newContent: sampleNewFile,
        filePath: sampleFilePath,
      });

    setContext(sampleReviewContext);
    setGeneratedFilePath(sampleFilePath);
    setOldFileContent(sampleOldFile);
    setNewFileContent(sampleNewFile);
    setGeneratedDiffPreview(nextDiff);
    setDiff(nextDiff);
    setDiffInputMode("generate");
    toast.success("Sample review loaded");
  };

  const handleAnalyze = async () => {
    if (!hasReviewInput) {
      toast.error("Add context, a diff, or at least one file before analyzing.");
      return;
    }

    if (provider === "cloud") {
      toast.error("Cloud AI is not implemented yet.");
      return;
    }

    const input: ReviewInput = {
      mode,
      provider,
      context,
      diff,
      files,
    };

    setIsAnalyzing(true);
    onAnalyzingChange?.(true);

    try {
      const result =
        provider === "static"
          ? runStaticHeuristics(input)
          : await runOllamaCodeReview(input, settings);

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
              Add context, paste a diff, upload files, then choose how to analyze.
            </p>
          </div>
          <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
            Live workspace
          </Badge>
        </div>
      </div>

      <div className="space-y-6 px-4 py-5 sm:px-5">
        <div className="space-y-3">
          <Label className="text-slate-200">Review mode</Label>
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as ReviewMode)}
          >
            <TabsList className="grid h-auto w-full grid-cols-2 border border-white/10 bg-black/30 p-1 sm:grid-cols-4">
              {modeOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    className="min-h-9 rounded-lg data-active:bg-white/10 data-active:text-white"
                  >
                    <Icon className="size-3.5" />
                    <span className="truncate">{option.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-200">Provider</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {providerOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = provider === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => setProvider(option.value)}
                  className={[
                    "rounded-xl border p-3 text-left transition-all",
                    "hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.06]",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    isSelected
                      ? "border-cyan-300/35 bg-cyan-300/10 shadow-lg shadow-cyan-950/20"
                      : "border-white/10 bg-black/20",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-100">
                      <Icon className="size-4" />
                      {option.label}
                    </span>
                    {option.disabled ? (
                      <Badge className="bg-amber-300/10 text-amber-100">
                        Soon
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {provider === "ollama" ? (
          <OllamaSettingsCard settings={settings} onChange={setSettings} />
        ) : null}

        <Separator />

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
            className="min-h-28 resize-y rounded-2xl border-white/10 bg-black/25 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300/25"
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Label htmlFor="review-diff" className="text-slate-200">
                Pull Request Diff
              </Label>
              <p className="text-xs leading-5 text-slate-500">
                Paste an existing PR diff or generate one from old and new file
                content.
              </p>
            </div>
            {generatedDiffPreview ? (
              <Badge className="w-fit border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                Generated
              </Badge>
            ) : null}
          </div>

          <Tabs
            value={diffInputMode}
            onValueChange={(value) => setDiffInputMode(value as DiffInputMode)}
          >
            <TabsList className="grid h-auto w-full grid-cols-2 border border-white/10 bg-black/30 p-1">
              <TabsTrigger
                value="paste"
                className="min-h-9 rounded-lg data-active:bg-white/10 data-active:text-white"
              >
                <FileCode2 className="size-3.5" />
                Paste Diff
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="min-h-9 rounded-lg data-active:bg-white/10 data-active:text-white"
              >
                <GitCompareArrows className="size-3.5" />
                Generate Diff
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {diffInputMode === "paste" ? (
            <LineNumberedTextarea
              id="review-diff"
              value={diff}
              onChange={(event) => {
                setDiff(event.target.value);
                setGeneratedDiffPreview("");
              }}
              placeholder={sampleDiff}
            />
          ) : (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
              <p className="text-sm leading-6 text-slate-400">
                Paste the previous and updated versions of a file to
                automatically generate a review-ready diff.
              </p>

              <div className="space-y-2">
                <Label htmlFor="generated-file-path" className="text-slate-200">
                  File path
                </Label>
                <Input
                  id="generated-file-path"
                  value={generatedFilePath}
                  onChange={(event) => setGeneratedFilePath(event.target.value)}
                  placeholder="src/components/UserForm.tsx"
                  className="h-10 rounded-xl border-white/10 bg-[#060a12]/80 font-mono text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300/25"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="old-file-content" className="text-slate-200">
                    Old file content
                  </Label>
                  <LineNumberedTextarea
                    id="old-file-content"
                    value={oldFileContent}
                    onChange={(event) => setOldFileContent(event.target.value)}
                    placeholder={`type Props = any;\n\nexport function UserForm(props: Props) {\n  return <form>{props.name}</form>;\n}`}
                    className="min-h-64"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-file-content" className="text-slate-200">
                    New file content
                  </Label>
                  <LineNumberedTextarea
                    id="new-file-content"
                    value={newFileContent}
                    onChange={(event) => setNewFileContent(event.target.value)}
                    placeholder={`type UserFormProps = {\n  name: string;\n};\n\nexport function UserForm(props: UserFormProps) {\n  return <form>{props.name}</form>;\n}`}
                    className="min-h-64"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-500">
                  The generated diff is saved into the main review input
                  automatically.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearGeneratedDiff}
                    className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                  >
                    <Eraser />
                    Clear
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGenerateDiff}
                    className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  >
                    <GitCompareArrows />
                    Generate Diff
                  </Button>
                </div>
              </div>

              {generatedDiffPreview ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label
                      htmlFor="generated-diff-preview"
                      className="text-slate-200"
                    >
                      Generated preview
                    </Label>
                    <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                      Generated
                    </Badge>
                  </div>
                  <LineNumberedTextarea
                    id="generated-diff-preview"
                    value={generatedDiffPreview}
                    readOnly
                    className="min-h-64 resize-none text-slate-300"
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Supporting files</Label>
          <ReviewFileUploader files={files} onFilesChange={setFiles} />
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
