export type ReviewProvider = "ollama" | "static" | "cloud";

export type AiModule = "code-review" | "bug-report" | "test-cases";

export type ReviewMode = AiModule;

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
  severity: "info" | "low" | "medium" | "high" | "critical";
  confidence?: "high" | "medium" | "low";
  classification?:
    | "confirmed issue"
    | "potential issue"
    | "needs verification"
    | "recommendation";
  type: string;
  file: string | null;
  line: number | null;
  evidence?: string;
  description: string;
  failurePath?: string;
  actualImpact?: string;
  whyThisMatters?: string;
  suggestedFix: string;
  falsePositiveCheck?: ReviewFalsePositiveCheck | string;
  selfContradictionCheck?: ReviewSelfContradictionCheck | string;
};

export type ReviewFalsePositiveCheck = {
  existingHandlingFound: "yes" | "no";
  existingHandling: string;
  remainingIssue: string;
};

export type ReviewSelfContradictionCheck = {
  titleMatchesEvidence: "yes" | "no";
  failurePathSupportedByEvidence: "yes" | "no";
  suggestedFixMatchesIssue: "yes" | "no";
};

export type ReviewResult = {
  summary: string;
  riskLevel: "low" | "low-medium" | "medium" | "high";
  findings: ReviewFinding[];
  needsVerification?: string[];
  likelyFalsePositives?: string[];
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

export type OllamaModelPreset = {
  module: AiModule;
  label: string;
  recommendedModel: string;
  fallbackModel: string;
  description: string;
};

export type OllamaModuleModels = Record<AiModule, string>;

export type OllamaLocalSettings = {
  baseUrl: string;
  moduleModels: OllamaModuleModels;
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

export type TestCasePriority = "low" | "medium" | "high" | "critical";

export type TestCaseCoverageLevel = "basic" | "standard" | "comprehensive";

export type TestCaseOutputFormat =
  | "checklist"
  | "detailed"
  | "gherkin"
  | "markdown-table";

export type TestCaseInput = {
  context: string;
  instructions?: string;
  testTypes: string[];
  coverageLevel: TestCaseCoverageLevel;
  outputFormat: TestCaseOutputFormat;
  priority: TestCasePriority;
};

export type GeneratedTestCase = {
  id: string;
  title: string;
  priority: TestCasePriority;
  type: string;
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  testData: string[];
  notes: string;
};

export type TestCaseResult = {
  summary: string;
  coverageFocus: string[];
  testCases: GeneratedTestCase[];
  edgeCases: string[];
  regressionRisks: string[];
  automationCandidates: string[];
  markdown: string;
};
