import type { BugReportInput } from "@/types/review";

export const sampleBugReport: BugReportInput = {
  application: "CIVIX",
  environment: "QA",
  module: "System Tables > Office",
  userRole: "Admin",
  reproductionRate: "always",
  browser: "Chrome",
  device: "Desktop",
  stepsToReproduce: [
    "Log in.",
    "Navigate to System Tables.",
    "Open Office.",
    "Click Add Office.",
    "Save a new Office record.",
    "Verify the record in the grid.",
  ].join("\n"),
  actualResult:
    "An expandable arrow appears indicating child records, even though there are no child records.",
  expectedResult:
    "The arrow should not appear until child records such as Jurisdiction or District exist.",
  additionalContext:
    "The row also shows pointer behavior even when there is nothing to expand.",
  screenshotNotes:
    "The Office grid row displays an expand arrow and hover pointer state immediately after saving the Office record.",
  roughNotes:
    "After adding an Office record in CIVIX QA, the grid shows an expand arrow even though no Jurisdiction or District child records exist yet.",
};
