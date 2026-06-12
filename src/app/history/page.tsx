import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review History",
};

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Review History</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review history will appear here after persistence is added.
        </p>
      </div>
    </main>
  );
}
