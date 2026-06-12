"use client";

import { CheckCircle2, Loader2, PlugZap, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { testOllamaConnection } from "@/lib/ai/ollama-client";
import type { OllamaModel, OllamaSettings } from "@/types/review";

type ConnectionState =
  | { status: "idle"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type OllamaSettingsCardProps = {
  settings: OllamaSettings;
  onChange: (settings: OllamaSettings) => void;
};

const preferredModel = "qwen3-coder:30b";

const recommendedModels = [
  {
    name: preferredModel,
    description: "Recommended for stronger code reviews.",
  },
  {
    name: "qwen2.5-coder:14b",
    description: "Balanced quality and speed.",
  },
  {
    name: "qwen2.5-coder:7b",
    description: "Lighter option for less powerful machines.",
  },
  {
    name: "deepseek-coder-v2:16b",
    description: "Good general coding assistant model.",
  },
  {
    name: "codellama:13b",
    description: "Solid fallback for code-focused tasks.",
  },
];

export function OllamaSettingsCard({
  settings,
  onChange,
}: OllamaSettingsCardProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [connection, setConnection] = useState<ConnectionState>({
    status: "idle",
    message: "Test your local Ollama connection before running AI review.",
  });

  const updateSettings = (patch: Partial<OllamaSettings>) => {
    onChange({ ...settings, ...patch });
  };

  const detectedModels = models.filter(
    (model) =>
      !recommendedModels.some(
        (recommendedModel) => recommendedModel.name === model.name
      )
  );

  const handleTestConnection = async () => {
    setIsTesting(true);

    try {
      const result = await testOllamaConnection(settings.baseUrl);
      setModels(result.models);

      if (result.ok) {
        const modelNames = result.models.map((model) => model.name);
        const firstModel = modelNames[0];

        if (modelNames.includes(preferredModel)) {
          updateSettings({ model: preferredModel });
        } else if (!settings.model.trim() && firstModel) {
          updateSettings({ model: firstModel });
        }

        setConnection({
          status: "success",
          message:
            result.models.length > 0
              ? `Connected. ${result.models.length} model${
                  result.models.length === 1 ? "" : "s"
                } detected.`
              : "Connected. No local models were reported by Ollama.",
        });
        toast.success("Ollama connection succeeded");
      } else {
        setConnection({
          status: "error",
          message:
            result.error ??
            "Unable to connect to Ollama. Check Docker, http://localhost:11434/api/tags, and OLLAMA_ORIGINS.",
        });
        toast.error("Ollama connection failed");
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="rounded-2xl border-white/10 bg-card/70 shadow-xl shadow-black/15 ring-1 ring-white/[0.03]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-200 ring-1 ring-emerald-300/20">
                <PlugZap className="size-4" />
              </span>
              Local Ollama
            </CardTitle>
            <CardDescription className="text-slate-400">
              Calls are made from this browser to your local Ollama server.
            </CardDescription>
          </div>
          <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
            Local
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="ollama-base-url" className="text-slate-200">
              Base URL
            </Label>
            <Input
              id="ollama-base-url"
              value={settings.baseUrl}
              onChange={(event) =>
                updateSettings({ baseUrl: event.target.value })
              }
              placeholder="http://localhost:11434"
              className="rounded-xl border-white/10 bg-[#070a12]/70 font-mono text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ollama-model" className="text-slate-200">
              Model
            </Label>
            <Select
              value={settings.model}
              onValueChange={(model) => updateSettings({ model })}
            >
              <SelectTrigger
                id="ollama-model"
                className="w-full rounded-xl border-white/10 bg-[#070a12]/70 font-mono text-slate-100"
              >
                <SelectValue placeholder="Select an Ollama model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Recommended models</SelectLabel>
                  {recommendedModels.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      <span className="flex flex-col items-start gap-0.5">
                        <span className="font-mono">{model.name}</span>
                        <span className="font-sans text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
                {detectedModels.length > 0 ? (
                  <>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Detected local models</SelectLabel>
                      {detectedModels.map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          <span className="font-mono">{model.name}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </>
                ) : null}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08] sm:w-auto"
            >
              {isTesting ? <Loader2 className="animate-spin" /> : <PlugZap />}
              Test
            </Button>
          </div>
        </div>

        {models.length > 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-sm font-medium text-slate-100">
              Detected local models
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {models.map((model) => (
                <Badge
                  key={model.name}
                  className="border-cyan-300/20 bg-cyan-300/10 font-mono text-cyan-100"
                >
                  {model.name}
                </Badge>
              ))}
            </div>
          </div>
        ) : connection.status === "success" ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-sm font-medium text-slate-100">
              No local models found
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Pull the recommended model, then test the connection again.
            </p>
            <code className="mt-3 block overflow-x-auto rounded-lg bg-black/35 px-3 py-2 font-mono text-xs text-slate-300">
              docker exec -it ai-review-ollama ollama pull qwen3-coder:30b
            </code>
          </div>
        ) : null}

        {connection.status !== "idle" ? (
          <Alert
            variant={connection.status === "error" ? "destructive" : "default"}
            className="border-white/10 bg-white/[0.035]"
          >
            {connection.status === "success" ? <CheckCircle2 /> : <XCircle />}
            <AlertTitle>
              {connection.status === "success"
                ? "Connection ready"
                : "Connection failed"}
            </AlertTitle>
            <AlertDescription>
              <span>{connection.message}</span>
              {connection.status === "error" ? (
                <span className="mt-2 block">
                  Check that the Docker container is running, that{" "}
                  <code className="font-mono">http://localhost:11434/api/tags</code> opens in your
                  browser, and that <code className="font-mono">OLLAMA_ORIGINS</code> includes this
                  app origin.
                </span>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-xs text-slate-500">{connection.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
