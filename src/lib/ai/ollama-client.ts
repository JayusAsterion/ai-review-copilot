import { buildCodeReviewPrompt } from "@/lib/ai/prompts";
import type {
  OllamaModel,
  OllamaSettings,
  ReviewFinding,
  ReviewInput,
  ReviewResult,
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
    if (error.message === "Failed to fetch") {
      return "Unable to connect to Ollama. Make sure Ollama is running and OLLAMA_ORIGINS includes this app origin.";
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

function parseModelJson(content: string): ReviewResult {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fencedMatch?.[1] ?? trimmed;
  const objectMatch = jsonText.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(objectMatch?.[0] ?? jsonText);

  return normalizeReviewResult(parsed, content);
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
