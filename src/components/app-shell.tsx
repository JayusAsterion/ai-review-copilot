"use client";

import {
  BookOpen,
  Bot,
  Bug,
  CheckCircle2,
  ClipboardList,
  FileCode2,
  Home,
  Menu,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AppShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/review", label: "Code Review", icon: FileCode2 },
  { href: "/bug-report", label: "Bug Report", icon: Bug },
  { href: "/test-cases", label: "Test Cases", icon: ClipboardList },
  { href: "/guide", label: "User Guide", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ title, description, children }: AppShellProps) {
  const pathname = usePathname();
  const selectedModel =
    process.env.NEXT_PUBLIC_DEFAULT_OLLAMA_MODEL ?? "qwen3-coder:30b";

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#070a12] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_84%_12%,rgba(16,185,129,0.1),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0),#070a12_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      </div>

      <div className="flex min-h-[100dvh]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#080b13]/92 px-4 py-4 lg:block">
          <SidebarContent pathname={pathname} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070a12]/86 backdrop-blur-xl">
            <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08] hover:text-white lg:hidden"
                      aria-label="Open navigation"
                    >
                      <Menu />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-80 border-white/10 bg-[#080b13] p-0 text-white"
                  >
                    <SheetHeader className="sr-only">
                      <SheetTitle>Navigation</SheetTitle>
                      <SheetDescription>
                        Main AI Review Copilot modules
                      </SheetDescription>
                    </SheetHeader>
                    <SidebarContent pathname={pathname} />
                  </SheetContent>
                </Sheet>

                <div className="min-w-0">
                  <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                    {title}
                  </h1>
                  {description ? (
                    <p className="hidden max-w-2xl truncate text-xs text-slate-400 md:block">
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="hidden border-emerald-300/20 bg-emerald-400/10 text-emerald-100 sm:inline-flex">
                  <CheckCircle2 className="size-3" />
                  Local-first
                </Badge>
                <div className="hidden rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 xl:block">
                  <span className="text-slate-500">Model</span>{" "}
                  <span className="font-mono text-slate-100">
                    {selectedModel}
                  </span>
                </div>
                <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 md:flex">
                  <span className="size-2 rounded-full bg-amber-300" />
                  Ollama not tested
                </div>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full min-h-[100dvh] flex-col p-4 lg:min-h-0 lg:p-0">
      <Link href="/" className="group flex items-center gap-3 rounded-2xl px-2 py-2">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100 ring-1 ring-cyan-300/20 transition-transform duration-150 group-active:scale-[0.98]">
          <Bot className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            AI Review Copilot
          </p>
          <p className="truncate text-xs text-slate-500">
            Private review workspace
          </p>
        </div>
      </Link>

      <Separator className="my-4 bg-white/10" />

      <nav aria-label="Primary navigation" className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-150 active:scale-[0.99]",
                isActive
                  ? "bg-white/[0.08] text-white ring-1 ring-white/10"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <ShieldCheck className="size-4 text-emerald-200" />
          Browser to Ollama
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Local AI requests stay between this browser and your machine when
          Ollama is selected.
        </p>
      </div>
    </div>
  );
}
