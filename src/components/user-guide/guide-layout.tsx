import {
  ArrowLeft,
  Bot,
  Bug,
  CheckCircle2,
  FileText,
  GitPullRequest,
  Server,
} from "lucide-react";
import Link from "next/link";

import { GuideSection } from "@/components/user-guide/guide-section";
import { GuideToc } from "@/components/user-guide/guide-toc";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserGuideSection } from "@/data/user-guide";

type GuideLayoutProps = {
  sections: UserGuideSection[];
};

const quickStarts = [
  {
    title: "Local Ollama setup",
    description: "Start Docker, pull a model, and verify `/api/tags`.",
    icon: Server,
  },
  {
    title: "Code Review in 5 steps",
    description: "Open `/review`, choose a provider, add context, load a diff, analyze.",
    icon: GitPullRequest,
  },
  {
    title: "Bug Report in 5 steps",
    description: "Pick Bug Report, add QA details, include notes or attachments, generate Markdown.",
    icon: Bug,
  },
];

export function GuideLayout({ sections }: GuideLayoutProps) {
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
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                AI Review Copilot
              </p>
              <p className="hidden text-xs text-slate-400 sm:block">
                Local-first documentation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08] hover:text-white"
            >
              <Link href="/review">
                <ArrowLeft className="size-3.5" />
                Review
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </nav>

        <header className="mb-8 space-y-6">
          <div className="space-y-4">
            <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <FileText className="size-3" />
              Documentation
            </Badge>
            <div className="max-w-4xl space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                User Guide
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                Learn how to install, configure, and use AI Review Copilot with
                local Ollama, static analysis, code reviews, and bug reports.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {quickStarts.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-100 ring-1 ring-cyan-300/20">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {["Implemented", "Planned", "Local-first", "Docker", "GPU Optional"].map(
              (badge) => (
                <Badge
                  key={badge}
                  className="border-white/10 bg-white/[0.04] text-slate-200"
                >
                  {badge === "Implemented" ? (
                    <CheckCircle2 className="size-3" />
                  ) : null}
                  {badge}
                </Badge>
              )
            )}
            <Badge className="border-emerald-300/20 bg-emerald-400/10 text-emerald-100">
              <Bot className="size-3" />
              Browser to Ollama
            </Badge>
          </div>
        </header>

        <div className="grid flex-1 gap-6 pb-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <GuideToc sections={sections} />
          <div className="space-y-8">
            {sections.map((section) => (
              <GuideSection key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
