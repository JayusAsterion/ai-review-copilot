export type ReviewProvider = "ollama" | "static" | "cloud";

export type ReviewMode =
  | "code-review"
  | "bug-report"
  | "pr-comment"
  | "test-cases";

export type UploadedReviewFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  language: string;
  content: string;
};

export type ReviewFileVersion = "old" | "new";

export type ReviewSourceFile = {
  id: string;
  name: string;
  path: string;
  language: string;
  size: number;
  content: string;
  version: ReviewFileVersion;
};

export type GeneratedFileDiff = {
  id: string;
  filePath: string;
  language: string;
  oldFile?: ReviewSourceFile;
  newFile?: ReviewSourceFile;
  status: "modified" | "added" | "deleted" | "unmatched";
  diff: string;
  additions: number;
  deletions: number;
};

export type ReviewInput = {
  mode: ReviewMode;
  provider: ReviewProvider;
  context: string;
  diff: string;
  files: UploadedReviewFile[];
};

export type ReviewFinding = {
  title: string;
  severity: "info" | "low" | "medium" | "high";
  type: string;
  file: string | null;
  line: number | null;
  description: string;
  suggestedFix: string;
};

export type ReviewResult = {
  summary: string;
  riskLevel: "low" | "medium" | "high";
  findings: ReviewFinding[];
  testCases: string[];
  prComment: string;
};

export type OllamaModel = {
  name: string;
  model?: string;
  modified_at?: string;
  size?: number;
  digest?: string;
  details?: {
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
};

export type OllamaSettings = {
  baseUrl: string;
  model: string;
};

export type BugSeverity = "low" | "medium" | "high" | "critical";

export type BugPriority = "low" | "medium" | "high" | "urgent";

export type ReproductionRate = "always" | "sometimes" | "rarely" | "unknown";

export type BugReportAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
};

export type BugReportInput = {
  application?: string;
  module?: string;
  environment?: string;
  url?: string;
  userRole?: string;
  browser?: string;
  device?: string;
  buildVersion?: string;
  reproductionRate?: ReproductionRate;
  roughNotes?: string;
  stepsToReproduce?: string;
  actualResult?: string;
  expectedResult?: string;
  additionalContext?: string;
  screenshotNotes?: string;
  attachments?: BugReportAttachment[];
};

export type BugReportResult = {
  title: string;
  summary: string;
  severity: BugSeverity;
  priority: BugPriority;
  reproductionRate: ReproductionRate;
  environment?: string;
  module?: string;
  stepsToReproduce: string[];
  actualResult: string;
  expectedResult: string;
  additionalObservations: string[];
  missingInformation: string[];
  suggestedTestCases: string[];
  developerComment: string;
  markdown: string;
};
