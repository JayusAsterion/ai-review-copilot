export type AzureIntegrationStatus =
  | "not_configured"
  | "connected"
  | "needs_reconnect"
  | "expired"
  | "unknown";

export type AzureStatusResponse = {
  authenticated: true;
  microsoftAccount: {
    connected: boolean;
    provider: "azure-ad";
    providerAccountId: string | null;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
    scope: string | null;
    tokenType: string | null;
    expiresAt: string | null;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    isExpired: boolean;
  };
  azureDevOps: {
    configured: boolean;
    status: AzureIntegrationStatus;
    organizationName: string | null;
    organizationUrl: string | null;
    tenantId: string | null;
    connectedAt: string | null;
    lastValidatedAt: string | null;
    selection: {
      organization: string | null;
      projectId: string | null;
      projectName: string | null;
      repositoryId: string | null;
      repositoryName: string | null;
    } | null;
  };
};

export type AzureProject = {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  state: string | null;
  visibility: string | null;
  lastUpdateTime: string | null;
};

export type AzureProjectsResponse = {
  organization: string;
  count: number;
  projects: AzureProject[];
};

export type AzureRepository = {
  id: string;
  name: string;
  defaultBranch: string | null;
  remoteUrl: string | null;
  webUrl: string | null;
  size: number | null;
  isDisabled: boolean | null;
  isFork: boolean | null;
  project: {
    id: string | null;
    name: string | null;
  } | null;
};

export type AzureRepositoriesResponse = {
  organization: string;
  project: string;
  count: number;
  repositories: AzureRepository[];
};

export type AzurePullRequestStatus =
  | "active"
  | "completed"
  | "abandoned"
  | "all";

export type AzurePullRequest = {
  pullRequestId: number;
  title: string;
  description: string | null;
  status: string;
  isDraft: boolean | null;
  sourceRefName: string | null;
  targetRefName: string | null;
  createdBy: {
    displayName: string | null;
    uniqueName: string | null;
    imageUrl: string | null;
  } | null;
  creationDate: string | null;
  closedDate: string | null;
  repository: {
    id: string | null;
    name: string | null;
  } | null;
  webUrl: string | null;
};

export type AzurePullRequestsResponse = {
  organization: string;
  project: string;
  repositoryId: string;
  status: AzurePullRequestStatus;
  count: number;
  pullRequests: AzurePullRequest[];
};

export type AzureConfigureResponse = {
  connection: {
    id: string;
    status: "connected";
    organizationName: string;
    organizationUrl: string;
    connectedAt: string | null;
    lastValidatedAt: string | null;
  };
};

export type AzureSelectionResponse = {
  selection: {
    id: string;
    organization: string;
    projectId: string;
    projectName: string;
    repositoryId: string;
    repositoryName: string;
    updatedAt: string;
  };
};

export type AzurePullRequestChangedFile = {
  path: string;
  changeType: string;
  isFolder: boolean;
  itemObjectId?: string | null;
  originalObjectId?: string | null;
  url: string | null;
  imported: boolean;
  skippedReason: string | null;
  oldContentAvailable: boolean;
  newContentAvailable: boolean;
  diffAvailable: boolean;
};

export type AzurePullRequestReviewContext = {
  source: "azure-devops";
  organization: string;
  project: string;
  repositoryId: string;
  repositoryName: string | null;
  pullRequest: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    sourceRefName: string | null;
    targetRefName: string | null;
    author: string | null;
    creationDate: string | null;
    webUrl: string | null;
  };
  latestIterationId: number | null;
  summary: {
    changedFileCount: number;
    importedFileCount: number;
    skippedFileCount: number;
    truncated: boolean;
  };
  changedFiles: AzurePullRequestChangedFile[];
  reviewInput: string;
  warnings: string[];
};
