"use client";

import { ArrowRight, LockKeyhole, MonitorCog, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function LoginScreen() {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    await signIn("azure-ad", { callbackUrl: "/" });
    setIsSigningIn(false);
  };

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,var(--ambient-cyan),transparent_28%),radial-gradient(circle_at_84%_12%,var(--ambient-green),transparent_26%),linear-gradient(180deg,transparent,var(--background)_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--foreground)_4%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_4%,transparent)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      </div>

      <section className="mx-auto flex min-h-[100dvh] w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <div>
                <p className="text-xs text-subtle-foreground">
                  Private review workspace
                </p>
              </div>
            </div>

            <Badge className="w-fit border-valra-green/25 bg-valra-green/10 text-valra-green">
              <ShieldCheck className="size-3" />
              Microsoft Entra sign-in
            </Badge>

            <div className="space-y-3">
              <h1 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Valra
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                AI-powered code review copilot for safer pull requests.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="h-10 rounded-xl bg-brand-gradient px-4 font-semibold text-primary-foreground shadow-[0_0_0_1px_rgba(39,245,165,0.15)] hover:brightness-105"
              >
                {isSigningIn ? "Redirecting..." : "Sign in with Microsoft"}
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Local Ollama analysis still runs on your machine.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-panel p-4 shadow-sm">
            <div className="rounded-xl border border-border bg-panel-muted p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <LockKeyhole className="size-4 text-valra-green" />
                Access controlled
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Microsoft Entra handles identity. Code review, bug report, and
                test case workflows stay focused after sign-in.
              </p>
            </div>
            <div className="mt-3 rounded-xl border border-border bg-panel-muted p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MonitorCog className="size-4 text-valra-cyan" />
                Local-first runtime
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Ollama requests continue to run browser-to-localhost when you
                select Local Ollama.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
