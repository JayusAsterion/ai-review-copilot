"use client";

import { useEffect, useState } from "react";

import {
  DEFAULT_OLLAMA_LOCAL_SETTINGS,
  DEFAULT_OLLAMA_MODULE_MODELS,
  getOllamaPreset,
} from "@/lib/ai/ollama-presets";
import type {
  AiModule,
  OllamaLocalSettings,
  OllamaSettings,
} from "@/types/review";

const storageKey = "ai-review-copilot:ollama-settings:v1";

function normalizeSettings(value: Partial<OllamaLocalSettings>): OllamaLocalSettings {
  return {
    baseUrl: value.baseUrl?.trim() || DEFAULT_OLLAMA_LOCAL_SETTINGS.baseUrl,
    moduleModels: {
      ...DEFAULT_OLLAMA_MODULE_MODELS,
      ...(value.moduleModels ?? {}),
    },
  };
}

export function loadOllamaLocalSettings(): OllamaLocalSettings {
  if (typeof window === "undefined") {
    return DEFAULT_OLLAMA_LOCAL_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw
      ? normalizeSettings(JSON.parse(raw) as Partial<OllamaLocalSettings>)
      : DEFAULT_OLLAMA_LOCAL_SETTINGS;
  } catch {
    return DEFAULT_OLLAMA_LOCAL_SETTINGS;
  }
}

export function saveOllamaLocalSettings(settings: OllamaLocalSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(settings));
}

export function getOllamaSettingsForModule(
  module: AiModule,
  settings: OllamaLocalSettings
): OllamaSettings {
  const preset = getOllamaPreset(module);

  return {
    baseUrl: settings.baseUrl,
    model:
      settings.moduleModels[module]?.trim() ||
      preset.recommendedModel ||
      preset.fallbackModel,
  };
}

export function useOllamaLocalSettings() {
  const [settings, setSettings] = useState<OllamaLocalSettings>(
    DEFAULT_OLLAMA_LOCAL_SETTINGS
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSettings(loadOllamaLocalSettings());
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const updateSettings = (nextSettings: OllamaLocalSettings) => {
    const normalized = normalizeSettings(nextSettings);
    setSettings(normalized);
    saveOllamaLocalSettings(normalized);
  };

  const setBaseUrl = (baseUrl: string) => {
    updateSettings({ ...settings, baseUrl });
  };

  const setModuleModel = (module: AiModule, model: string) => {
    updateSettings({
      ...settings,
      moduleModels: {
        ...settings.moduleModels,
        [module]: model,
      },
    });
  };

  return {
    settings,
    isLoaded,
    setBaseUrl,
    setModuleModel,
    setSettings: updateSettings,
  };
}

export function useOllamaModuleSettings(module: AiModule) {
  const localSettings = useOllamaLocalSettings();

  return {
    ...localSettings,
    moduleSettings: getOllamaSettingsForModule(module, localSettings.settings),
  };
}
