"use client";

import { ArrowRight, Bot, LockKeyhole, MonitorCog, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LoginScreen() {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    await signIn("azure-ad", { callbackUrl: "/" });
    setIsSigningIn(false);
  };

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#070a12] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_84%_12%,rgba(16,185,129,0.1),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0),#070a12_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      </div>

      <section className="mx-auto flex min-h-[100dvh] w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100 ring-1 ring-cyan-300/20">
                <Bot className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Valra
                </p>
                <p className="text-xs text-slate-500">
                  Private review workspace
                </p>
              </div>
            </div>

            <Badge className="w-fit border-emerald-300/20 bg-emerald-400/10 text-emerald-100">
              <ShieldCheck className="size-3" />
              Microsoft Entra sign-in
            </Badge>

            <div className="space-y-3">
              <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Valra
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-300">
                AI-powered code review copilot for safer pull requests.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="h-10 rounded-xl bg-cyan-300 px-4 text-slate-950 hover:bg-cyan-200"
              >
                {isSigningIn ? "Redirecting..." : "Sign in with Microsoft"}
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <p className="max-w-xl text-sm leading-6 text-slate-400">
              Local Ollama analysis still runs on your machine.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <LockKeyhole className="size-4 text-emerald-200" />
                Access controlled
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Microsoft Entra handles identity. Code review, bug report, and
                test case workflows stay focused after sign-in.
              </p>
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <MonitorCog className="size-4 text-cyan-200" />
                Local-first runtime
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
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
