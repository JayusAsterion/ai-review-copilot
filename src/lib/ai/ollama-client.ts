import {
  buildBugReportPrompt,
  buildCodeReviewPrompt,
  buildTestCasesPrompt,
} from "@/lib/ai/prompts";
import {
  bugReportResultToMarkdown,
  testCaseResultToMarkdown,
} from "@/lib/utils/markdown";
import type {
  BugPriority,
  BugReportInput,
  BugReportResult,
  BugSeverity,
  GeneratedTestCase,
  OllamaModel,
  OllamaSettings,
  ReproductionRate,
  ReviewFinding,
  ReviewInput,
  ReviewResult,
  TestCaseInput,
  TestCasePriority,
  TestCaseResult,
} from "@/types/review";

type OllamaTagsResponse = {
  models?: Array<Partial<OllamaModel>>;
};

type OllamaChatResponse = {
  message?: {
    content?: string;
  };
  response?: string;
  error?: string;
};

export function normalizeOllamaUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim() || "http://localhost:11434";
  return trimmed.replace(/\/+$/, "");
}

function getReadableError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return "Generation was cancelled.";
    }

    if (error.message === "Failed to fetch") {
      return "Unable to connect to Ollama. Make sure Ollama is running locally, the selected model is installed, and OLLAMA_ORIGINS includes this app origin.";
    }

    return error.message;
  }

  return "An unknown Ollama error occurred.";
}

function getOllamaEndpoint(baseUrl: string, path: string): string {
  const normalized = normalizeOllamaUrl(baseUrl);

  try {
    return new URL(path, `${normalized}/`).toString();
  } catch {
    throw new Error(
      "Invalid Ollama URL. Use a full URL such as http://localhost:11434."
    );
  }
}

function mapOllamaModels(models: OllamaTagsResponse["models"]): OllamaModel[] {
  if (!Array.isArray(models)) {
    return [];
  }

  return models
    .map((model) => {
      const name = model.name ?? model.model;

      if (!name) {
        return null;
      }

      return {
        ...model,
        name,
      };
    })
    .filter((model): model is OllamaModel => model !== null);
}

async function readErrorBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.trim();
  } catch {
    return "";
  }
}

function normalizeFinding(value: Partial<ReviewFinding>): ReviewFinding {
  return {
    title: typeof value.title === "string" ? value.title : "Review finding",
    severity:
      value.severity === "info" ||
      value.severity === "low" ||
      value.severity === "medium" ||
      value.severity === "high"
        ? value.severity
        : "medium",
    type: typeof value.type === "string" ? value.type : "general",
    file: typeof value.file === "string" ? value.file : null,
    line: typeof value.line === "number" ? value.line : null,
    description:
      typeof value.description === "string"
        ? value.description
        : "The model returned an incomplete finding.",
    suggestedFix:
      typeof value.suggestedFix === "string"
        ? value.suggestedFix
        : "Review this area manually before merging.",
  };
}

function normalizeReviewResult(value: unknown, fallbackComment: string): ReviewResult {
  if (!value || typeof value !== "object") {
    throw new Error("The model response was not a JSON object.");
  }

  const record = value as Partial<ReviewResult>;
  const riskLevel =
    record.riskLevel === "low" ||
    record.riskLevel === "medium" ||
    record.riskLevel === "high"
      ? record.riskLevel
      : "medium";

  return {
    summary:
      typeof record.summary === "string"
        ? record.summary
        : "Ollama returned a review result.",
    riskLevel,
    findings: Array.isArray(record.findings)
      ? record.findings.map((finding) =>
          normalizeFinding(finding as Partial<ReviewFinding>)
        )
      : [],
    testCases: Array.isArray(record.testCases)
      ? record.testCases.filter((item): item is string => typeof item === "string")
      : [],
    prComment:
      typeof record.prComment === "string" ? record.prComment : fallbackComment,
  };
}

function extractJsonObject(content: string): unknown {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fencedMatch?.[1] ?? trimmed;
  const objectMatch = jsonText.match(/\{[\s\S]*\}/);

  return JSON.parse(objectMatch?.[0] ?? jsonText);
}

