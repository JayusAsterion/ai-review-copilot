import {
  Bot,
  Bug,
  CheckCircle2,
  ClipboardList,
  FileText,
  GitPullRequest,
  Server,
} from "lucide-react";

import { GuideSection } from "@/components/user-guide/guide-section";
import { GuideToc } from "@/components/user-guide/guide-toc";
import { Badge } from "@/components/ui/badge";
import type { UserGuideSection } from "@/data/user-guide";

type GuideLayoutProps = {
  sections: UserGuideSection[];
};

const quickStarts = [
  {
    title: "Local Ollama setup",
    description: "Install Ollama, pull a model, and verify `/api/tags`.",
    icon: Server,
  },
  {
    title: "Code Review in 5 steps",
    description:
      "Open `/review`, choose a provider, add context, load a diff, analyze.",
    icon: GitPullRequest,
  },
  {
    title: "Bug Report in 5 steps",
    description:
      "Open `/bug-report`, add QA details, include notes or attachments, generate Markdown.",
    icon: Bug,
  },
  {
    title: "Test Cases in 5 steps",
    description:
      "Open `/test-cases`, paste context, tune coverage, generate QA scenarios.",
    icon: ClipboardList,
  },
];

export function GuideLayout({ sections }: GuideLayoutProps) {
  return (
    <div className="space-y-8">
      <header className="space-y-6">
        <div className="space-y-4">
          <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
            <FileText className="size-3" />
            Documentation
          </Badge>
          <div className="max-w-4xl space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              User Guide
            </h2>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              Learn how to install, configure, and use Valra with local Ollama,
              static analysis, code reviews, and bug reports.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickStarts.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-100 ring-1 ring-cyan-300/20">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "Implemented",
            "Planned",
            "Local-first",
            "Docker",
            "GPU Optional",
            "Recommended",
          ].map((badge) => (
            <Badge
              key={badge}
              className="border-white/10 bg-white/[0.04] text-slate-200"
            >
              {badge === "Implemented" ? (
                <CheckCircle2 className="size-3" />
              ) : null}
              {badge}
            </Badge>
          ))}
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
  );
}
