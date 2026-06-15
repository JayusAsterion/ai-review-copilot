import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { TestCasesWorkspace } from "@/components/test-cases/test-cases-workspace";

export const metadata: Metadata = {
  title: "Test Cases",
};

export default function TestCasesPage() {
  return (
    <AppShell
      title="Test Cases"
      description="Generate structured QA scenarios from requirements, bugs, diffs, or feature notes."
    >
      <TestCasesWorkspace />
    </AppShell>
  );
}
