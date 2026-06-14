"use client";

import { FileText, ImageIcon, Trash2, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils/file";
import type { BugReportAttachment } from "@/types/review";

type BugAttachmentUploaderProps = {
  attachments: BugReportAttachment[];
  onAttachmentsChange: (attachments: BugReportAttachment[]) => void;
};

const acceptedAttachments = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "text/plain": [".txt", ".log"],
};

function createAttachmentId(file: File): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${file.name}-${file.size}-${file.lastModified}`;
}

function isPreviewableImage(type: string): boolean {
  return type.startsWith("image/");
}

function revokePreview(url?: string) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function BugAttachmentUploader({
  attachments,
  onAttachmentsChange,
}: BugAttachmentUploaderProps) {
  const latestAttachments = useRef(attachments);

  useEffect(() => {
    latestAttachments.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      latestAttachments.current.forEach((attachment) =>
        revokePreview(attachment.previewUrl)
      );
    };
  }, []);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const nextAttachments = accepted.map((file) => ({
        id: createAttachmentId(file),
        name: file.name,
        type: file.type || "text/plain",
        size: file.size,
        previewUrl: isPreviewableImage(file.type)
          ? URL.createObjectURL(file)
          : undefined,
      }));

      onAttachmentsChange([...attachments, ...nextAttachments]);
      toast.success(
        `${nextAttachments.length} attachment${
          nextAttachments.length === 1 ? "" : "s"
        } added`
      );
    },
    [attachments, onAttachmentsChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: acceptedAttachments,
      multiple: true,
      onDropRejected: () => {
        toast.error("Only image, .txt, and .log attachments are supported.");
      },
    });

  const removeAttachment = (id: string) => {
    const attachment = attachments.find((item) => item.id === id);
    revokePreview(attachment?.previewUrl);
    onAttachmentsChange(attachments.filter((item) => item.id !== id));
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
          {isDragActive
            ? "Drop screenshots or logs"
            : "Drop screenshots/logs or click to upload"}
        </p>
        <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
          Supports PNG, JPG, WEBP, GIF, TXT, and LOG. Image binaries are not sent
          to Ollama in this MVP.
        </p>
      </div>

      {fileRejections.length > 0 ? (
        <p className="text-xs text-destructive">
          {fileRejections.length} unsupported attachment
          {fileRejections.length === 1 ? "" : "s"} skipped.
        </p>
      ) : null}

      {attachments.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {attachments.map((attachment) => {
            const isImage = isPreviewableImage(attachment.type);

            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2"
              >
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06]">
                  {isImage && attachment.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={attachment.previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : isImage ? (
                    <ImageIcon className="size-5 text-cyan-200" />
                  ) : (
                    <FileText className="size-5 text-cyan-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">
                    {attachment.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge className="bg-white/[0.06] text-slate-300">
                      {attachment.type || "file"}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {formatFileSize(attachment.size)}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${attachment.name}`}
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
