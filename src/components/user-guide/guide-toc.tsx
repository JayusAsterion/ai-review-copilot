import { BookOpen } from "lucide-react";

import type { UserGuideSection } from "@/data/user-guide";
import { cn } from "@/lib/utils";

type GuideTocProps = {
  sections: UserGuideSection[];
};

export function GuideToc({ sections }: GuideTocProps) {
  const links = sections.flatMap((section) => [
    { id: section.id, title: section.title, nested: false },
    ...(section.subsections?.map((subsection) => ({
      id: subsection.id,
      title: subsection.title,
      nested: true,
    })) ?? []),
  ]);

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <div className="mb-3 flex items-center gap-2 px-2 pt-1 text-sm font-semibold text-white">
          <BookOpen className="size-4 text-cyan-200" />
          Contents
        </div>
        <nav
          aria-label="User guide table of contents"
          className="flex gap-2 overflow-x-auto pb-1 lg:block lg:max-h-[calc(100vh-8rem)] lg:space-y-1 lg:overflow-y-auto lg:pb-0"
        >
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={cn(
                "block shrink-0 rounded-2xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white",
                link.nested && "lg:ml-3 lg:text-xs lg:text-slate-400"
              )}
            >
              {link.title}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
