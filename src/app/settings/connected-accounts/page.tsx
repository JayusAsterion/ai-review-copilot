import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { ConnectedAccountsSettings } from "@/components/settings/connected-accounts-settings";

export const metadata: Metadata = {
  title: "Connected Accounts",
};

export default function ConnectedAccountsPage() {
  return (
    <AppShell
      title="Connected Accounts"
      description="Review external account status without exposing provider tokens."
    >
      <ConnectedAccountsSettings />
    </AppShell>
  );
}
