"use client";

import {
  BookOpen,
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

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
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
    <main className="min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,var(--ambient-cyan),transparent_28%),radial-gradient(circle_at_84%_12%,var(--ambient-green),transparent_26%),linear-gradient(180deg,transparent,var(--background)_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--foreground)_4%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_4%,transparent)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      </div>

      <div className="flex min-h-[100dvh]">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-background-secondary/95 px-4 py-4 lg:block">
          <SidebarContent pathname={pathname} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background/88 backdrop-blur-xl">
            <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="border-border bg-surface/80 text-foreground/80 hover:bg-surface-elevated hover:text-foreground lg:hidden"
                      aria-label="Open navigation"
                    >
                      <Menu />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-80 border-border bg-background-secondary p-0 text-foreground"
                  >
                    <SheetHeader className="sr-only">
                      <SheetTitle>Navigation</SheetTitle>
                      <SheetDescription>
                        Main Valra modules
                      </SheetDescription>
                    </SheetHeader>
                    <SidebarContent pathname={pathname} />
                  </SheetContent>
                </Sheet>

                <div className="min-w-0">
                  <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {title}
                  </h1>
                  {description ? (
                    <p className="hidden max-w-2xl truncate text-xs text-muted-foreground md:block">
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="hidden border-valra-green/25 bg-valra-green/10 text-valra-green sm:inline-flex">
                  <CheckCircle2 className="size-3" />
                  Local-first
                </Badge>
                <div className="hidden rounded-xl border border-border bg-surface/80 px-3 py-2 text-xs text-muted-foreground xl:block">
                  <span className="text-subtle-foreground">Model</span>{" "}
                  <span className="font-mono text-foreground">
                    {selectedModel}
                  </span>
                </div>
                <div className="hidden items-center gap-2 rounded-xl border border-border bg-surface/80 px-3 py-2 text-xs text-muted-foreground md:flex">
                  <span className="size-2 rounded-full bg-amber-300" />
                  Ollama not tested
                </div>
                <ThemeToggle />
                <UserMenu />
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
      <Link
        href="/"
        prefetch
        className="group flex items-center gap-3 rounded-2xl px-2 py-2"
      >
        <Logo size="md" />
        <div className="min-w-0">
          <p className="truncate text-xs text-subtle-foreground">
            Safer pull requests
          </p>
        </div>
      </Link>

      <Separator className="my-4 bg-border" />

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
              prefetch
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-150 active:scale-[0.99]",
                isActive
                  ? "bg-surface-elevated text-foreground ring-1 ring-valra-green/15"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-border bg-surface/75 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ShieldCheck className="size-4 text-valra-green" />
          Browser to Ollama
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Local AI requests stay between this browser and your machine when
          Ollama is selected.
        </p>
      </div>
    </div>
  );
}
