import type {
  AiModule,
  OllamaLocalSettings,
  OllamaModelPreset,
  OllamaModuleModels,
} from "@/types/review";

export const DEFAULT_OLLAMA_BASE_URL =
  process.env.NEXT_PUBLIC_DEFAULT_OLLAMA_URL ?? "http://localhost:11434";

export const DEFAULT_OLLAMA_FALLBACK_MODEL =
  process.env.NEXT_PUBLIC_DEFAULT_OLLAMA_MODEL ?? "qwen3-coder:30b";

export const AI_MODULES: AiModule[] = [
  "code-review",
  "bug-report",
  "test-cases",
];

export const OLLAMA_MODEL_PRESETS: Record<AiModule, OllamaModelPreset> = {
  "code-review": {
    module: "code-review",
    label: "Code Review",
    recommendedModel: "ai-review-code",
    fallbackModel: DEFAULT_OLLAMA_FALLBACK_MODEL,
    description: "Optimized for concise, actionable code review findings.",
  },
  "bug-report": {
    module: "bug-report",
    label: "Bug Report",
    recommendedModel: "ai-review-bug-report",
    fallbackModel: DEFAULT_OLLAMA_FALLBACK_MODEL,
    description:
      "Optimized for QA bug reports, reproduction steps, severity, and impact.",
  },
  "test-cases": {
    module: "test-cases",
    label: "Test Cases",
    recommendedModel: "ai-review-test-cases",
    fallbackModel: DEFAULT_OLLAMA_FALLBACK_MODEL,
    description:
      "Optimized for structured QA test cases, edge cases, and regression coverage.",
  },
};

export const DEFAULT_OLLAMA_MODULE_MODELS: OllamaModuleModels =
  AI_MODULES.reduce((models, module) => {
    models[module] = OLLAMA_MODEL_PRESETS[module].recommendedModel;
    return models;
  }, {} as OllamaModuleModels);

export const DEFAULT_OLLAMA_LOCAL_SETTINGS: OllamaLocalSettings = {
  baseUrl: DEFAULT_OLLAMA_BASE_URL,
  moduleModels: DEFAULT_OLLAMA_MODULE_MODELS,
};

export function getOllamaPreset(module: AiModule): OllamaModelPreset {
  return OLLAMA_MODEL_PRESETS[module];
}
