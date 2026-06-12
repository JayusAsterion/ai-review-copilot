"use client";

import { useMemo, useRef } from "react";
import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type LineNumberedTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> & {
  className?: string;
};

export function LineNumberedTextarea({
  className,
  value,
  placeholder,
  onScroll,
  ...props
}: LineNumberedTextareaProps) {
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => {
    const text =
      typeof value === "string" && value.length > 0
        ? value
        : typeof placeholder === "string"
          ? placeholder
          : "";
    const count = Math.max(text.split("\n").length, 12);

    return Array.from({ length: count }, (_, index) => index + 1);
  }, [placeholder, value]);

  return (
    <div className="grid min-h-72 grid-cols-[3.25rem_minmax(0,1fr)] overflow-hidden rounded-xl border border-white/10 bg-[#060a12]/80 shadow-inner shadow-black/40 ring-1 ring-white/[0.03]">
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="overflow-hidden border-r border-white/10 bg-white/[0.03] px-3 py-3 text-right font-mono text-xs leading-6 text-slate-500"
      >
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      <textarea
        value={value}
        placeholder={placeholder}
        onScroll={(event) => {
          if (gutterRef.current) {
            gutterRef.current.scrollTop = event.currentTarget.scrollTop;
          }
          onScroll?.(event);
        }}
        spellCheck={false}
        className={cn(
          "min-h-72 w-full resize-y border-0 bg-transparent px-4 py-3 font-mono text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus-visible:ring-0",
          className
        )}
        {...props}
      />
    </div>
  );
}
