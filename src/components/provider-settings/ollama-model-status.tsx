"use client";

import { AlertTriangle, CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getInstalledOllamaModels,
  isModelInstalled,
  isSameOllamaModel,
} from "@/lib/ai/ollama-client";
import { getOllamaPreset } from "@/lib/ai/ollama-presets";
import type { AiModule, OllamaSettings } from "@/types/review";

type OllamaModelStatusProps = {
  module: AiModule;
  settings: OllamaSettings;
  onModelChange?: (model: string) => void;
};

export function OllamaModelStatus({
  module,
  settings,
  onModelChange,
}: OllamaModelStatusProps) {
  const preset = getOllamaPreset(module);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedModel = settings.model || preset.recommendedModel;
  const selectOptions = useMemo(
    () =>
      Array.from(
        new Set(
          [
            preset.recommendedModel,
            preset.fallbackModel,
            selectedModel,
            ...installedModels,
          ].filter(Boolean)
        )
      ),
    [
      installedModels,
      preset.fallbackModel,
      preset.recommendedModel,
      selectedModel,
    ]
  );
  const status = useMemo(() => {
    if (error) {
      return "missing";
    }

    if (installedModels.length === 0) {
      return "unknown";
    }

    if (!isModelInstalled(selectedModel, installedModels)) {
      return "missing";
    }

    if (isSameOllamaModel(selectedModel, preset.recommendedModel)) {
      return "optimized";
    }

    if (isSameOllamaModel(selectedModel, preset.fallbackModel)) {
      return "fallback";
    }

    return "custom";
  }, [error, installedModels, preset.fallbackModel, preset.recommendedModel, selectedModel]);

  const refresh = useCallback(async (showPending = true) => {
    if (showPending) {
      setIsRefreshing(true);
      setError(null);
    }

    try {
      const models = await getInstalledOllamaModels(settings.baseUrl);
      setInstalledModels(models);
      setError(null);
    } catch (caughtError) {
      setInstalledModels([]);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to read installed Ollama models."
      );
    } finally {
      if (showPending) {
        setIsRefreshing(false);
      }
    }
  }, [settings.baseUrl]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh, selectedModel]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-white">Model</p>
            <StatusBadge status={status} />
          </div>
          {onModelChange ? (
            <div className="max-w-md space-y-2">
              <Select value={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-[#060a12]/80 font-mono text-slate-100 focus-visible:ring-cyan-300/25">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {selectOptions.map((model) => (
                    <SelectItem key={model} value={model}>
                      <span className="font-mono">{model}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-5 text-slate-500">
                Select any installed local model, optimized profile, or fallback.
              </p>
            </div>
          ) : (
            <p className="truncate font-mono text-sm text-slate-100">
              {selectedModel}
            </p>
          )}
          <p className="max-w-2xl text-xs leading-5 text-slate-400">
            {error
              ? "Make sure Ollama is running locally and the model is installed."
              : preset.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refresh()}
            disabled={isRefreshing}
            className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
          {status === "missing" ? (
            <Button
              asChild
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
            >
              <Link href="/guide#local-ollama-setup">
                <ExternalLink />
                Open setup guide
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
      {status === "missing" ? (
        <p className="mt-3 flex gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {selectedModel} is not installed locally. Create it from the User
            Guide or switch to {preset.fallbackModel} in Settings.
          </span>
        </p>
      ) : null}
    </section>
  );
}

function StatusBadge({
  status,
}: {
  status: "optimized" | "fallback" | "custom" | "missing" | "unknown";
}) {
  const className = {
    optimized: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    fallback: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    custom: "border-slate-300/20 bg-slate-300/10 text-slate-100",
    missing: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    unknown: "border-slate-300/20 bg-slate-300/10 text-slate-100",
  }[status];

  return (
    <Badge className={className}>
      {status === "optimized" ? <CheckCircle2 className="size-3" /> : null}
      {status}
    </Badge>
  );
}
