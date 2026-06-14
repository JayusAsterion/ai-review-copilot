import type { Metadata } from "next";
import { Bot, CheckCircle2, GitPullRequest, Sparkles } from "lucide-react";

import { ReviewWorkspace } from "@/components/review-workspace";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Code Review Copilot",
  description:
    "Review PR diffs, files, and QA context using local-first AI.",
};

export default function ReviewPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070a12] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(129,140,248,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.12),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/25">
              <Bot className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                AI Review Copilot
              </p>
              <p className="hidden text-xs text-slate-400 sm:block">
                Local-first code review workspace
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="hidden border-emerald-300/20 bg-emerald-400/10 text-emerald-200 sm:inline-flex">
              <CheckCircle2 />
              Browser to Ollama
            </Badge>
            <ThemeToggle />
          </div>
        </nav>

        <header className="mb-8 space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100 shadow-lg shadow-cyan-950/20">
              <Sparkles className="size-3.5" />
              Local-first AI review workflow
            </div>
            <div className="max-w-4xl space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Code Review Copilot
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Review PR diffs, files, and QA context with a polished local
                Ollama workflow built for fast developer iteration.
              </p>
            </div>
          </div>
          <div className="grid max-w-3xl grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-xl sm:grid-cols-3">
            {[
              ["Modes", "4"],
              ["Provider", "Local"],
              ["Output", "Markdown"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-3"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-100">
                  {label === "Modes" ? <GitPullRequest className="size-3.5" /> : null}
                  {value}
                </p>
              </div>
            ))}
          </div>
        </header>

        <ReviewWorkspace />
      </div>
    </main>
  );
}
