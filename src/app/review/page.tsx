import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { ReviewWorkspace } from "@/components/review-workspace";

export const metadata: Metadata = {
  title: "Code Review",
  description:
    "Review PR diffs, files, and QA context using local-first AI.",
};

export default function ReviewPage() {
  return (
    <AppShell
      title="Code Review"
      description="Paste or generate a diff, add context, and produce structured review findings."
    >
      <ReviewWorkspace initialMode="code-review" />
    </AppShell>
  );
}
