import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { ReviewWorkspace } from "@/components/review-workspace";

export const metadata: Metadata = {
  title: "Bug Report",
  description:
    "Generate developer-ready bug reports from QA notes and local-first AI.",
};

export default function BugReportPage() {
  return (
    <AppShell
      title="Bug Report"
      description="Turn QA observations, reproduction steps, and attachments into a structured bug report."
    >
      <ReviewWorkspace initialMode="bug-report" />
    </AppShell>
  );
}
