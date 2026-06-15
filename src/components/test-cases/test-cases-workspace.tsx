"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  Download,
  FileText,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { OllamaSettingsCard } from "@/components/provider-settings/ollama-settings-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { runOllamaTestCases } from "@/lib/ai/ollama-client";
import { testCaseToMarkdown } from "@/lib/utils/markdown";
import type {
  GeneratedTestCase,
  TestCaseCoverageLevel,
  TestCaseInput,
  TestCaseOutputFormat,
  TestCasePriority,
  TestCaseResult,
  OllamaSettings,
} from "@/types/review";

const testTypes = [
  "Functional",
  "Regression",
  "Edge cases",
  "Negative testing",
  "UI/UX",
  "API",
  "Smoke",
  "Integration",
];

const examples = [
  "User can reset password",
  "Bug: save button remains disabled",
  "Diff changing table row expansion logic",
];

const priorityClassName: Record<TestCasePriority, string> = {
  low: "border-slate-300/20 bg-slate-300/10 text-slate-200",
  medium: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  high: "border-rose-300/25 bg-rose-400/10 text-rose-200",
  critical: "border-red-300/30 bg-red-500/15 text-red-100",
};

export function TestCasesWorkspace() {
  const [context, setContext] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "Functional",
    "Regression",
    "Edge cases",
  ]);
  const [coverageLevel, setCoverageLevel] =
    useState<TestCaseCoverageLevel>("standard");
  const [outputFormat, setOutputFormat] =
    useState<TestCaseOutputFormat>("detailed");
  const [priority, setPriority] = useState<TestCasePriority>("medium");
  const [ollamaSettings, setOllamaSettings] = useState<OllamaSettings>({
    baseUrl:
      process.env.NEXT_PUBLIC_DEFAULT_OLLAMA_URL ?? "http://localhost:11434",
    model: process.env.NEXT_PUBLIC_DEFAULT_OLLAMA_MODEL ?? "qwen3-coder:30b",
  });
  const [result, setResult] = useState<TestCaseResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasInput = context.trim().length > 0;

  const toggleTestType = (type: string) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type]
    );
  };

  const generateTestCases = async () => {
    if (!hasInput) {
      setError("Paste a story, bug report, diff, or QA notes before generating.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const input: TestCaseInput = {
        context,
        instructions,
        testTypes: selectedTypes.length > 0 ? selectedTypes : ["Functional"],
        coverageLevel,
        outputFormat,
        priority,
      };

      const nextResult = await runOllamaTestCases(input, ollamaSettings);
      setResult(nextResult);
      toast.success("Test cases generated");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Test case generation failed.";

      setError(
        `${message} Make sure Ollama is running locally and the selected model is installed.`
      );
      toast.error("Test case generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setResult(null);
    setError(null);
    toast.success("Test case results cleared");
  };

  const copyAll = async () => {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.markdown);
    toast.success("Test cases copied");
  };

  const exportMarkdown = () => {
    if (!result) {
      return;
    }

    const blob = new Blob([result.markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = markdownFilename();
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("Test cases exported");
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <ClipboardList className="size-3" />
              QA coverage builder
            </Badge>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Test Cases
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-slate-300">
                Generate structured QA scenarios from requirements, bugs,
                diffs, or feature notes.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300">
            <span className="text-slate-500">Model</span>{" "}
            <span className="font-mono text-slate-100">
              {ollamaSettings.model || "qwen3-coder:30b"}
            </span>
          </div>
        </div>
      </section>

      <OllamaSettingsCard
        settings={ollamaSettings}
        onChange={setOllamaSettings}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_24rem]">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="border-b border-white/10 bg-black/15 px-4 py-4 sm:px-5">
            <h3 className="text-base font-semibold text-white">
              Source context
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Paste the raw material. User stories, acceptance criteria, bug
              reports, diffs, code review notes, and manual QA notes all work.
            </p>
          </div>

          <div className="space-y-5 p-4 sm:p-5">
            <div className="space-y-2">
              <Label htmlFor="test-context" className="text-slate-200">
                Feature, bug, story, or review context
              </Label>
              <Textarea
                id="test-context"
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder="Paste a user story, acceptance criteria, bug report, PR diff, or QA notes..."
                className="h-72 max-h-72 min-h-72 resize-none overflow-y-auto rounded-2xl border-white/10 bg-[#060a12]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300/25"
              />
              <p className="text-xs leading-5 text-slate-500">
                Best results include expected behavior, affected screens or
                files, user roles, edge conditions, and known risk areas.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-instructions" className="text-slate-200">
                Additional instructions
              </Label>
              <Textarea
                id="test-instructions"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Optional: focus on mobile, API validation, data loss, permissions, or a specific release risk..."
                className="h-28 max-h-28 min-h-28 resize-none overflow-y-auto rounded-2xl border-white/10 bg-[#060a12]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300/25"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <Button
                  key={example}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setContext(example)}
                  className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                >
                  <FileText className="size-3.5" />
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">
                Generation settings
              </h3>
              <p className="text-sm leading-6 text-slate-400">
                Shape the coverage before creating the draft.
              </p>
            </div>

            <Separator className="my-4 bg-white/10" />

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-200">Test type</Label>
                <div className="flex flex-wrap gap-2">
                  {testTypes.map((type) => {
                    const selected = selectedTypes.includes(type);

                    return (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleTestType(type)}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 active:scale-[0.98]",
                          selected
                            ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200",
                        ].join(" ")}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <ConfigSelect
                id="coverage-level"
                label="Coverage level"
                value={coverageLevel}
                onValueChange={(value) =>
                  setCoverageLevel(value as TestCaseCoverageLevel)
                }
                options={[
                  ["basic", "Basic"],
                  ["standard", "Standard"],
                  ["comprehensive", "Comprehensive"],
                ]}
              />

              <ConfigSelect
                id="output-format"
                label="Output format"
                value={outputFormat}
                onValueChange={(value) =>
                  setOutputFormat(value as TestCaseOutputFormat)
                }
                options={[
                  ["checklist", "QA checklist"],
                  ["detailed", "Detailed test cases"],
                  ["gherkin", "Gherkin scenarios"],
                  ["markdown-table", "Markdown table"],
                ]}
              />

              <ConfigSelect
                id="priority"
                label="Priority baseline"
                value={priority}
                onValueChange={(value) => setPriority(value as TestCasePriority)}
                options={[
                  ["low", "Low"],
                  ["medium", "Medium"],
                  ["high", "High"],
                  ["critical", "Critical"],
                ]}
              />
            </div>

            {error ? (
              <Alert className="mt-5 border-rose-300/20 bg-rose-400/10 text-rose-100">
                <AlertTriangle className="size-4" />
                <AlertTitle>Generation blocked</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="button"
              size="lg"
              onClick={generateTestCases}
              disabled={!hasInput || isGenerating}
              className="mt-5 w-full rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              {isGenerating ? "Generating test cases..." : "Generate Test Cases"}
            </Button>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <CheckCircle2 className="size-4 text-emerald-200" />
              Browser-to-Ollama
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Generation calls your local Ollama server directly from this
              browser. Make sure Ollama is running locally and the selected
              model is installed.
            </p>
          </section>
        </aside>
      </div>

      {isGenerating ? (
        <LoadingState />
      ) : result ? (
        <ResultsPanel
          result={result}
          onCopyAll={copyAll}
          onExportMarkdown={exportMarkdown}
          onClear={clearAll}
        />
      ) : (
        <EmptyState onUseExample={setContext} />
      )}
    </div>
  );
}

type ConfigSelectProps = {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<[string, string]>;
};

function ConfigSelect({
  id,
  label,
  value,
  onValueChange,
  options,
}: ConfigSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-slate-200">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className="h-10 w-full rounded-xl border-white/10 bg-[#060a12]/80 text-slate-100"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function EmptyState({ onUseExample }: { onUseExample: (value: string) => void }) {
  return (
    <section className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center">
      <div className="max-w-xl">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
          <ClipboardList className="size-7" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          Ready to generate QA coverage
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Paste a story, bug report, or diff to create structured test cases.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {examples.map((example) => (
            <Button
              key={example}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUseExample(example)}
              className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
          <Loader2 className="size-5 animate-spin" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">
            Generating test cases
          </h3>
          <p className="text-sm text-slate-400">
            Structuring scenarios, risks, and automation candidates.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-2xl bg-white/[0.06]" />
        <Skeleton className="h-40 rounded-2xl bg-white/[0.06]" />
        <Skeleton className="h-40 rounded-2xl bg-white/[0.06]" />
      </div>
    </section>
  );
}

type ResultsPanelProps = {
  result: TestCaseResult;
  onCopyAll: () => void;
  onExportMarkdown: () => void;
  onClear: () => void;
};

function ResultsPanel({
  result,
  onCopyAll,
  onExportMarkdown,
  onClear,
}: ResultsPanelProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="space-y-4 border-b border-white/10 bg-black/15 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Generated coverage
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
              {result.summary}
            </p>
          </div>
          <Badge className="w-fit border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
            {result.testCases.length} cases
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCopyAll}
            className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            <Clipboard />
            Copy all
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onExportMarkdown}
            className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            <Download />
            Export Markdown
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            <RotateCcw />
            Clear results
          </Button>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-3">
          <SummaryList title="Coverage focus" items={result.coverageFocus} />
          <SummaryList title="Regression risks" items={result.regressionRisks} />
          <SummaryList
            title="Automation candidates"
            items={result.automationCandidates}
          />
        </div>

        <div className="space-y-3">
          {result.testCases.map((testCase) => (
            <TestCaseCard key={testCase.id} testCase={testCase} />
          ))}
        </div>

        <SummaryList title="Edge cases" items={result.edgeCases} />
      </div>
    </section>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-200" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TestCaseCard({ testCase }: { testCase: GeneratedTestCase }) {
  const copyCase = async () => {
    await navigator.clipboard.writeText(testCaseToMarkdown(testCase));
    toast.success(`${testCase.id} copied`);
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-cyan-300/20 bg-cyan-300/10 font-mono text-cyan-100">
              {testCase.id}
            </Badge>
            <Badge className={`capitalize ${priorityClassName[testCase.priority]}`}>
              {testCase.priority}
            </Badge>
            <Badge className="border-white/10 bg-white/[0.04] text-slate-200">
              {testCase.type}
            </Badge>
          </div>
          <h4 className="mt-3 text-base font-semibold text-white">
            {testCase.title}
          </h4>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyCase}
          className="w-fit rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
        >
          <Clipboard />
          Copy
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr_1fr]">
        <DetailBlock title="Preconditions" items={testCase.preconditions} />
        <DetailBlock title="Steps" items={testCase.steps} ordered />
        <div className="space-y-4">
          <TextBlock title="Expected result" value={testCase.expectedResult} />
          <DetailBlock title="Test data" items={testCase.testData} />
          <TextBlock title="Notes" value={testCase.notes} />
        </div>
      </div>
    </article>
  );
}

function DetailBlock({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  const List = ordered ? "ol" : "ul";
  const displayItems = items.length > 0 ? items : ["Not provided."];

  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <List
        className={[
          "mt-2 space-y-2 text-sm leading-6 text-slate-300",
          ordered ? "list-decimal pl-5" : "list-disc pl-5",
        ].join(" ")}
      >
        {displayItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </List>
    </div>
  );
}

function TextBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-300">
        {value || "Not provided."}
      </p>
    </div>
  );
}

function markdownFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `test-cases-${stamp}.md`;
}
