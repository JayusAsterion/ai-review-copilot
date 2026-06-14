"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type GuideCodeBlockProps = {
  title?: string;
  language: string;
  code: string;
};

export function GuideCodeBlock({ title, language, code }: GuideCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy code");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#05070d] shadow-inner shadow-black/40">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.035] px-3 py-2">
        <div className="min-w-0">
          {title ? (
            <p className="truncate text-xs font-medium text-slate-200">
              {title}
            </p>
          ) : null}
          <p className="font-mono text-[0.68rem] uppercase tracking-wide text-slate-500">
            {language}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:text-white"
          onClick={copyCode}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="max-h-72 overflow-auto p-4 text-xs leading-6 text-slate-200 sm:text-sm">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
