import type { Metadata } from "next";
import { ArrowRight, ClipboardList, FileCode2, Lock } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Test Cases",
};

export default function TestCasesPage() {
  return (
    <AppShell
      title="Test Cases"
      description="Planned workflow for acceptance, regression, and edge-case generation."
    >
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex max-w-3xl flex-col gap-5">
          <Badge className="w-fit border-amber-300/20 bg-amber-400/10 text-amber-100">
            Planned module
          </Badge>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Test case generation is planned.
            </h2>
            <p className="text-sm leading-6 text-slate-300">
              This module will turn PR context, bug reports, and acceptance
              notes into structured QA coverage. For now, code review results
              already include suggested test cases you can copy into your
              workflow.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Acceptance paths",
                copy: "Happy path and expected behavior coverage.",
                icon: ClipboardList,
              },
              {
                title: "Regression checks",
                copy: "Focused checks based on changed files.",
                icon: FileCode2,
              },
              {
                title: "Private by default",
                copy: "Designed for local-first model execution.",
                icon: Lock,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <Icon className="size-4 text-cyan-200" />
                  <h3 className="mt-3 text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {item.copy}
                  </p>
                </div>
              );
            })}
          </div>
          <Button
            asChild
            className="w-fit rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
          >
            <Link href="/review">
              Run a code review
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
