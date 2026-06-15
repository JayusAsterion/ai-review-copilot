"use client";

import {
  Bot,
  Cloud,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType } from "react";
import { useState } from "react";

import { OllamaSettingsCard } from "@/components/provider-settings/ollama-settings-card";
import { BugReportForm } from "@/components/review-input/bug-report-form";
import { CodeReviewForm } from "@/components/review-input/code-review-form";
import { BugReportResultPanel } from "@/components/review-result/bug-report-result-panel";
import { ReviewResultPanel } from "@/components/review-result/review-result-panel";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type {
  BugReportResult,
  OllamaSettings,
  ReviewMode,
  ReviewProvider,
  ReviewResult,
} from "@/types/review";

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
    description: "Run AI workflows from this browser against local Ollama.",
    icon: Bot,
  },
  {
    value: "static",
    label: "Static Only",
    description: "Use fast local formatting and heuristics without AI.",
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

type ReviewWorkspaceProps = {
  initialMode?: Extract<ReviewMode, "code-review" | "bug-report">;
};

export function ReviewWorkspace({
  initialMode = "code-review",
}: ReviewWorkspaceProps) {
  const mode = initialMode;
  const [provider, setProvider] = useState<ReviewProvider>("ollama");
  const [ollamaSettings, setOllamaSettings] = useState<OllamaSettings>({
    baseUrl:
      process.env.NEXT_PUBLIC_DEFAULT_OLLAMA_URL ?? "http://localhost:11434",
    model: process.env.NEXT_PUBLIC_DEFAULT_OLLAMA_MODEL ?? "qwen3-coder:30b",
  });
  const [codeReviewResult, setCodeReviewResult] =
    useState<ReviewResult | null>(null);
  const [bugReportResult, setBugReportResult] =
    useState<BugReportResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-1 flex-col gap-6 pb-10"
    >
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-card-foreground">
        <div className="grid gap-5 px-4 py-5 sm:px-5">
          <div className="space-y-3">
            <Label className="text-slate-200">AI provider</Label>
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
                      "rounded-xl border p-3 text-left transition-[border-color,background-color,transform]",
                      "hover:border-cyan-300/25 hover:bg-white/[0.06] active:scale-[0.99]",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      isSelected
                        ? "border-cyan-300/35 bg-cyan-300/10"
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
            <div>
              <OllamaSettingsCard
                settings={ollamaSettings}
                onChange={setOllamaSettings}
              />
            </div>
          ) : null}
        </div>
      </section>

      {mode === "bug-report" ? (
        <>
          <BugReportForm
            provider={provider}
            ollamaSettings={ollamaSettings}
            onResult={setBugReportResult}
          />
          <BugReportResultPanel result={bugReportResult} />
        </>
      ) : (
        <>
          <CodeReviewForm
            provider={provider}
            ollamaSettings={ollamaSettings}
            onResult={setCodeReviewResult}
            onAnalyzingChange={setIsAnalyzing}
          />
          <ReviewResultPanel
            result={codeReviewResult}
            isLoading={isAnalyzing}
            onClear={() => setCodeReviewResult(null)}
          />
        </>
      )}
    </motion.div>
  );
}
