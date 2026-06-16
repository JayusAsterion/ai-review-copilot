"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  GitPullRequest,
  Loader2,
  RefreshCw,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { fetchAzureApi } from "@/lib/auth/azure-session-client";
import type {
  AzurePullRequest,
  AzurePullRequestReviewContext,
  AzurePullRequestsResponse,
  AzurePullRequestStatus,
  AzureStatusResponse,
} from "@/types/azure";

type AzurePrImportPanelProps = {
  onImport: (context: AzurePullRequestReviewContext) => void;
};

function parseApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return { message: fallback, code: "UNKNOWN_ERROR" };
  }

  const record = payload as Record<string, unknown>;

  return {
    message: typeof record.error === "string" ? record.error : fallback,
    code: typeof record.code === "string" ? record.code : "UNKNOWN_ERROR",
  };
}

function shortRefName(value: string | null) {
  return value?.replace(/^refs\/heads\//, "") ?? "Unknown";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function permissionMessage(code: string) {
  if (code === "AZURE_DEVOPS_UNAUTHORIZED") {
    return "Azure DevOps permissions are missing. Grant permissions in Settings and try again.";
  }

  if (code === "AZURE_ACCESS_TOKEN_EXPIRED") {
    return "The Microsoft token is expired. Sign in again, then retry the import.";
  }

  if (code === "AZURE_SESSION_EXPIRED") {
    return "Your Microsoft session expired. Please sign in again to continue using Azure DevOps.";
  }

  if (code === "AZURE_DEVOPS_FORBIDDEN") {
    return "This Microsoft account cannot access the selected Azure DevOps project or repository.";
  }

  return null;
}

export function AzurePrImportPanel({ onImport }: AzurePrImportPanelProps) {
  const [status, setStatus] = useState<AzureStatusResponse | null>(null);
  const [pullRequestStatus, setPullRequestStatus] =
    useState<AzurePullRequestStatus>("active");
  const [pullRequests, setPullRequests] = useState<AzurePullRequest[]>([]);
  const [selectedPullRequestId, setSelectedPullRequestId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingPullRequests, setIsLoadingPullRequests] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const selection = status?.azureDevOps.selection;
  const organization =
    selection?.organization ?? status?.azureDevOps.organizationName ?? null;
  const projectName = selection?.projectName ?? null;
  const repositoryId = selection?.repositoryId ?? null;
  const repositoryName = selection?.repositoryName ?? null;
  const selectedPullRequest = pullRequests.find(
    (pullRequest) =>
      String(pullRequest.pullRequestId) === selectedPullRequestId
  );
  const configurationComplete = Boolean(
    status?.azureDevOps.configured &&
      organization &&
      projectName &&
      repositoryId &&
      repositoryName
  );
  const metadataItems = useMemo(
    () => [
      ["Organization", organization ?? "Not configured"],
      ["Project", projectName ?? "None selected"],
      ["Repository", repositoryName ?? "None selected"],
    ],
    [organization, projectName, repositoryName]
  );

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    setError(null);

    try {
      const response = await fetchAzureApi("/api/azure/status", {
        cache: "no-store",
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const { message } = parseApiError(
          payload,
          "Unable to load Azure DevOps configuration."
        );
        throw new Error(message);
      }

      setStatus(payload as AzureStatusResponse);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load Azure DevOps configuration."
      );
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadInitialStatus = async () => {
      try {
        const response = await fetchAzureApi("/api/azure/status", {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          const { message } = parseApiError(
            payload,
            "Unable to load Azure DevOps configuration."
          );
          throw new Error(message);
        }

        setStatus(payload as AzureStatusResponse);
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load Azure DevOps configuration."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingStatus(false);
        }
      }
    };

    void loadInitialStatus();

    return () => controller.abort();
  }, []);

  const loadPullRequests = async () => {
    if (!organization || !projectName || !repositoryId) {
      setError("Configure Azure DevOps in Settings before importing PRs.");
      return;
    }

    setIsLoadingPullRequests(true);
    setError(null);
    setPullRequests([]);
    setSelectedPullRequestId("");

    try {
      const query = new URLSearchParams({
        organization,
        project: projectName,
        repositoryId,
        status: pullRequestStatus,
      });
      const response = await fetchAzureApi(`/api/azure/pull-requests?${query}`, {
        cache: "no-store",
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const { code, message } = parseApiError(
          payload,
          "Unable to load Azure DevOps pull requests."
        );
        throw new Error(permissionMessage(code) ?? message);
      }

      const pullRequestsPayload = payload as AzurePullRequestsResponse;
      setPullRequests(pullRequestsPayload.pullRequests);

      if (pullRequestsPayload.pullRequests.length === 0) {
        setError("No pull requests found for the selected repository/status.");
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load Azure DevOps pull requests."
      );
    } finally {
      setIsLoadingPullRequests(false);
    }
  };

  const importPullRequestContext = async () => {
    if (!organization || !projectName || !repositoryId || !selectedPullRequest) {
      setError("Select a pull request before importing context.");
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        organization,
        project: projectName,
        repositoryId,
        pullRequestId: String(selectedPullRequest.pullRequestId),
      });
      const response = await fetchAzureApi(
        `/api/azure/pull-request-context?${query}`,
        {
          cache: "no-store",
        }
      );
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const { code, message } = parseApiError(
          payload,
          "Unable to import Azure DevOps pull request context."
        );
        throw new Error(permissionMessage(code) ?? message);
      }

      onImport(payload as AzurePullRequestReviewContext);
      toast.success("Azure DevOps PR context imported");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to import Azure DevOps pull request context."
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Label className="text-slate-200">Azure DevOps Pull Request</Label>
          <p className="max-w-2xl text-xs leading-5 text-slate-500">
            Import PR metadata, changed files, and safe text diffs from the
            configured Azure DevOps repository. Review still runs through the
            existing Code Review flow.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadStatus()}
          disabled={isLoadingStatus}
          className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
        >
          {isLoadingStatus ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Refresh
        </Button>
      </div>

      {isLoadingStatus ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {["Organization", "Project", "Repository"].map((label) => (
            <div
              key={label}
              className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {metadataItems.map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 rounded-xl border border-white/10 bg-[#060a12]/80 p-3"
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 truncate text-sm font-medium text-slate-100">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {!configurationComplete && !isLoadingStatus ? (
        <Alert className="border-amber-300/20 bg-amber-300/10 text-amber-100">
          <AlertTriangle className="size-4" />
          <AlertTitle>Azure DevOps is not configured</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Configure Azure DevOps in Settings before importing pull
              requests.
            </p>
            <Button
              asChild
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-amber-300/20 bg-amber-300/10 text-amber-100 hover:bg-amber-300/15"
            >
              <Link href="/settings/connected-accounts">
                <Settings />
                Open Connected Accounts
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {configurationComplete ? (
        <>
          <Separator className="bg-white/10" />
          <div className="grid gap-3 lg:grid-cols-[minmax(0,14rem)_auto]">
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">PR status</Label>
              <Select
                value={pullRequestStatus}
                onValueChange={(value) => {
                  setPullRequestStatus(value as AzurePullRequestStatus);
                  setPullRequests([]);
                  setSelectedPullRequestId("");
                  setError(null);
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-[#060a12]/80 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0a0f1a] text-slate-100">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadPullRequests()}
              disabled={isLoadingPullRequests}
              className="self-end rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
            >
              {isLoadingPullRequests ? (
                <Loader2 className="animate-spin" />
              ) : (
                <GitPullRequest />
              )}
              {isLoadingPullRequests ? "Loading..." : "Load pull requests"}
            </Button>
          </div>

          {pullRequests.length > 0 ? (
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {pullRequests.map((pullRequest) => {
                const selected =
                  selectedPullRequestId === String(pullRequest.pullRequestId);

                return (
                  <button
                    key={pullRequest.pullRequestId}
                    type="button"
                    onClick={() =>
                      setSelectedPullRequestId(
                        String(pullRequest.pullRequestId)
                      )
                    }
                    className={[
                      "w-full rounded-xl border p-3 text-left transition-[border-color,background-color]",
                      selected
                        ? "border-cyan-300/35 bg-cyan-300/10"
                        : "border-white/10 bg-[#060a12]/80 hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          #{pullRequest.pullRequestId} {pullRequest.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {shortRefName(pullRequest.sourceRefName)} to{" "}
                          {shortRefName(pullRequest.targetRefName)}
                        </p>
                      </div>
                      <Badge className="w-fit border-slate-300/20 bg-slate-300/10 text-slate-100">
                        {pullRequest.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Created {formatDate(pullRequest.creationDate)} by{" "}
                      {pullRequest.createdBy?.displayName ?? "Unknown"}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {selectedPullRequest ? (
            <div className="rounded-xl border border-white/10 bg-[#060a12]/80 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    Selected PR #{selectedPullRequest.pullRequestId}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Import creates review context from PR metadata and
                    best-effort file diffs. It does not automatically run AI
                    review.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPullRequest.webUrl ? (
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                    >
                      <a
                        href={selectedPullRequest.webUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink />
                        Open PR
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    onClick={() => void importPullRequestContext()}
                    disabled={isImporting}
                    className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  >
                    {isImporting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <CheckCircle2 />
                    )}
                    {isImporting ? "Importing..." : "Import PR context"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {error ? (
        <Alert className="border-amber-300/20 bg-amber-300/10 text-amber-100">
          <AlertTriangle className="size-4" />
          <AlertTitle>Azure import needs attention</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
