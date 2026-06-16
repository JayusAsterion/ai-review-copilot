import {
  ArrowRight,
  BookOpen,
  Bug,
  CheckCircle2,
  ClipboardList,
  FileCode2,
  Lock,
  Server,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/auth/login-screen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const actionCards = [
  {
    title: "Start Code Review",
    description:
      "Paste a diff, generate one from files, add PR context, and produce review-ready Markdown.",
    href: "/review",
    icon: FileCode2,
    primary: true,
  },
  {
    title: "Generate Bug Report",
    description:
      "Turn QA notes, steps, expected results, and attachments into a developer-ready report.",
    href: "/bug-report",
    icon: Bug,
  },
  {
    title: "Create Test Cases",
    description:
      "Convert stories, bug reports, diffs, and QA notes into structured coverage.",
    href: "/test-cases",
    icon: ClipboardList,
  },
  {
    title: "Open User Guide",
    description:
      "Install Ollama, configure Docker, choose models, and learn the review workflow.",
    href: "/guide",
    icon: BookOpen,
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <LoginScreen />;
  }

  const selectedModel =
    process.env.NEXT_PUBLIC_DEFAULT_OLLAMA_MODEL ?? "qwen3-coder:30b";

  return (
    <AppShell
      title="Dashboard"
      description="AI-powered code review copilot for safer pull requests."
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div className="space-y-5">
              <Badge className="border-emerald-300/20 bg-emerald-400/10 text-emerald-100">
                <Lock className="size-3" />
                Valra
              </Badge>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Review code and QA findings without losing control of your
                  context.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  A focused workspace for PR diffs, static checks, local Ollama
                  analysis, bug reports, and Markdown output. Built for serious
                  review sessions, not AI theater.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  className="rounded-xl bg-brand-gradient font-semibold text-primary-foreground hover:brightness-105"
                >
                  <Link href="/review">
                    Start Code Review
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                >
                  <Link href="/guide">Read setup guide</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Local AI status
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Connection is tested from the review workspace.
                  </p>
                </div>
                <span className="size-2.5 rounded-full bg-amber-300" />
              </div>
              <div className="mt-4 grid gap-2">
                {[
                  ["Provider", "Local Ollama"],
                  ["Selected model", selectedModel],
                  ["Privacy", "Browser to local machine"],
                  ["Last review", "No saved history yet"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2"
                  >
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="truncate text-right font-mono text-xs text-slate-200">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {actionCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.href}
                href={card.href}
                className={[
                  "group rounded-2xl border p-4 transition duration-150 active:scale-[0.99]",
                  card.primary
                    ? "border-valra-green/25 bg-valra-green/10"
                    : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={[
                      "flex size-10 items-center justify-center rounded-xl ring-1",
                      card.primary
                        ? "bg-valra-green/15 text-valra-green ring-valra-green/25"
                        : "bg-white/[0.04] text-slate-200 ring-white/10",
                    ].join(" ")}
                  >
                    <Icon className="size-5" />
                  </div>
                  <ArrowRight className="size-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-slate-200" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          {[
            {
              title: "Static fallback",
              copy: "Run deterministic local heuristics when a model is unavailable.",
              icon: CheckCircle2,
            },
            {
              title: "Docker-ready Ollama",
              copy: "CPU and optional NVIDIA GPU compose files are documented.",
              icon: Server,
            },
            {
              title: "Markdown outputs",
              copy: "Copy or export review artifacts for PRs, QA tickets, and handoff.",
              icon: ClipboardList,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
              >
                <Icon className="size-4 text-valra-cyan" />
                <h3 className="mt-3 text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.copy}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
