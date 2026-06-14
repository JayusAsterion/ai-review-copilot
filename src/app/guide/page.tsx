import type { Metadata } from "next";

import { GuideLayout } from "@/components/user-guide/guide-layout";
import { userGuideSections } from "@/data/user-guide";

export const metadata: Metadata = {
  title: "User Guide",
  description:
    "Learn how to install, configure, and use AI Review Copilot with local Ollama, static analysis, code reviews, and bug reports.",
};

export default function GuidePage() {
  return <GuideLayout sections={userGuideSections} />;
}
