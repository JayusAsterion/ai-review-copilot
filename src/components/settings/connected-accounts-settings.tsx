"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Loader2,
  LogOut,
  PlugZap,
  RefreshCw,
  Server,
  ShieldCheck,
  ShieldPlus,
  Unplug,
} from "lucide-react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useOllamaLocalSettings } from "@/lib/ai/ollama-local-settings";
import { fetchAzureApi } from "@/lib/auth/azure-session-client";
import type {
  AzureProject,
  AzureConfigureResponse,
  AzureProjectsResponse,
  AzureRepositoriesResponse,
  AzureRepository,
  AzureSelectionResponse,
  AzureStatusResponse,
} from "@/types/azure";

type ConnectionTestResult =
  | {
      kind: "success";
      title: string;
      message: string;
      details: Array<{ label: string; value: string }>;
    }
  | {
      kind: "warning";
      title: string;
      message: string;
      details: Array<{ label: string; value: string }>;
    }
  | {
      kind: "error";
      title: string;
      message: string;
      details: Array<{ label: string; value: string }>;
    };

function initialsFromName(value?: string | null) {
  if (!value) {
    return "AI";
  }

  return value
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

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

function isAzurePermissionCode(code: string) {
  return code === "AZURE_DEVOPS_UNAUTHORIZED" || code === "AZURE_DEVOPS_FORBIDDEN";
}

export function ConnectedAccountsSettings() {
  const { data: session, status } = useSession();
  const { settings } = useOllamaLocalSettings();
  const [data, setData] = useState<AzureStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const loadConnectedAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAzureApi("/api/azure/status", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load connected account status.");
      }

      const payload = (await response.json()) as AzureStatusResponse;
      setData(payload);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load connected account status."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (status === "authenticated") {
        void loadConnectedAccounts();
      } else if (status === "unauthenticated") {
        setIsLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadConnectedAccounts, status]);

  const disconnectAzureDevOps = async () => {
    setIsDisconnecting(true);

    try {
      const response = await fetch(
        "/api/settings/connected-accounts/azure-devops/disconnect",
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Unable to disconnect Azure DevOps metadata.");
      }

      toast.success("Azure DevOps metadata disconnected");
      await loadConnectedAccounts();
    } catch (caughtError) {
      toast.error(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to disconnect Azure DevOps metadata."
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  const scopes = useMemo(
    () =>
      data?.microsoftAccount?.scope
        ?.split(" ")
        .map((scope) => scope.trim())
        .filter(Boolean) ?? [],
    [data?.microsoftAccount?.scope]
  );

  if (status === "loading" || isLoading) {
    return <ConnectedAccountsSkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <Alert className="border-amber-300/20 bg-amber-300/10 text-amber-100">
        <AlertTriangle className="size-4" />
        <AlertTitle>Sign in required</AlertTitle>
        <AlertDescription>
          Connected account settings are available after Microsoft sign-in.
        </AlertDescription>
      </Alert>
    );
  }

  if (error || !data) {
    return (
      <Alert className="border-red-300/20 bg-red-300/10 text-red-100">
        <AlertTriangle className="size-4" />
        <AlertTitle>Connected accounts unavailable</AlertTitle>
        <AlertDescription className="space-y-3">
          <span>{error ?? "Unable to load connected account status."}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadConnectedAccounts()}
            className="mt-3 w-fit rounded-xl border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
          >
            <RefreshCw />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const user = data.microsoftAccount.user;
  const displayName = user.name || user.email || session?.user?.name || "Signed in";

  return (
    <div className="space-y-4">
      <MicrosoftAccountCard
        displayName={displayName}
        user={user}
        account={data.microsoftAccount}
        scopes={scopes}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <AzureDevOpsCard
          key={`${data.azureDevOps.organizationName ?? "none"}-${data.azureDevOps.status}`}
          microsoftAccount={data.microsoftAccount}
          azureDevOps={data.azureDevOps}
          isDisconnecting={isDisconnecting}
          onDisconnect={() => void disconnectAzureDevOps()}
          onRefresh={() => void loadConnectedAccounts()}
        />

        <LocalOllamaCard
          baseUrl={settings.baseUrl}
          selectedModel={settings.moduleModels["code-review"]}
        />
      </div>
    </div>
  );
}

function MicrosoftAccountCard({
  displayName,
  user,
  account,
  scopes,
}: {
  displayName: string;
  user: AzureStatusResponse["microsoftAccount"]["user"];
  account: AzureStatusResponse["microsoftAccount"];
  scopes: string[];
}) {
  return (
    <Card className="rounded-2xl border-white/10 bg-white/[0.04] text-card-foreground">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <Avatar size="lg" className="bg-cyan-300/10">
              {user.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
              <AvatarFallback className="bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                {initialsFromName(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-2">
              <Badge
                className={
                  account.connected
                    ? "w-fit border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                    : "w-fit border-amber-300/20 bg-amber-300/10 text-amber-100"
                }
              >
                {account.connected ? (
                  <CheckCircle2 className="size-3" />
                ) : (
                  <AlertTriangle className="size-3" />
                )}
                {account.connected ? "Connected" : "Not connected"}
              </Badge>
              <div>
                <CardTitle className="text-white">Microsoft Account</CardTitle>
                <CardDescription className="mt-1 text-slate-400">
                  Authentication is handled by Microsoft Entra. Token values are
                  encrypted at rest and never shown here.
                </CardDescription>
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="w-fit rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
          >
            <LogOut />
            Sign out
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetadataTile label="Name" value={displayName} />
          <MetadataTile label="Email" value={user.email ?? "Not available"} />
          <MetadataTile
            label="Provider"
            value="Microsoft Entra / Azure AD"
          />
          <MetadataTile label="Provider ID" value={account?.provider ?? "azure-ad"} />
          <MetadataTile
            label="Provider account"
            value={account.providerAccountId ?? "Not available"}
            mono
          />
          <MetadataTile label="Connected since" value="Not tracked" />
          <MetadataTile
            label="Token expiration"
            value={formatDate(account.expiresAt)}
          />
          <MetadataTile
            label="Token type"
            value={account.tokenType ?? "Not available"}
          />
          <MetadataTile
            label="Access token stored"
            value={account.hasAccessToken ? "Yes" : "No"}
          />
          <MetadataTile
            label="Refresh token stored"
            value={account.hasRefreshToken ? "Yes" : "No"}
          />
          <MetadataTile
            label="Token status"
            value={account.isExpired ? "Expired" : "Current"}
          />
        </div>

        <Separator className="bg-white/10" />

        <div>
          <p className="text-sm font-medium text-white">Granted scopes</p>
          {scopes.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {scopes.map((scope) => (
                <Badge
                  key={scope}
                  className="border-cyan-300/20 bg-cyan-300/10 font-mono text-cyan-100"
                >
                  {scope}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              Scope metadata is not available for this account row.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AzureDevOpsCard({
  microsoftAccount,
  azureDevOps,
  isDisconnecting,
  onDisconnect,
  onRefresh,
}: {
  microsoftAccount: AzureStatusResponse["microsoftAccount"];
  azureDevOps: AzureStatusResponse["azureDevOps"];
  isDisconnecting: boolean;
  onDisconnect: () => void;
  onRefresh: () => void;
}) {
  const status = formatStatus(azureDevOps.status);
  const selection = azureDevOps.selection;
  const [organization, setOrganization] = useState(
    azureDevOps.organizationName ?? ""
  );
  const [project, setProject] = useState(selection?.projectName ?? "");
  const [projects, setProjects] = useState<AzureProject[]>([]);
  const [repositories, setRepositories] = useState<AzureRepository[]>([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState(
    selection?.repositoryId ?? ""
  );
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(
    null
  );
  const [browseResult, setBrowseResult] = useState<ConnectionTestResult | null>(
    null
  );
  const [isTesting, setIsTesting] = useState(false);
  const [isGrantingPermissions, setIsGrantingPermissions] = useState(false);
  const [isSavingOrganization, setIsSavingOrganization] = useState(false);
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false);

  const selectedRepository = repositories.find(
    (repository) => repository.id === selectedRepositoryId
  );
  const selectedProject = projects.find(
    (projectItem) => projectItem.name === project.trim()
  );
  const organizationIsConfigured =
    azureDevOps.configured &&
    azureDevOps.organizationName === organization.trim();
  const configurationIsVerified =
    testResult?.kind === "success" &&
    testResult.details.some(
      (detail) =>
        detail.label === "Organization" &&
        detail.value === organization.trim()
    );
  const canSaveOrganization =
    microsoftAccount.connected &&
    organization.trim().length > 0 &&
    (configurationIsVerified || organizationIsConfigured);
  const canSaveSelection = Boolean(
    organizationIsConfigured &&
      selectedRepository &&
      (selectedProject?.id || selectedRepository.project?.id) &&
      project.trim()
  );
  const permissionResult = [testResult, browseResult].find(
    (result) =>
      result?.kind === "warning" &&
      result.title.toLowerCase().includes("permissions")
  );

  const grantAzureDevOpsPermissions = () => {
    setIsGrantingPermissions(true);

    void signIn(
      "azure-ad",
      {
        callbackUrl: "/settings/connected-accounts",
      },
      {
        prompt: "consent",
        scope:
          "openid profile email offline_access https://app.vssps.visualstudio.com/.default",
      }
    ).finally(() => {
      setIsGrantingPermissions(false);
    });
  };

  const saveOrganizationConfiguration = async () => {
    const normalizedOrganization = organization.trim();

    if (!canSaveOrganization) {
      setTestResult({
        kind: "warning",
        title: "Test the organization first",
        message:
          "Run a successful connection test before saving this Azure DevOps organization.",
        details: [
          { label: "Organization", value: normalizedOrganization || "Missing" },
        ],
      });
      return;
    }

    setIsSavingOrganization(true);

    try {
      const response = await fetchAzureApi("/api/azure/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organization: normalizedOrganization }),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const { code, message } = parseApiError(
          payload,
          "Unable to configure Azure DevOps."
        );

        setTestResult({
          kind: isAzurePermissionCode(code) ? "warning" : "error",
          title: isAzurePermissionCode(code)
            ? "Azure DevOps permissions may be missing"
            : "Unable to save configuration",
          message,
          details: [
            { label: "Organization", value: normalizedOrganization },
            { label: "Result", value: code },
          ],
        });
        return;
      }

      const configuration = payload as AzureConfigureResponse;
      setTestResult({
        kind: "success",
        title: "Azure DevOps connected",
        message:
          "This organization is saved. Select a project and repository to continue.",
        details: [
          {
            label: "Organization",
            value: configuration.connection.organizationName,
          },
          {
            label: "Organization URL",
            value: configuration.connection.organizationUrl,
          },
        ],
      });
      toast.success("Azure DevOps organization saved");
      onRefresh();
    } catch (caughtError) {
      setTestResult({
        kind: "error",
        title: "Unable to save configuration",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "The Azure DevOps configuration request failed unexpectedly.",
        details: [{ label: "Provider", value: "azure-devops" }],
      });
    } finally {
      setIsSavingOrganization(false);
    }
  };

  const saveAzureSelection = async () => {
    const normalizedOrganization = organization.trim();
    const projectId = selectedProject?.id ?? selectedRepository?.project?.id;
    const projectName =
      selectedProject?.name ?? selectedRepository?.project?.name ?? project.trim();

    if (!selectedRepository || !projectId || !projectName) {
      setBrowseResult({
        kind: "warning",
        title: "Project and repository required",
        message:
          "Load projects and repositories, then select both before saving the Azure DevOps selection.",
        details: [
          { label: "Project", value: projectName || "Missing" },
          { label: "Repository", value: selectedRepository?.name ?? "Missing" },
        ],
      });
      return;
    }

    setIsSavingSelection(true);

    try {
      const response = await fetch("/api/azure/selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization: normalizedOrganization,
          projectId,
          projectName,
          repositoryId: selectedRepository.id,
          repositoryName: selectedRepository.name,
        }),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const { code, message } = parseApiError(
          payload,
          "Unable to save Azure DevOps selection."
        );

        setBrowseResult({
          kind: isAzurePermissionCode(code) ? "warning" : "error",
          title: "Unable to save selection",
          message,
          details: [
            { label: "Project", value: projectName },
            { label: "Repository", value: selectedRepository.name },
            { label: "Result", value: code },
          ],
        });
        return;
      }

      const selectionPayload = payload as AzureSelectionResponse;
      setBrowseResult({
        kind: "success",
        title: "Selection saved",
        message:
          "Azure DevOps project and repository metadata are saved for this workspace.",
        details: [
          {
            label: "Project",
            value: selectionPayload.selection.projectName,
          },
          {
            label: "Repository",
            value: selectionPayload.selection.repositoryName,
          },
        ],
      });
      toast.success("Azure DevOps selection saved");
      onRefresh();
    } catch (caughtError) {
      setBrowseResult({
        kind: "error",
        title: "Unable to save selection",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "The Azure DevOps selection request failed unexpectedly.",
        details: [{ label: "Provider", value: "azure-devops" }],
      });
    } finally {
      setIsSavingSelection(false);
    }
  };

  const runConnectionTest = async () => {
    const normalizedOrganization = organization.trim();
    setIsTesting(true);
    setTestResult(null);

    try {
      const statusResponse = await fetchAzureApi("/api/azure/status", {
        cache: "no-store",
      });

      if (!statusResponse.ok) {
        throw new Error("Unable to verify Microsoft account status.");
      }

      const currentStatus =
        (await statusResponse.json()) as AzureStatusResponse;
      const account = currentStatus.microsoftAccount;
      const currentAzureDevOps = currentStatus.azureDevOps;
      const organizationToTest =
        normalizedOrganization || currentAzureDevOps.organizationName;

      if (!account.connected) {
        setTestResult({
          kind: "error",
          title: "Unable to verify Azure DevOps connection",
          message: "No Microsoft account is linked for this session.",
          details: [
            { label: "Microsoft account connected", value: "No" },
            { label: "Provider", value: "azure-ad" },
          ],
        });
        return;
      }

      if (!account.hasAccessToken || account.isExpired) {
        setTestResult({
          kind: "error",
          title: "Token expired or permissions need to be refreshed",
          message:
            "Sign in again or grant Azure DevOps permissions, then test again.",
          details: [
            { label: "Microsoft account connected", value: "Yes" },
            { label: "Provider", value: account.provider },
            {
              label: "Token status",
              value: account.isExpired ? "Expired" : "Missing access token",
            },
          ],
        });
        return;
      }

      if (!organizationToTest) {
        setTestResult({
          kind: "warning",
          title: "Microsoft is connected, but Azure DevOps is not configured yet",
          message:
            "Add an Azure DevOps organization name to test project access.",
          details: [
            { label: "Microsoft account connected", value: "Yes" },
            { label: "Provider", value: account.provider },
            { label: "Token status", value: "Current" },
            {
              label: "Azure DevOps status",
              value: formatStatus(currentAzureDevOps.status),
            },
          ],
        });
        return;
      }

      const projectsResponse = await fetchAzureApi(
        `/api/azure/projects?organization=${encodeURIComponent(
          organizationToTest
        )}`,
        { cache: "no-store" }
      );
      const projectsPayload: unknown = await projectsResponse
        .json()
        .catch(() => null);

      if (!projectsResponse.ok) {
        const { code: errorCode, message: errorMessage } = parseApiError(
          projectsPayload,
          "Unable to verify Azure DevOps connection."
        );

        setTestResult({
          kind: isAzurePermissionCode(errorCode) ? "warning" : "error",
          title:
            isAzurePermissionCode(errorCode)
              ? "Azure DevOps permissions may be missing"
              : "Unable to verify Azure DevOps connection",
          message: errorMessage,
          details: [
            { label: "Microsoft account connected", value: "Yes" },
            { label: "Provider", value: account.provider },
            { label: "Organization", value: organizationToTest },
            { label: "Project access test", value: errorCode },
          ],
        });
        return;
      }

      const projects = projectsPayload as AzureProjectsResponse;
      setProjects(projects.projects);

      setTestResult({
        kind: "success",
        title: "Connection looks good",
        message:
          "Connection looks good. You can now configure this organization.",
        details: [
          { label: "Microsoft account connected", value: "Yes" },
          { label: "Provider", value: account.provider },
          { label: "Token status", value: "Current" },
          { label: "Organization", value: projects.organization },
          { label: "Projects found", value: String(projects.count) },
        ],
      });
    } catch (caughtError) {
      setTestResult({
        kind: "error",
        title: "Unable to verify Azure DevOps connection",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "The connection test failed unexpectedly.",
        details: [
          {
            label: "Provider",
            value: "azure-ad",
          },
        ],
      });
    } finally {
      setIsTesting(false);
    }
  };

  const loadProjects = async () => {
    const normalizedOrganization = organization.trim();

    if (!normalizedOrganization) {
      setBrowseResult({
        kind: "warning",
        title: "Organization required",
        message: "Enter an Azure DevOps organization before loading projects.",
        details: [{ label: "Provider", value: "azure-ad" }],
      });
      return;
    }

    setIsLoadingProjects(true);
    setBrowseResult(null);
    setProjects([]);
    setRepositories([]);

    try {
      const response = await fetchAzureApi(
        `/api/azure/projects?organization=${encodeURIComponent(
          normalizedOrganization
        )}`,
        { cache: "no-store" }
      );
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const { code, message } = parseApiError(
          payload,
          "Unable to load Azure DevOps projects."
        );

        setBrowseResult({
          kind: isAzurePermissionCode(code) ? "warning" : "error",
          title: isAzurePermissionCode(code)
            ? "Azure DevOps permissions may be missing"
            : "Unable to load projects",
          message,
          details: [
            { label: "Organization", value: normalizedOrganization },
            { label: "Result", value: code },
          ],
        });
        return;
      }

      const projectsPayload = payload as AzureProjectsResponse;
      setProjects(projectsPayload.projects);

      setBrowseResult({
        kind: projectsPayload.count > 0 ? "success" : "warning",
        title:
          projectsPayload.count > 0
            ? "Projects loaded"
            : "No projects returned",
        message:
          projectsPayload.count > 0
            ? "Select a project or enter its name manually to load repositories."
            : "Azure DevOps returned no projects for this account and organization.",
        details: [
          { label: "Organization", value: projectsPayload.organization },
          { label: "Projects found", value: String(projectsPayload.count) },
        ],
      });
    } catch (caughtError) {
      setBrowseResult({
        kind: "error",
        title: "Unable to load projects",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "The projects request failed unexpectedly.",
        details: [{ label: "Provider", value: "azure-ad" }],
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadRepositories = async () => {
    const normalizedOrganization = organization.trim();
    const normalizedProject = project.trim();

    if (!normalizedOrganization || !normalizedProject) {
      setBrowseResult({
        kind: "warning",
        title: "Organization and project required",
        message:
          "Enter an Azure DevOps organization and project before loading repositories.",
        details: [
          { label: "Organization", value: normalizedOrganization || "Missing" },
          { label: "Project", value: normalizedProject || "Missing" },
        ],
      });
      return;
    }

    setIsLoadingRepositories(true);
    setBrowseResult(null);
    setRepositories([]);
    setSelectedRepositoryId("");

    try {
      const query = new URLSearchParams({
        organization: normalizedOrganization,
        project: normalizedProject,
      });
      const response = await fetchAzureApi(`/api/azure/repositories?${query}`, {
        cache: "no-store",
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const { code, message } = parseApiError(
          payload,
          "Unable to load Azure DevOps repositories."
        );

        setBrowseResult({
          kind: isAzurePermissionCode(code) ? "warning" : "error",
          title: isAzurePermissionCode(code)
            ? "Azure DevOps permissions may be missing"
            : "Unable to load repositories",
          message,
          details: [
            { label: "Organization", value: normalizedOrganization },
            { label: "Project", value: normalizedProject },
            { label: "Result", value: code },
          ],
        });
        return;
      }

      const repositoriesPayload = payload as AzureRepositoriesResponse;
      setRepositories(repositoriesPayload.repositories);

      setBrowseResult({
        kind: repositoriesPayload.count > 0 ? "success" : "warning",
        title:
          repositoriesPayload.count > 0
            ? "Repositories loaded"
            : "No repositories returned",
        message:
          repositoriesPayload.count > 0
            ? "Select a repository and save the workspace selection."
            : "Azure DevOps returned no repositories for this project.",
        details: [
          { label: "Project", value: repositoriesPayload.project },
          {
            label: "Repositories found",
            value: String(repositoriesPayload.count),
          },
        ],
      });
    } catch (caughtError) {
      setBrowseResult({
        kind: "error",
        title: "Unable to load repositories",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "The repositories request failed unexpectedly.",
        details: [{ label: "Provider", value: "azure-ad" }],
      });
    } finally {
      setIsLoadingRepositories(false);
    }
  };

  return (
    <Card className="rounded-2xl border-white/10 bg-white/[0.04] text-card-foreground">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge
              className={
                azureDevOps.status === "connected"
                  ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                  : azureDevOps.status === "expired" ||
                      azureDevOps.status === "needs_reconnect"
                    ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                    : "border-slate-300/20 bg-slate-300/10 text-slate-100"
              }
            >
              {azureDevOps.status === "connected" ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <Cloud className="size-3" />
              )}
              {status}
            </Badge>
            <div>
              <CardTitle className="text-white">Azure DevOps</CardTitle>
              <CardDescription className="mt-1 text-slate-400">
                Browse projects, repositories, and pull requests through
                server-side Azure DevOps API routes.
              </CardDescription>
            </div>
          </div>
          <PlugZap className="size-5 text-cyan-100" />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {!microsoftAccount.connected ? (
          <Alert className="border-amber-300/20 bg-amber-300/10 text-amber-100">
            <AlertTriangle className="size-4" />
            <AlertTitle>Microsoft account not linked</AlertTitle>
            <AlertDescription>
              Sign in with Microsoft before testing Azure DevOps access.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <MetadataTile
            label="Organization"
            value={azureDevOps.organizationName ?? "Not configured"}
          />
          <MetadataTile
            label="Organization URL"
            value={azureDevOps.organizationUrl ?? "Not configured"}
            mono
          />
          <MetadataTile
            label="Last validated"
            value={formatDate(azureDevOps.lastValidatedAt)}
          />
          <MetadataTile
            label="Connected at"
            value={formatDate(azureDevOps.connectedAt)}
          />
          <MetadataTile
            label="Selected project"
            value={selection?.projectName ?? "None selected"}
          />
          <MetadataTile
            label="Selected repository"
            value={selection?.repositoryName ?? "None selected"}
          />
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="space-y-1">
            <Label
              htmlFor="azure-devops-organization"
              className="text-sm font-medium text-slate-200"
            >
              Azure DevOps organization
            </Label>
            <p className="text-xs leading-5 text-slate-500">
              Use the organization slug from dev.azure.com. This test does not
              save the value yet.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="azure-devops-organization"
              value={organization}
              onChange={(event) => {
                setOrganization(event.target.value);
                setTestResult(null);
                setProjects([]);
                setRepositories([]);
                setSelectedRepositoryId("");
              }}
              placeholder="your-organization-name"
              className="h-10 rounded-xl border-white/10 bg-[#060a12]/80 font-mono text-slate-100 placeholder:text-slate-500"
            />
            <Button
              type="button"
              onClick={() => void runConnectionTest()}
              disabled={isTesting}
              className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200 sm:w-fit"
            >
              {isTesting ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              type="button"
              variant={canSaveOrganization ? "default" : "outline"}
              onClick={() => void saveOrganizationConfiguration()}
              disabled={!canSaveOrganization || isSavingOrganization}
              className={
                canSaveOrganization
                  ? "rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200 sm:w-fit"
                  : "rounded-xl border-white/10 bg-white/[0.04] text-slate-500 sm:w-fit"
              }
            >
              {isSavingOrganization ? (
                <Loader2 className="animate-spin" />
              ) : (
                <PlugZap />
              )}
              {isSavingOrganization
                ? "Saving..."
                : organizationIsConfigured
                  ? "Update configuration"
                  : "Configure Azure DevOps"}
            </Button>
          </div>
        </div>

        {testResult ? <ConnectionTestResultPanel result={testResult} /> : null}

        {microsoftAccount.connected ? (
          <div
            className={
              permissionResult
                ? "space-y-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4"
                : "space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4"
            }
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                  Azure DevOps permissions
                </p>
                <p className="max-w-2xl text-xs leading-5 text-slate-400">
                  Grant read access for Azure DevOps profile, projects, and
                  code so repository and pull request checks can run from the
                  server.
                </p>
              </div>
              <Button
                type="button"
                variant={permissionResult ? "default" : "outline"}
                onClick={grantAzureDevOpsPermissions}
                disabled={isGrantingPermissions}
                className={
                  permissionResult
                    ? "rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200 sm:w-fit"
                    : "rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08] sm:w-fit"
                }
              >
                {isGrantingPermissions ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ShieldPlus />
                )}
                {isGrantingPermissions
                  ? "Opening Microsoft..."
                  : "Grant Azure DevOps permissions"}
              </Button>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              This uses Microsoft consent with the existing{" "}
              <span className="font-mono text-slate-300">azure-ad</span>{" "}
              provider and returns here after consent. Tokens are refreshed by
              the server-side encrypted token persistence flow.
            </p>
          </div>
        ) : null}

        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">
                Azure DevOps browser
              </p>
              <p className="max-w-2xl text-xs leading-5 text-slate-500">
                Read-only access check for projects, repositories, and pull
                requests. Values are not saved yet.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadProjects()}
              disabled={isLoadingProjects || !microsoftAccount.connected}
              className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08] sm:w-fit"
            >
              {isLoadingProjects ? (
                <Loader2 className="animate-spin" />
              ) : (
                <FolderGit2 />
              )}
              {isLoadingProjects ? "Loading..." : "Load projects"}
            </Button>
          </div>

          {projects.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">
                Project
              </Label>
              <Select
                value={project || undefined}
                onValueChange={(value) => {
                  setProject(value);
                  setRepositories([]);
                  setSelectedRepositoryId("");
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-[#060a12]/80 text-slate-100">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0a0f1a] text-slate-100">
                  {projects.map((projectItem) => (
                    <SelectItem key={projectItem.id} value={projectItem.name}>
                      {projectItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label
                htmlFor="azure-devops-project"
                className="text-sm font-medium text-slate-200"
              >
                Project
              </Label>
              <Input
                id="azure-devops-project"
                value={project}
                onChange={(event) => {
                  setProject(event.target.value);
                  setRepositories([]);
                  setSelectedRepositoryId("");
                }}
                placeholder="Project name"
                className="h-10 rounded-xl border-white/10 bg-[#060a12]/80 text-slate-100 placeholder:text-slate-500"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadRepositories()}
              disabled={isLoadingRepositories || !microsoftAccount.connected}
              className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
            >
              {isLoadingRepositories ? (
                <Loader2 className="animate-spin" />
              ) : (
                <GitBranch />
              )}
              {isLoadingRepositories ? "Loading..." : "Load repositories"}
            </Button>
            {repositories.length > 0 ? (
              <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                {repositories.length} repositories
              </Badge>
            ) : null}
          </div>

          {repositories.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">
                Repository
              </Label>
              <Select
                value={selectedRepositoryId || undefined}
                onValueChange={(value) => {
                  setSelectedRepositoryId(value);
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-[#060a12]/80 text-slate-100">
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0a0f1a] text-slate-100">
                  {repositories.map((repository) => (
                    <SelectItem key={repository.id} value={repository.id}>
                      {repository.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRepository ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <MetadataTile
                    label="Default branch"
                    value={selectedRepository.defaultBranch ?? "Not available"}
                    mono
                  />
                  <MetadataTile
                    label="Repository URL"
                    value={
                      selectedRepository.webUrl ??
                      selectedRepository.remoteUrl ??
                      "Not available"
                    }
                    mono
                  />
                </div>
              ) : null}
              <Button
                type="button"
                variant={canSaveSelection ? "default" : "outline"}
                onClick={() => void saveAzureSelection()}
                disabled={!canSaveSelection || isSavingSelection}
                className={
                  canSaveSelection
                    ? "rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                    : "rounded-xl border-white/10 bg-white/[0.04] text-slate-500"
                }
              >
                {isSavingSelection ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle2 />
                )}
                {isSavingSelection ? "Saving..." : "Save selection"}
              </Button>
            </div>
          ) : null}

        </div>

        {browseResult ? (
          <ConnectionTestResultPanel result={browseResult} />
        ) : null}

        <div className="flex flex-wrap gap-2">
          {azureDevOps.configured ? (
            <Button
              type="button"
              variant="outline"
              onClick={onDisconnect}
              disabled={isDisconnecting}
              className="rounded-xl border-red-300/20 bg-red-300/10 text-red-100 hover:bg-red-300/15"
            >
              {isDisconnecting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Unplug />
              )}
              Disconnect metadata
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectionTestResultPanel({
  result,
}: {
  result: ConnectionTestResult;
}) {
  const isSuccess = result.kind === "success";
  const isWarning = result.kind === "warning";

  return (
    <Alert
      className={
        isSuccess
          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
          : isWarning
            ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
            : "border-red-300/20 bg-red-300/10 text-red-100"
      }
    >
      {isSuccess ? (
        <CheckCircle2 className="size-4" />
      ) : (
        <AlertTriangle className="size-4" />
      )}
      <AlertTitle>{result.title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-3">
          <p>{result.message}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {result.details.map((detail) => (
              <div
                key={`${detail.label}-${detail.value}`}
                className="rounded-xl border border-white/10 bg-black/20 p-2.5"
              >
                <p className="text-xs opacity-70">{detail.label}</p>
                <p className="mt-1 truncate font-mono text-xs text-white">
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
          {isWarning ? (
            <p className="text-xs leading-5">
              Grant Azure DevOps permissions from the connected account flow,
              then test again.
            </p>
          ) : null}
        </div>
      </AlertDescription>
    </Alert>
  );
}

function LocalOllamaCard({
  baseUrl,
  selectedModel,
}: {
  baseUrl: string;
  selectedModel: string;
}) {
  return (
    <Card className="rounded-2xl border-white/10 bg-white/[0.04] text-card-foreground">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <Server className="size-3" />
              Local-first
            </Badge>
            <div>
              <CardTitle className="text-white">Local Ollama</CardTitle>
              <CardDescription className="mt-1 text-slate-400">
                AI analysis stays browser-to-localhost when Local Ollama is
                selected.
              </CardDescription>
            </div>
          </div>
          <ShieldCheck className="size-5 text-emerald-100" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetadataTile label="Base URL" value={baseUrl} mono />
        <MetadataTile label="Code Review model" value={selectedModel} mono />
        <Button
          asChild
          type="button"
          variant="outline"
          className="w-fit rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
        >
          <Link href="/guide#local-ollama-setup">
            <ExternalLink />
            Open setup guide
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function MetadataTile({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={
          mono
            ? "mt-1 truncate font-mono text-sm text-slate-100"
            : "mt-1 truncate text-sm font-medium text-slate-100"
        }
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function ConnectedAccountsSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-white/10 bg-white/[0.04]">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 bg-white/10" />
              <Skeleton className="h-6 w-56 bg-white/10" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-xl bg-white/10" />
          ))}
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Skeleton className="h-72 rounded-2xl bg-white/10" />
        <Skeleton className="h-72 rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}
