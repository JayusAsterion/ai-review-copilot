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
