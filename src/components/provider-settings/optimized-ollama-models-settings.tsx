"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Server,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  getInstalledOllamaModels,
  isModelInstalled,
  isSameOllamaModel,
} from "@/lib/ai/ollama-client";
import {
  AI_MODULES,
  OLLAMA_MODEL_PRESETS,
} from "@/lib/ai/ollama-presets";
import { useOllamaLocalSettings } from "@/lib/ai/ollama-local-settings";
import type { AiModule } from "@/types/review";

export function OptimizedOllamaModelsSettings() {
  const { settings, setBaseUrl, setModuleModel } = useOllamaLocalSettings();
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshInstalledModels = useCallback(async (showPending = true) => {
    if (showPending) {
      setIsRefreshing(true);
      setConnectionError(null);
    }

    try {
      const models = await getInstalledOllamaModels(settings.baseUrl);
      setInstalledModels(models);
      setConnectionError(null);
      if (showPending) {
        toast.success("Installed Ollama models refreshed");
      }
    } catch (caughtError) {
      setInstalledModels([]);
      setConnectionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to connect to Ollama."
      );
      if (showPending) {
        toast.error("Ollama connection failed");
      }
    } finally {
      if (showPending) {
        setIsRefreshing(false);
      }
    }
  }, [settings.baseUrl]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshInstalledModels(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshInstalledModels]);

  return (
    <Card className="rounded-2xl border-white/10 bg-white/[0.04] text-card-foreground">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge className="w-fit border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <Server className="size-3" />
              Browser to Ollama
            </Badge>
            <CardTitle className="text-white">
              Optimized Ollama Models
            </CardTitle>
            <CardDescription className="max-w-3xl text-slate-400">
              Configure per-module local model profiles. Calls still go directly
              from this browser to your local Ollama server.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshInstalledModels()}
            disabled={isRefreshing}
            className="w-fit rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
            Refresh installed models
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-2">
            <Label htmlFor="optimized-ollama-base-url" className="text-slate-200">
              Current Ollama Base URL
            </Label>
            <Input
              id="optimized-ollama-base-url"
              value={settings.baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              className="h-10 rounded-xl border-white/10 bg-[#060a12]/80 font-mono text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-500">Connection status</p>
            <div className="mt-2 flex items-center gap-2">
              {connectionError ? (
                <AlertTriangle className="size-4 text-amber-200" />
              ) : (
                <CheckCircle2 className="size-4 text-emerald-200" />
              )}
              <span className="text-sm font-medium text-white">
                {connectionError ? "Connection failed" : "Ready"}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {connectionError
                ? "Check Ollama and refresh again."
                : `${installedModels.length} model${
                    installedModels.length === 1 ? "" : "s"
                  } detected.`}
            </p>
          </div>
        </div>

        {connectionError ? (
          <Alert className="border-amber-300/20 bg-amber-300/10 text-amber-100">
            <AlertTriangle className="size-4" />
            <AlertTitle>Ollama is not reachable</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        ) : null}

        {installedModels.length > 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-sm font-medium text-white">Installed models</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {installedModels.map((model) => (
                <Badge
                  key={model}
                  className="border-cyan-300/20 bg-cyan-300/10 font-mono text-cyan-100"
                >
                  {model}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        <Separator className="bg-white/10" />

        <div className="grid gap-3 xl:grid-cols-3">
          {AI_MODULES.map((module) => (
            <ModuleModelCard
              key={module}
              module={module}
              selectedModel={settings.moduleModels[module]}
              installedModels={installedModels}
              onModelChange={(model) => setModuleModel(module, model)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type ModuleModelCardProps = {
  module: AiModule;
  selectedModel: string;
  installedModels: string[];
  onModelChange: (model: string) => void;
};

function ModuleModelCard({
  module,
  selectedModel,
  installedModels,
  onModelChange,
}: ModuleModelCardProps) {
  const preset = OLLAMA_MODEL_PRESETS[module];
  const selectOptions = useMemo(
    () =>
      Array.from(
        new Set([
          preset.recommendedModel,
          preset.fallbackModel,
          selectedModel,
          ...installedModels,
        ].filter(Boolean))
      ),
    [installedModels, preset.fallbackModel, preset.recommendedModel, selectedModel]
  );
  const isSelectedInstalled = isModelInstalled(selectedModel, installedModels);
  const isRecommendedInstalled = isModelInstalled(
    preset.recommendedModel,
    installedModels
  );
  const status =
    isSelectedInstalled && isSameOllamaModel(selectedModel, preset.recommendedModel)
      ? "Optimized"
      : isSelectedInstalled && isSameOllamaModel(selectedModel, preset.fallbackModel)
        ? "Fallback"
        : isSelectedInstalled
          ? "Custom"
          : "Missing";

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{preset.label}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {preset.description}
          </p>
        </div>
        <Badge className={getStatusClassName(status)}>{status}</Badge>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs text-slate-500">Recommended optimized model</p>
          <p className="mt-1 font-mono text-sm text-slate-100">
            {preset.recommendedModel}
          </p>
          {!isRecommendedInstalled ? (
            <p className="mt-1 text-xs leading-5 text-amber-100">
              Not installed. Create it from the User Guide.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-400">Current selected model</Label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-[#060a12]/80 font-mono text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((model) => (
                <SelectItem key={model} value={model}>
                  <span className="font-mono">{model}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onModelChange(preset.recommendedModel)}
            className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            Use optimized
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onModelChange(preset.fallbackModel)}
            className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            Use fallback
          </Button>
          <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            <Link href="/guide#local-ollama-setup">
              <ExternalLink />
              Setup guide
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function getStatusClassName(status: string) {
  if (status === "Optimized") {
    return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "Fallback") {
    return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  }

  if (status === "Missing") {
    return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  }

  return "border-slate-300/20 bg-slate-300/10 text-slate-100";
}
