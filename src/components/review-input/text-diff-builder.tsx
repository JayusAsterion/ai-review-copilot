"use client";

import { Clipboard, GitCompareArrows, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { LineNumberedTextarea } from "@/components/review-input/line-numbered-textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateUnifiedDiff } from "@/lib/parsers/diff-parser";

type TextDiffBuilderProps = {
  value?: string;
  onChange: (generatedDiff: string) => void;
  sampleKey?: number;
  sampleFilePath?: string;
  sampleOldContent?: string;
  sampleNewContent?: string;
};

export function TextDiffBuilder({
  value,
  onChange,
  sampleKey,
  sampleFilePath,
  sampleOldContent,
  sampleNewContent,
}: TextDiffBuilderProps) {
  const hasSample = sampleKey !== undefined && sampleKey > 0;
  const [filePath, setFilePath] = useState(
    hasSample ? (sampleFilePath ?? "src/example.tsx") : "src/example.tsx"
  );
  const [oldContent, setOldContent] = useState(
    hasSample ? (sampleOldContent ?? "") : ""
  );
  const [newContent, setNewContent] = useState(
    hasSample ? (sampleNewContent ?? "") : ""
  );
  const [generatedDiff, setGeneratedDiff] = useState(value ?? "");

  const generateDiff = () => {
    if (!oldContent.trim()) {
      toast.error("Paste old file content before generating a diff.");
      return;
    }

    if (!newContent.trim()) {
      toast.error("Paste new file content before generating a diff.");
      return;
    }

    if (oldContent === newContent) {
      toast.error("Old and new file content are identical.");
      return;
    }

    const nextDiff = generateUnifiedDiff({
      oldContent,
      newContent,
      filePath,
    });

    setGeneratedDiff(nextDiff);
    onChange(nextDiff);
    toast.success("Generated text diff");
  };

  const clear = () => {
    setFilePath("src/example.tsx");
    setOldContent("");
    setNewContent("");
    setGeneratedDiff("");
    onChange("");
    toast.success("Text diff builder cleared");
  };

  const copyGeneratedDiff = async () => {
    const diffToCopy = generatedDiff || value || "";

    if (!diffToCopy.trim()) {
      toast.error("Generate a diff before copying.");
      return;
    }

    await navigator.clipboard.writeText(diffToCopy);
    toast.success("Generated diff copied");
  };

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-5">
      <div className="space-y-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <GitCompareArrows className="size-4 text-cyan-200" />
          Generate Diff from Text
        </h3>
        <p className="text-sm leading-6 text-slate-400">
          Paste the previous and updated versions of a file to generate a
          review-ready unified diff.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-diff-file-path" className="text-slate-200">
          File path
        </Label>
        <Input
          id="text-diff-file-path"
          value={filePath}
          onChange={(event) => setFilePath(event.target.value)}
          placeholder="src/components/UserProfile.tsx"
          className="h-10 rounded-xl border-white/10 bg-black/25 font-mono text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300/25"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="text-diff-old-content" className="text-slate-200">
            Old file content
          </Label>
          <LineNumberedTextarea
            id="text-diff-old-content"
            value={oldContent}
            onChange={(event) => setOldContent(event.target.value)}
            placeholder="Paste the previous version of the file..."
            containerClassName="h-80"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="text-diff-new-content" className="text-slate-200">
            New file content
          </Label>
          <LineNumberedTextarea
            id="text-diff-new-content"
            value={newContent}
            onChange={(event) => setNewContent(event.target.value)}
            placeholder="Paste the updated version of the file..."
            containerClassName="h-80"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">
          Generating updates the same PR diff input used by Static Only and
          Local Ollama analysis.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={clear}
            className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            <Trash2 />
            Clear
          </Button>
          <Button
            type="button"
            onClick={generateDiff}
            className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
          >
            <GitCompareArrows />
            Generate Diff
          </Button>
        </div>
      </div>

      {generatedDiff.trim() ? (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#060a12]/70 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">
                Generated Preview
              </h3>
              <Badge className="w-fit border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                Generated
              </Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={copyGeneratedDiff}
              className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
            >
              <Clipboard />
              Copy Generated Diff
            </Button>
          </div>

          <pre className="h-96 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-5 text-slate-300">
            <code className="whitespace-pre">{generatedDiff}</code>
          </pre>
        </div>
      ) : null}
    </div>
  );
}