function parseModelJson(content: string): ReviewResult {
  return normalizeReviewResult(extractJsonObject(content), content);
}

function normalizeSeverity(value: unknown): BugSeverity {
  return value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "critical"
    ? value
    : "medium";
}

function normalizePriority(value: unknown): BugPriority {
  return value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "urgent"
    ? value
    : "medium";
}

function normalizeReproductionRate(value: unknown): ReproductionRate {
  return value === "always" ||
    value === "sometimes" ||
    value === "rarely" ||
    value === "unknown"
    ? value
    : "unknown";
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeBugReportResult(
  value: unknown,
  fallbackComment: string
): BugReportResult {
  if (!value || typeof value !== "object") {
    throw new Error("The model response was not a JSON object.");
  }

  const record = value as Partial<BugReportResult>;
  const result: BugReportResult = {
    title: typeof record.title === "string" ? record.title : "Bug report",
    summary:
      typeof record.summary === "string"
        ? record.summary
        : "Ollama returned a bug report result.",
    severity: normalizeSeverity(record.severity),
    priority: normalizePriority(record.priority),
    reproductionRate: normalizeReproductionRate(record.reproductionRate),
    environment:
      typeof record.environment === "string" ? record.environment : undefined,
    module: typeof record.module === "string" ? record.module : undefined,
    stepsToReproduce: normalizeStringArray(record.stepsToReproduce),
    actualResult:
      typeof record.actualResult === "string"
        ? record.actualResult
        : "Not provided.",
    expectedResult:
      typeof record.expectedResult === "string"
        ? record.expectedResult
        : "Not provided.",
    additionalObservations: normalizeStringArray(record.additionalObservations),
    missingInformation: normalizeStringArray(record.missingInformation),
    suggestedTestCases: normalizeStringArray(record.suggestedTestCases),
    developerComment:
      typeof record.developerComment === "string"
        ? record.developerComment
        : fallbackComment,
    markdown: typeof record.markdown === "string" ? record.markdown : "",
  };

  return {
    ...result,
    markdown: result.markdown || bugReportResultToMarkdown(result),
  };
}

function parseBugReportJson(content: string): BugReportResult {
  return normalizeBugReportResult(extractJsonObject(content), content);
}

function normalizeTestCasePriority(value: unknown): TestCasePriority {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";

  return normalized === "low" ||
    normalized === "medium" ||
    normalized === "high" ||
    normalized === "critical"
    ? normalized
    : "medium";
}

function normalizeTestData(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return typeof value === "string" && value.trim() ? [value] : [];
}

function normalizeGeneratedTestCase(
  value: unknown,
  index: number
): GeneratedTestCase {
  const record =
    value && typeof value === "object"
      ? (value as Partial<GeneratedTestCase>)
      : {};

  return {
    id:
      typeof record.id === "string" && record.id.trim()
        ? record.id
        : `TC-${String(index + 1).padStart(3, "0")}`,
    title:
      typeof record.title === "string" && record.title.trim()
        ? record.title
        : "Generated test case",
    priority: normalizeTestCasePriority(record.priority),
    type:
      typeof record.type === "string" && record.type.trim()
        ? record.type
        : "Functional",
    preconditions: normalizeStringArray(record.preconditions),
    steps: normalizeStringArray(record.steps),
    expectedResult:
      typeof record.expectedResult === "string" && record.expectedResult.trim()
        ? record.expectedResult
        : "Expected behavior is satisfied according to the supplied context.",
    testData: normalizeTestData(record.testData),
    notes: typeof record.notes === "string" ? record.notes : "",
  };
}

function normalizeTestCaseResult(value: unknown): TestCaseResult {
  if (!value || typeof value !== "object") {
    throw new Error("The model response was not a JSON object.");
  }

  const record = value as Partial<TestCaseResult>;
  const result: Omit<TestCaseResult, "markdown"> = {
    summary:
      typeof record.summary === "string" && record.summary.trim()
        ? record.summary
        : "Ollama returned generated QA coverage.",
    coverageFocus: normalizeStringArray(record.coverageFocus),
    testCases: Array.isArray(record.testCases)
      ? record.testCases.map(normalizeGeneratedTestCase)
      : [],
    edgeCases: normalizeStringArray(record.edgeCases),
    regressionRisks: normalizeStringArray(record.regressionRisks),
    automationCandidates: normalizeStringArray(record.automationCandidates),
  };

  if (result.testCases.length === 0) {
    throw new Error("The model response did not include test cases.");
  }

  return {
    ...result,
    markdown:
      typeof record.markdown === "string" && record.markdown.trim()
        ? record.markdown
        : testCaseResultToMarkdown(result),
  };
}

function parseTestCasesJson(content: string): TestCaseResult {
  return normalizeTestCaseResult(extractJsonObject(content));
}

export async function testOllamaConnection(
  baseUrl: string
): Promise<{ ok: boolean; models: OllamaModel[]; error?: string }> {
  try {
    const response = await fetch(getOllamaEndpoint(baseUrl, "api/tags"), {
      method: "GET",
    });

    if (!response.ok) {
      const details = await readErrorBody(response);

      return {
        ok: false,
        models: [],
        error: details
          ? `Ollama responded with ${response.status}: ${details}`
          : `Ollama responded with ${response.status} ${response.statusText}.`,
      };
    }

    const data = (await response.json()) as OllamaTagsResponse;

    return {
      ok: true,
      models: mapOllamaModels(data.models),
    };
  } catch (error) {
    return {
      ok: false,
      models: [],
      error: getReadableError(error),
    };
  }
}

export async function runOllamaCodeReview(
  input: ReviewInput,
  settings: OllamaSettings
): Promise<ReviewResult> {
  const model = settings.model.trim();

  if (!model) {
    throw new Error("Choose an Ollama model before running the review.");
  }

  try {
    const response = await fetch(getOllamaEndpoint(settings.baseUrl, "api/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        options: {
          temperature: 0.2,
          num_predict: 1400,
        },
        messages: [
          {
            role: "system",
            content:
              "You are a senior software engineer and QA-focused code reviewer. Return concise, actionable review output as strict JSON only.",
          },
          {
            role: "user",
            content: buildCodeReviewPrompt(input),
          },
        ],
      }),
    });

    if (!response.ok) {
      const details = await readErrorBody(response);
      const notFound =
        response.status === 404 ||
        details.toLowerCase().includes("not found") ||
        details.toLowerCase().includes("pull model");

      if (notFound) {
        throw new Error(
          `Model not found: ${model}. Pull it with: docker exec -it ai-review-ollama ollama pull ${model}`
        );
      }

      throw new Error(
        details
          ? `Ollama responded with ${response.status}: ${details}`
          : `Ollama responded with ${response.status} ${response.statusText}.`
      );
    }

    const data = (await response.json()) as OllamaChatResponse;

    if (data.error) {
      throw new Error(data.error);
    }

    const content = data.message?.content ?? data.response ?? "";

    if (!content.trim()) {
      throw new Error("Ollama returned an empty response.");
    }

    try {
      return parseModelJson(content);
    } catch {
      return {
        summary:
          "Ollama completed the review, but the response was not valid JSON.",
        riskLevel: "medium",
        findings: [
          {
            title: "Model response was not valid JSON",
            severity: "info",
            type: "format",
            file: null,
            line: null,
            description:
              "The model returned useful text, but it could not be parsed into the structured review schema.",
            suggestedFix:
              "Review the raw PR comment below and rerun analysis if structured findings are required.",
          },
        ],
        testCases: [
          "Manually verify the areas mentioned in the generated PR comment.",
        ],
        prComment: content,
      };
    }
  } catch (error) {
    throw new Error(getReadableError(error));
  }
}

