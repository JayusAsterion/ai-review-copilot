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
    <div className="overflow-hidden rounded-2xl border border-code bg-code-surface shadow-inner">
      <div className="flex items-center justify-between gap-3 border-b border-code bg-panel-muted px-3 py-2">
        <div className="min-w-0">
          {title ? (
            <p className="truncate text-xs font-medium text-foreground">
              {title}
            </p>
          ) : null}
          <p className="font-mono text-[0.68rem] uppercase tracking-wide text-muted-foreground">
            {language}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-border bg-panel text-foreground hover:bg-panel-raised"
          onClick={copyCode}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="max-h-72 overflow-auto p-4 text-xs leading-6 text-foreground sm:text-sm">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
