"use client";

import { FileText, Trash2, UploadCloud } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFileSize, guessLanguageFromFilename } from "@/lib/utils/file";
import { cn } from "@/lib/utils";
import type { UploadedReviewFile } from "@/types/review";

type ReviewFileUploaderProps = {
  files: UploadedReviewFile[];
  onFilesChange: (files: UploadedReviewFile[]) => void;
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

function createFileId(file: File): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function ReviewFileUploader({
  files,
  onFilesChange,
}: ReviewFileUploaderProps) {
  const onDrop = useCallback(
    async (accepted: File[]) => {
      try {
        const uploaded = await Promise.all(
          accepted.map(async (file) => ({
            id: createFileId(file),
            name: file.name,
            size: file.size,
            type: file.type || "text/plain",
            language: guessLanguageFromFilename(file.name),
            content: await file.text(),
          }))
        );

        onFilesChange([...files, ...uploaded]);
        toast.success(
          `${uploaded.length} file${uploaded.length === 1 ? "" : "s"} added`
        );
      } catch {
        toast.error("Could not read one or more files as text.");
      }
    },
    [files, onFilesChange]
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
      <div
        {...getRootProps()}
        className={cn(
          "flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 py-7 text-center transition-[border-color,background-color,transform]",
          "hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.05]",
          isDragActive && "border-cyan-300/50 bg-cyan-300/10"
        )}
      >
        <input {...getInputProps()} />
        <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
          <UploadCloud className="size-5" />
        </div>
        <p className="text-sm font-medium text-slate-100">
          {isDragActive ? "Drop files to attach them" : "Drop files or click to upload"}
        </p>
        <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
          Supports TypeScript, JavaScript, JSON, Markdown, CSS, HTML, and text files.
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
                <FileText className="size-4 text-cyan-200" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">
                  {file.name}
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
