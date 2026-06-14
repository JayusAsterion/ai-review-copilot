import { CheckCircle2, CircleDot } from "lucide-react";

import { GuideCodeBlock } from "@/components/user-guide/guide-code-block";
import { Badge } from "@/components/ui/badge";
import type { GuideBadge, UserGuideSection } from "@/data/user-guide";
import { cn } from "@/lib/utils";

const badgeStyles: Record<GuideBadge, string> = {
  Implemented: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  Planned: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  "Local-first": "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
  Docker: "border-sky-300/20 bg-sky-400/10 text-sky-100",
  "GPU Optional": "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100",
};

type GuideSectionProps = {
  section: UserGuideSection;
  nested?: boolean;
};

export function GuideSection({ section, nested = false }: GuideSectionProps) {
  return (
    <section
      id={section.id}
      className={cn(
        "scroll-mt-6 rounded-2xl border border-white/10 bg-white/[0.04] text-card-foreground",
        nested
          ? "rounded-2xl bg-black/20 p-4 shadow-none sm:p-5"
          : "p-5 sm:p-6"
      )}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h2
              className={cn(
                "font-semibold tracking-tight text-white",
                nested ? "text-lg" : "text-2xl"
              )}
            >
              {section.title}
            </h2>
            {section.description ? (
              <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                {section.description}
              </p>
            ) : null}
          </div>
          {section.badges?.length ? (
            <div className="flex shrink-0 flex-wrap gap-2">
              {section.badges.map((badge) => (
                <Badge key={badge} className={badgeStyles[badge]}>
                  {badge === "Implemented" ? (
                    <CheckCircle2 className="size-3" />
                  ) : null}
                  {badge}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        {section.items?.length ? (
          <ul className="grid gap-2 text-sm leading-6 text-slate-300">
            {section.items.map((item) => (
              <li key={item} className="flex gap-2">
                <CircleDot className="mt-1.5 size-3.5 shrink-0 text-cyan-200" />
                <span className="[&_code]:font-mono [&_code]:text-cyan-100">
                  {formatInlineCode(item)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {section.codeBlocks?.length ? (
          <div className="space-y-3">
            {section.codeBlocks.map((codeBlock) => (
              <GuideCodeBlock
                key={`${codeBlock.title ?? codeBlock.language}-${codeBlock.code}`}
                title={codeBlock.title}
                language={codeBlock.language}
                code={codeBlock.code}
              />
            ))}
          </div>
        ) : null}

        {section.subsections?.length ? (
          <div className="space-y-4 pt-1">
            {section.subsections.map((subsection) => (
              <GuideSection
                key={subsection.id}
                section={subsection}
                nested
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function formatInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }

    return part;
  });
}
