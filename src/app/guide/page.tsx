import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { GuideLayout } from "@/components/user-guide/guide-layout";
import { userGuideSections } from "@/data/user-guide";

export const metadata: Metadata = {
  title: "User Guide",
  description:
    "Learn how to install, configure, and use Valra with local Ollama, static analysis, code reviews, bug reports, and test cases.",
};

export default function GuidePage() {
  return (
    <AppShell
      title="User Guide"
      description="Install, configure, and operate the local-first review workflow."
    >
      <GuideLayout sections={userGuideSections} />
    </AppShell>
  );
}
