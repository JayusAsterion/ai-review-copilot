"use client";

import {
  Clipboard,
  FileCode2,
  GitCompareArrows,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  combineGeneratedDiffs,
  generateMultiFileDiffs,
} from "@/lib/parsers/diff-parser";
import { cn } from "@/lib/utils";
import { formatFileSize, guessLanguageFromFilename } from "@/lib/utils/file";
import type {
  GeneratedFileDiff,
  ReviewFileVersion,
  ReviewSourceFile,
} from "@/types/review";

type MultiFileDiffBuilderProps = {
  value?: string;
  onChange: (combinedDiff: string) => void;
};

const acceptedFiles = {
  "text/typescript": [".ts", ".tsx"],
  "text/javascript": [".js", ".jsx"],
  "application/json": [".json"],
  "text/markdown": [".md"],
  "text/css": [".css"],
  "text/html": [".html"],
  "text/plain": [".txt"],
};

const statusClassName: Record<GeneratedFileDiff["status"], string> = {
  modified: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  added: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  deleted: "border-rose-300/25 bg-rose-400/10 text-rose-100",
  unmatched: "border-amber-300/20 bg-amber-300/10 text-amber-100",
};

function createFileId(file: File, version: ReviewFileVersion): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${version}-${file.name}-${file.size}-${file.lastModified}`;
}

function getFilePath(file: File): string {
  const fileWithPath = file as File & { webkitRelativePath?: string; path?: string };
  return fileWithPath.webkitRelativePath || fileWithPath.path || file.name;
}

function filenameFromPath(path: string): string {
  return path.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? path;
}

function FileDropzone({
  title,
  description,
  version,
  files,
  onFilesChange,
}: {
  title: string;
  description: string;
  version: ReviewFileVersion;
  files: ReviewSourceFile[];
  onFilesChange: (files: ReviewSourceFile[]) => void;
}) {
  const onDrop = useCallback(
    async (accepted: File[]) => {
      try {
        const uploaded = await Promise.all(
          accepted.map(async (file) => {
            const path = getFilePath(file);

            return {
              id: createFileId(file, version),
              name: file.name,
              path,
              language: guessLanguageFromFilename(file.name),
              size: file.size,
              content: await file.text(),
              version,
            };
          })
        );

        onFilesChange([...files, ...uploaded]);
        toast.success(
          `${uploaded.length} ${version} file${
            uploaded.length === 1 ? "" : "s"
          } added`
        );
      } catch {
        toast.error("Could not read one or more files as text.");
      }
    },
    [files, onFilesChange, version]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: acceptedFiles,
      multiple: true,
      onDropRejected: () => {
        toast.error("Only code, JSON, Markdown, CSS, HTML, and text files are supported.");
      },
    });

  const removeFile = (id: string) => {
    onFilesChange(files.filter((file) => file.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-slate-200">{title}</Label>
        <p className="text-xs leading-5 text-slate-500">{description}</p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/12 bg-black/20 px-4 py-7 text-center transition-all",
          "hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.05]",
          isDragActive && "border-cyan-300/50 bg-cyan-300/10"
        )}
      >
        <input {...getInputProps()} />
        <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
          <UploadCloud className="size-5" />
        </div>
        <p className="text-sm font-medium text-slate-100">
          {isDragActive ? "Drop files here" : "Drop files or click to upload"}
        </p>
        <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
          Supports TS, TSX, JS, JSX, JSON, MD, CSS, HTML, and TXT files.
        </p>
      </div>

      {fileRejections.length > 0 ? (
        <p className="text-xs text-destructive">
          {fileRejections.length} unsupported file
          {fileRejections.length === 1 ? "" : "s"} skipped.
        </p>
      ) : null}

      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                <FileCode2 className="size-4 text-cyan-200" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-medium text-slate-100">
                  {file.path || file.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge className="bg-white/[0.06] text-slate-300">
                    {file.language}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(file.id)}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function MultiFileDiffBuilder({
  value,
  onChange,
}: MultiFileDiffBuilderProps) {
  const [oldFiles, setOldFiles] = useState<ReviewSourceFile[]>([]);
  const [newFiles, setNewFiles] = useState<ReviewSourceFile[]>([]);
  const [generatedDiffs, setGeneratedDiffs] = useState<GeneratedFileDiff[]>([]);
  const [activeDiffId, setActiveDiffId] = useState<string | null>(null);

  const summary = generatedDiffs.reduce(
    (totals, diff) => ({
      files: totals.files + 1,
      modified: totals.modified + (diff.status === "modified" ? 1 : 0),
      added: totals.added + (diff.status === "added" ? 1 : 0),
      deleted: totals.deleted + (diff.status === "deleted" ? 1 : 0),
      additions: totals.additions + diff.additions,
      deletions: totals.deletions + diff.deletions,
    }),
    {
      files: 0,
      modified: 0,
      added: 0,
      deleted: 0,
      additions: 0,
      deletions: 0,
    }
  );

  const clearGeneratedState = () => {
    setGeneratedDiffs([]);
    setActiveDiffId(null);
    onChange("");
  };

  const updateOldFiles = (files: ReviewSourceFile[]) => {
    setOldFiles(files);
    clearGeneratedState();
  };

  const updateNewFiles = (files: ReviewSourceFile[]) => {
    setNewFiles(files);
    clearGeneratedState();
  };

  const generateDiffs = () => {
    if (oldFiles.length === 0 && newFiles.length === 0) {
      toast.error("Upload old or new version files before generating a PR diff.");
      return;
    }

    const nextDiffs = generateMultiFileDiffs({ oldFiles, newFiles });

    if (nextDiffs.length === 0) {
      toast.error("No file changes were detected.");
      return;
    }

    const combinedDiff = combineGeneratedDiffs(nextDiffs);
    setGeneratedDiffs(nextDiffs);
    setActiveDiffId(nextDiffs[0]?.id ?? null);
    onChange(combinedDiff);
    toast.success("Generated combined PR diff");
  };

  const clearFiles = () => {
    setOldFiles([]);
    setNewFiles([]);
    clearGeneratedState();
    toast.success("File diff builder cleared");
  };

  const copyCombinedDiff = async () => {
    const combinedDiff = value ?? combineGeneratedDiffs(generatedDiffs);

    if (!combinedDiff.trim()) {
      toast.error("Generate a PR diff before copying.");
      return;
    }

    await navigator.clipboard.writeText(combinedDiff);
    toast.success("Combined diff copied");
  };

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-5">
      <div className="space-y-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <GitCompareArrows className="size-4 text-cyan-200" />
          Generate PR Diff from Files
        </h3>
        <p className="text-sm leading-6 text-slate-400">
          Upload the previous and updated versions of your files. The app will
          match them, generate one diff per file, and analyze the full PR.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <FileDropzone
          title="Old version files"
          description="Upload the files before the change."
          version="old"
          files={oldFiles}
          onFilesChange={updateOldFiles}
        />
        <FileDropzone
          title="New version files"
          description="Upload the files after the change."
          version="new"
          files={newFiles}
          onFilesChange={updateNewFiles}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-100">Matched files</p>
            <p className="mt-1 text-xs text-slate-500">
              Matching is based on normalized path first, then filename.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/[0.06] text-slate-300">
              Old: {oldFiles.length}
            </Badge>
            <Badge className="bg-white/[0.06] text-slate-300">
              New: {newFiles.length}
            </Badge>
          </div>
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
            onClick={clearFiles}
            className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            <Trash2 />
            Clear files
          </Button>
          <Button
            type="button"
            onClick={generateDiffs}
            className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
          >
            <GitCompareArrows />
            Generate PR Diff
          </Button>
        </div>
      </div>

      {generatedDiffs.length > 0 ? (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#060a12]/70 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Generated PR Preview
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Preview each generated file diff before analyzing the combined
                PR diff.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={copyCombinedDiff}
              className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
            >
              <Clipboard />
              Copy combined diff
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Badge className="justify-center bg-white/[0.06] text-slate-300">
              {summary.files} files
            </Badge>
            <Badge className="justify-center border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              {summary.modified} modified
            </Badge>
            <Badge className="justify-center border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
              {summary.added} added
            </Badge>
            <Badge className="justify-center border-rose-300/25 bg-rose-400/10 text-rose-100">
              {summary.deleted} deleted
            </Badge>
            <Badge className="justify-center border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
              +{summary.additions}
            </Badge>
            <Badge className="justify-center border-rose-300/25 bg-rose-400/10 text-rose-100">
              -{summary.deletions}
            </Badge>
          </div>

          <Tabs
            value={activeDiffId ?? generatedDiffs[0]?.id}
            onValueChange={setActiveDiffId}
          >
            <TabsList className="h-auto w-full justify-start overflow-x-auto border border-white/10 bg-black/30 p-1">
              {generatedDiffs.map((fileDiff) => (
                <TabsTrigger
                  key={fileDiff.id}
                  value={fileDiff.id}
                  className="min-h-9 shrink-0 rounded-lg data-active:bg-white/10 data-active:text-white"
                >
                  <span className="max-w-44 truncate font-mono">
                    {filenameFromPath(fileDiff.filePath)}
                  </span>
                  <Badge className={statusClassName[fileDiff.status]}>
                    {fileDiff.status}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {generatedDiffs.map((fileDiff) => (
              <TabsContent
                key={fileDiff.id}
                value={fileDiff.id}
                className="mt-4 space-y-3"
              >
                <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-medium text-slate-100">
                      {fileDiff.filePath}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {fileDiff.language}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={statusClassName[fileDiff.status]}>
                      {fileDiff.status}
                    </Badge>
                    <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                      +{fileDiff.additions}
                    </Badge>
                    <Badge className="border-rose-300/25 bg-rose-400/10 text-rose-100">
                      -{fileDiff.deletions}
                    </Badge>
                  </div>
                </div>
                <pre className="h-96 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-5 text-slate-300">
                  <code className="whitespace-pre">{fileDiff.diff}</code>
                </pre>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}
