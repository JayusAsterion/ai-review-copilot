import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { Toaster } from "sonner";
import { AuthGate } from "@/components/auth/auth-gate";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Valra",
  description: "AI-powered code review copilot for safer pull requests.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/valra-app-icon-dark.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <TooltipProvider>
            <AuthGate>{children}</AuthGate>
          </TooltipProvider>
          <Toaster richColors closeButton theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