export async function runOllamaBugReport(
  input: BugReportInput,
  settings: OllamaSettings
): Promise<BugReportResult> {
  const model = settings.model.trim();

  if (!model) {
    throw new Error("Choose an Ollama model before generating a bug report.");
  }

  try {
    const response = await fetch(getOllamaEndpoint(settings.baseUrl, "api/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        options: {
          temperature: 0.2,
          num_predict: 1600,
        },
        messages: [
          {
            role: "system",
            content:
              "You are a senior QA engineer and technical bug report assistant. You write concise, actionable, developer-ready bug reports.",
          },
          {
            role: "user",
            content: buildBugReportPrompt(input),
          },
        ],
      }),
    });

    if (!response.ok) {
      const details = await readErrorBody(response);
      const notFound =
        response.status === 404 ||
        details.toLowerCase().includes("not found") ||
        details.toLowerCase().includes("pull model");

      if (notFound) {
        throw new Error(
          `Model not found: ${model}. Pull it with: docker exec -it ai-review-ollama ollama pull ${model}`
        );
      }

      throw new Error(
        details
          ? `Ollama responded with ${response.status}: ${details}`
          : `Ollama responded with ${response.status} ${response.statusText}.`
      );
    }

    const data = (await response.json()) as OllamaChatResponse;

    if (data.error) {
      throw new Error(data.error);
    }

    const content = data.message?.content ?? data.response ?? "";

    if (!content.trim()) {
      throw new Error("Ollama returned an empty response.");
    }

    try {
      return parseBugReportJson(content);
    } catch {
      const fallback: BugReportResult = {
        title: "Bug report generated by Ollama",
        summary:
          "Ollama generated a response, but it could not be parsed into the structured bug report schema.",
        severity: "medium",
        priority: "medium",
        reproductionRate: input.reproductionRate ?? "unknown",
        environment: input.environment,
        module: input.module,
        stepsToReproduce: [],
        actualResult: input.actualResult || "Not provided.",
        expectedResult: input.expectedResult || "Not provided.",
        additionalObservations: [
          "The raw model response is included in the developer comment.",
        ],
        missingInformation: ["Structured JSON response from the model"],
        suggestedTestCases: [
          "Manually verify the workflow described in the model response.",
        ],
        developerComment: content,
        markdown: "",
      };

      return {
        ...fallback,
        markdown: bugReportResultToMarkdown({
          ...fallback,
          markdown: content,
        }),
      };
    }
  } catch (error) {
    throw new Error(getReadableError(error));
  }
}

