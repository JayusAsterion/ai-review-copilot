"use client";

import { ClipboardList, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { BugAttachmentUploader } from "@/components/file-uploader/bug-attachment-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { sampleBugReport } from "@/data/sample-bug-report";
import { runOllamaBugReport } from "@/lib/ai/ollama-client";
import { generateStaticBugReport } from "@/lib/static-analysis/bug-report-formatter";
import type {
  BugReportInput,
  BugReportResult,
  OllamaSettings,
  ReproductionRate,
  ReviewProvider,
} from "@/types/review";

type BugReportFormProps = {
  provider: ReviewProvider;
  ollamaSettings: OllamaSettings;
  onResult: (result: BugReportResult) => void;
};

const emptyBugReport: BugReportInput = {
  application: "",
  module: "",
  environment: "QA",
  url: "",
  userRole: "",
  browser: "",
  device: "",
  buildVersion: "",
  reproductionRate: "unknown",
  roughNotes: "",
  stepsToReproduce: "",
  actualResult: "",
  expectedResult: "",
  additionalContext: "",
  screenshotNotes: "",
  attachments: [],
};

const environmentOptions = ["QA", "Dev", "Staging", "Production", "Local"];

const reproductionOptions: Array<{
  value: ReproductionRate;
  label: string;
}> = [
  { value: "always", label: "Always" },
  { value: "sometimes", label: "Sometimes" },
  { value: "rarely", label: "Rarely" },
  { value: "unknown", label: "Unknown" },
];

const inputClassName =
  "h-10 rounded-xl border-white/10 bg-[#060a12]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300/25";

const textareaClassName =
  "resize-none overflow-y-auto rounded-2xl border-white/10 bg-[#060a12]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300/25";

export function BugReportForm({
  provider,
  ollamaSettings,
  onResult,
}: BugReportFormProps) {
  const [input, setInput] = useState<BugReportInput>(emptyBugReport);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateInput = <Key extends keyof BugReportInput>(
    key: Key,
    value: BugReportInput[Key]
  ) => {
    setInput((current) => ({ ...current, [key]: value }));
  };

  const loadSampleBugReport = () => {
    setInput({ ...emptyBugReport, ...sampleBugReport, attachments: [] });
    toast.success("Sample bug report loaded");
  };

  const clearForm = () => {
    setInput(emptyBugReport);
    toast.success("Bug report form cleared");
  };

  const hasMainInput = [
    input.roughNotes,
    input.actualResult,
    input.expectedResult,
    input.stepsToReproduce,
  ].some((value) => value?.trim());

  const handleGenerate = async () => {
    if (!hasMainInput) {
      toast.error(
        "Add rough notes, steps, actual result, or expected result before generating."
      );
      return;
    }

    if (provider === "cloud") {
      toast.error("Cloud AI is not implemented yet.");
      return;
    }

    setIsGenerating(true);

    try {
      const result =
        provider === "static"
          ? generateStaticBugReport(input)
          : await runOllamaBugReport(input, ollamaSettings);

      onResult(result);
      toast.success("Bug report generated");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Bug report generation failed.";

      if (provider === "ollama") {
        toast.error(
          `${message} Check Ollama, Docker, model name, and OLLAMA_ORIGINS.`
        );
      } else {
        toast.error(message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-card/70 text-card-foreground shadow-2xl shadow-black/25 backdrop-blur-xl"
    >
      <div className="border-b border-white/10 bg-white/[0.035] px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
                <ClipboardList className="size-4" />
              </span>
              Bug report workspace
            </h2>
            <p className="text-sm leading-6 text-slate-400">
              Turn structured QA notes, reproduction steps, and screenshot
              context into a developer-ready bug report.
            </p>
          </div>
          <Badge className="border-amber-300/20 bg-amber-300/10 text-amber-100">
            QA workflow
          </Badge>
        </div>
      </div>

      <div className="space-y-8 px-4 py-5 sm:px-6 sm:py-6">
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Basic context</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Add enough environment detail so the report can be reproduced.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bug-application" className="text-slate-200">
                Application / Product
              </Label>
              <Input
                id="bug-application"
                value={input.application}
                onChange={(event) => updateInput("application", event.target.value)}
                placeholder="CIVIX"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-module" className="text-slate-200">
                Module / Page
              </Label>
              <Input
                id="bug-module"
                value={input.module}
                onChange={(event) => updateInput("module", event.target.value)}
                placeholder="System Tables > Office"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-environment" className="text-slate-200">
                Environment
              </Label>
              <Select
                value={input.environment || "QA"}
                onValueChange={(value) => updateInput("environment", value)}
              >
                <SelectTrigger
                  id="bug-environment"
                  className="h-10 w-full rounded-xl border-white/10 bg-[#060a12]/80 text-slate-100"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {environmentOptions.map((environment) => (
                    <SelectItem key={environment} value={environment}>
                      {environment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-url" className="text-slate-200">
                URL
              </Label>
              <Input
                id="bug-url"
                value={input.url}
                onChange={(event) => updateInput("url", event.target.value)}
                placeholder="https://qa.example.com/system-tables/office"
                className={`${inputClassName} font-mono`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-user-role" className="text-slate-200">
                User role
              </Label>
              <Input
                id="bug-user-role"
                value={input.userRole}
                onChange={(event) => updateInput("userRole", event.target.value)}
                placeholder="Admin"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-browser" className="text-slate-200">
                Browser
              </Label>
              <Input
                id="bug-browser"
                value={input.browser}
                onChange={(event) => updateInput("browser", event.target.value)}
                placeholder="Chrome 126"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-device" className="text-slate-200">
                Device
              </Label>
              <Input
                id="bug-device"
                value={input.device}
                onChange={(event) => updateInput("device", event.target.value)}
                placeholder="Windows desktop"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-build-version" className="text-slate-200">
                Build / Version
              </Label>
              <Input
                id="bug-build-version"
                value={input.buildVersion}
                onChange={(event) =>
                  updateInput("buildVersion", event.target.value)
                }
                placeholder="2026.06.12-qa"
                className={`${inputClassName} font-mono`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-reproduction-rate" className="text-slate-200">
                Reproduction rate
              </Label>
              <Select
                value={input.reproductionRate || "unknown"}
                onValueChange={(value) =>
                  updateInput("reproductionRate", value as ReproductionRate)
                }
              >
                <SelectTrigger
                  id="bug-reproduction-rate"
                  className="h-10 w-full rounded-xl border-white/10 bg-[#060a12]/80 text-slate-100"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reproductionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Main QA input</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Paste rough notes or use structured fields. One substantial field
              is enough to generate a draft.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bug-rough-notes" className="text-slate-200">
              Rough QA notes
            </Label>
            <Textarea
              id="bug-rough-notes"
              value={input.roughNotes}
              onChange={(event) => updateInput("roughNotes", event.target.value)}
              placeholder="Paste rough QA notes, screenshots description, logs, or quick observations..."
              className={`${textareaClassName} h-40 max-h-40 min-h-40`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bug-steps" className="text-slate-200">
                Steps to reproduce
              </Label>
              <Textarea
                id="bug-steps"
                value={input.stepsToReproduce}
                onChange={(event) =>
                  updateInput("stepsToReproduce", event.target.value)
                }
                placeholder={`1. Log in
2. Navigate to the affected module
3. Reproduce the issue...`}
                className={`${textareaClassName} h-56 max-h-56 min-h-56`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-additional-context" className="text-slate-200">
                Additional context
              </Label>
              <Textarea
                id="bug-additional-context"
                value={input.additionalContext}
                onChange={(event) =>
                  updateInput("additionalContext", event.target.value)
                }
                placeholder="Related records, account state, feature flags, logs, recent deployments..."
                className={`${textareaClassName} h-56 max-h-56 min-h-56`}
              />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bug-actual-result" className="text-slate-200">
                Actual result
              </Label>
              <Textarea
                id="bug-actual-result"
                value={input.actualResult}
                onChange={(event) =>
                  updateInput("actualResult", event.target.value)
                }
                placeholder="What happened?"
                className={`${textareaClassName} h-44 max-h-44 min-h-44`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-expected-result" className="text-slate-200">
                Expected result
              </Label>
              <Textarea
                id="bug-expected-result"
                value={input.expectedResult}
                onChange={(event) =>
                  updateInput("expectedResult", event.target.value)
                }
                placeholder="What should have happened?"
                className={`${textareaClassName} h-44 max-h-44 min-h-44`}
              />
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Screenshot and attachments
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Attach screenshots or logs as context. Only names and notes are
              sent to Ollama.
            </p>
          </div>

          <BugAttachmentUploader
            attachments={input.attachments ?? []}
            onAttachmentsChange={(attachments) =>
              updateInput("attachments", attachments)
            }
          />

          <div className="space-y-2">
            <Label htmlFor="bug-screenshot-notes" className="text-slate-200">
              Screenshot notes
            </Label>
            <Textarea
              id="bug-screenshot-notes"
              value={input.screenshotNotes}
              onChange={(event) =>
                updateInput("screenshotNotes", event.target.value)
              }
              placeholder="Describe what is visible in the screenshot, highlighted issue, incorrect UI state, missing button, etc."
              className={`${textareaClassName} h-32 max-h-32 min-h-32`}
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={loadSampleBugReport}
              className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
            >
              <Sparkles />
              Load sample bug report
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearForm}
              className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
            >
              <RotateCcw />
              Clear
            </Button>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-2xl bg-cyan-300 px-5 text-slate-950 shadow-lg shadow-cyan-950/30 hover:bg-cyan-200"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isGenerating ? "Generating" : "Generate Bug Report"}
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
