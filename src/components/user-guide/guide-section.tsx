import { CheckCircle2, CircleDot } from "lucide-react";

import { GuideCodeBlock } from "@/components/user-guide/guide-code-block";
import { Badge } from "@/components/ui/badge";
import type { GuideBadge, UserGuideSection } from "@/data/user-guide";
import { cn } from "@/lib/utils";

const badgeStyles: Record<GuideBadge, string> = {
  Implemented: "border-valra-green/20 bg-valra-green/10 text-valra-green",
  Planned: "border-warning/20 bg-warning/10 text-warning",
  "Local-first": "border-valra-cyan/20 bg-valra-cyan/10 text-valra-cyan",
  Docker: "border-valra-cyan/20 bg-valra-cyan/10 text-valra-cyan",
  "GPU Optional": "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100",
  Required: "border-danger/20 bg-danger/10 text-danger",
  Recommended: "border-valra-green/20 bg-valra-green/10 text-valra-green",
  Optional: "border-border bg-muted text-muted-foreground",
  "Coming soon": "border-warning/20 bg-warning/10 text-warning",
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
        "scroll-mt-6 rounded-2xl border border-border bg-panel text-card-foreground",
        nested
          ? "rounded-2xl bg-panel-muted p-4 shadow-none sm:p-5"
          : "p-5 sm:p-6"
      )}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h2
              className={cn(
                "font-semibold tracking-tight text-foreground",
                nested ? "text-lg" : "text-2xl"
              )}
            >
              {section.title}
            </h2>
            {section.description ? (
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
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
          <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
            {section.items.map((item) => (
              <li key={item} className="flex gap-2">
                <CircleDot className="mt-1.5 size-3.5 shrink-0 text-valra-cyan" />
                <span className="[&_code]:font-mono [&_code]:text-valra-cyan">
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