export async function runOllamaTestCases(
  input: TestCaseInput,
  settings: OllamaSettings,
  options?: { signal?: AbortSignal }
): Promise<TestCaseResult> {
  const model = settings.model.trim();

  if (!model) {
    throw new Error("Choose an Ollama model before generating test cases.");
  }

  try {
    const response = await fetch(getOllamaEndpoint(settings.baseUrl, "api/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: options?.signal,
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        options: {
          temperature: 0.2,
          num_predict: 2200,
        },
        messages: [
          {
            role: "system",
            content:
              "You are a senior QA engineer. Generate practical, executable QA test coverage. Return strict JSON only.",
          },
          {
            role: "user",
            content: buildTestCasesPrompt(input),
          },
        ],
      }),
    });

    if (!response.ok) {
      const details = await readErrorBody(response);
      const notFound =
        response.status === 404 ||
        details.toLowerCase().includes("not found") ||
        details.toLowerCase().includes("pull model");

      if (notFound) {
        throw new Error(
          `Model not found: ${model}. Pull it with: docker exec -it ai-review-ollama ollama pull ${model}`
        );
      }

      throw new Error(
        details
          ? `Ollama responded with ${response.status}: ${details}`
          : `Ollama responded with ${response.status} ${response.statusText}.`
      );
    }

    let data: OllamaChatResponse;

    try {
      data = (await response.json()) as OllamaChatResponse;
    } catch {
      throw new Error("Ollama returned an invalid API response.");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    const content = data.message?.content ?? data.response ?? "";

    if (!content.trim()) {
      throw new Error("Ollama returned an empty response.");
    }

    try {
      return parseTestCasesJson(content);
    } catch {
      throw new Error(
        "The model returned an invalid format. Try generating again or simplifying the input."
      );
    }
  } catch (error) {
    throw new Error(getReadableError(error));
  }
}
