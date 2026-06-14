import type { Metadata } from "next";
import { Database, KeyRound, Server, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="Provider defaults, privacy boundaries, and planned workspace settings."
    >
      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                Local defaults
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Settings are intentionally minimal in the MVP.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-400">
                Provider configuration currently happens in the review
                workspace so model connection state stays close to the action.
                Future settings can add workspace defaults without changing the
                local-first privacy model.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Ollama base URL",
              value: "http://localhost:11434",
              icon: Server,
            },
            {
              title: "Default model",
              value:
                process.env.NEXT_PUBLIC_DEFAULT_OLLAMA_MODEL ??
                "qwen3-coder:30b",
              icon: ShieldCheck,
            },
            {
              title: "Cloud providers",
              value: "Planned",
              icon: KeyRound,
            },
            {
              title: "Review history",
              value: "Planned",
              icon: Database,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
              >
                <Icon className="size-4 text-cyan-200" />
                <p className="mt-3 text-xs text-slate-500">{item.title}</p>
                <p className="mt-1 truncate font-mono text-sm font-medium text-slate-100">
                  {item.value}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
