import "server-only";

import type {
  AzureProject,
  AzurePullRequestChangedFile,
  AzurePullRequestReviewContext,
  AzurePullRequest,
  AzurePullRequestStatus,
  AzureRepository,
} from "@/types/azure";
import { generateUnifiedDiff } from "@/lib/parsers/diff-parser";

type AzureDevOpsProjectApiItem = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  url?: unknown;
  state?: unknown;
  visibility?: unknown;
  lastUpdateTime?: unknown;
};

type AzureDevOpsRepositoryApiItem = {
  id?: unknown;
  name?: unknown;
  defaultBranch?: unknown;
  remoteUrl?: unknown;
  webUrl?: unknown;
  size?: unknown;
  isDisabled?: unknown;
  isFork?: unknown;
  project?: {
    id?: unknown;
    name?: unknown;
  };
};

type AzureDevOpsPullRequestApiItem = {
  pullRequestId?: unknown;
  title?: unknown;
  description?: unknown;
  status?: unknown;
  isDraft?: unknown;
  sourceRefName?: unknown;
  targetRefName?: unknown;
  createdBy?: {
    displayName?: unknown;
    uniqueName?: unknown;
    imageUrl?: unknown;
  };
  creationDate?: unknown;
  closedDate?: unknown;
  repository?: {
    id?: unknown;
    name?: unknown;
  };
};

type AzureDevOpsListApiResponse = {
  value?: unknown;
};

type AzureDevOpsIterationsApiItem = {
  id?: unknown;
};

type AzureDevOpsChangesApiItem = {
  changeType?: unknown;
  item?: {
    objectId?: unknown;
    path?: unknown;
    isFolder?: unknown;
    url?: unknown;
  };
  originalObjectId?: unknown;
};

type AzureDevOpsChangesApiResponse = {
  changeEntries?: unknown;
  value?: unknown;
};

type AzureDevOpsItemContentResponse = {
  content?: unknown;
};

type ImportedChangedFile = AzurePullRequestChangedFile & {
  diffBlock: string | null;
};

const maxChangedEntries = 200;
const maxFilesWithContent = 20;
const maxFileCharacters = 80 * 1024;
const maxReviewInputCharacters = 120_000;

const binaryExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".pdf",
  ".zip",
  ".exe",
  ".dll",
  ".woff",
  ".woff2",
  ".ttf",
  ".ico",
  ".mp4",
  ".mov",
  ".mp3",
  ".wav",
]);

const excludedFilenames = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  "composer.lock",
  "poetry.lock",
  "cargo.lock",
]);

const excludedPathSegments = new Set([
  ".next",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);

export class AzureDevOpsRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "AzureDevOpsRequestError";
  }
}

export function normalizeAzureOrganization(value: string) {
  const organization = value.trim();

  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,48}[A-Za-z0-9])?$/.test(organization)) {
    return null;
  }

  return organization;
}

export function normalizeAzureProject(value: string) {
  const project = value.trim();

  if (
    project.length === 0 ||
    project.length > 128 ||
    /[\\/?#]/.test(project)
  ) {
    return null;
  }

  return project;
}

export function normalizeAzureRepositoryId(value: string) {
  const repositoryId = value.trim();

  if (
    repositoryId.length === 0 ||
    repositoryId.length > 128 ||
    /[\\/?#]/.test(repositoryId)
  ) {
    return null;
  }

  return repositoryId;
}

export function normalizeAzurePullRequestId(value: string) {
  const pullRequestId = Number(value.trim());

  if (!Number.isInteger(pullRequestId) || pullRequestId <= 0) {
    return null;
  }

  return pullRequestId;
}

export function normalizeAzurePullRequestStatus(
  value: string | null | undefined
): AzurePullRequestStatus | null {
  const status = value?.trim() || "active";

  if (
    status === "active" ||
    status === "completed" ||
    status === "abandoned" ||
    status === "all"
  ) {
    return status;
  }

  return null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function booleanOrNull(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function normalizeProject(project: AzureDevOpsProjectApiItem): AzureProject | null {
  const id = stringOrNull(project.id);
  const name = stringOrNull(project.name);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    description: stringOrNull(project.description),
    url: stringOrNull(project.url),
    state: stringOrNull(project.state),
    visibility: stringOrNull(project.visibility),
    lastUpdateTime: stringOrNull(project.lastUpdateTime),
  };
}

function normalizeRepository(
  repository: AzureDevOpsRepositoryApiItem
): AzureRepository | null {
  const id = stringOrNull(repository.id);
  const name = stringOrNull(repository.name);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    defaultBranch: stringOrNull(repository.defaultBranch),
    remoteUrl: stringOrNull(repository.remoteUrl),
    webUrl: stringOrNull(repository.webUrl),
    size: numberOrNull(repository.size),
    isDisabled: booleanOrNull(repository.isDisabled),
    isFork: booleanOrNull(repository.isFork),
    project: repository.project
      ? {
          id: stringOrNull(repository.project.id),
          name: stringOrNull(repository.project.name),
        }
      : null,
  };
}

function buildPullRequestWebUrl({
  organization,
  project,
  repository,
  pullRequestId,
}: {
  organization: string;
  project: string;
  repository: string;
  pullRequestId: number;
}) {
  return `https://dev.azure.com/${encodeURIComponent(
    organization
  )}/${encodeURIComponent(project)}/_git/${encodeURIComponent(
    repository
  )}/pullrequest/${pullRequestId}`;
}

function normalizePullRequest(
  pullRequest: AzureDevOpsPullRequestApiItem,
  params: {
    organization: string;
    project: string;
    fallbackRepositoryId: string;
  }
): AzurePullRequest | null {
  const pullRequestId = numberOrNull(pullRequest.pullRequestId);
  const title = stringOrNull(pullRequest.title);

  if (pullRequestId === null || !title) {
    return null;
  }

  const repositoryId =
    stringOrNull(pullRequest.repository?.id) ?? params.fallbackRepositoryId;
  const repositoryName = stringOrNull(pullRequest.repository?.name);

  return {
    pullRequestId,
    title,
    description: stringOrNull(pullRequest.description),
    status: stringOrNull(pullRequest.status) ?? "unknown",
    isDraft: booleanOrNull(pullRequest.isDraft),
    sourceRefName: stringOrNull(pullRequest.sourceRefName),
    targetRefName: stringOrNull(pullRequest.targetRefName),
    createdBy: pullRequest.createdBy
      ? {
          displayName: stringOrNull(pullRequest.createdBy.displayName),
          uniqueName: stringOrNull(pullRequest.createdBy.uniqueName),
          imageUrl: stringOrNull(pullRequest.createdBy.imageUrl),
        }
      : null,
    creationDate: stringOrNull(pullRequest.creationDate),
    closedDate: stringOrNull(pullRequest.closedDate),
    repository: {
      id: repositoryId,
      name: repositoryName,
    },
    webUrl: buildPullRequestWebUrl({
      organization: params.organization,
      project: params.project,
      repository: repositoryName ?? repositoryId,
      pullRequestId,
    }),
  };
}

async function fetchAzureDevOpsList({
  url,
  accessToken,
  missingListMessage,
}: {
  url: string;
  accessToken: string;
  missingListMessage: string;
}) {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    throw new AzureDevOpsRequestError(
      "Unable to reach Azure DevOps.",
      502,
      "AZURE_DEVOPS_NETWORK_ERROR"
    );
  }

  if (response.status >= 300 && response.status < 400) {
    throw new AzureDevOpsRequestError(
      "Azure DevOps redirected the request.",
      401,
      "AZURE_DEVOPS_UNAUTHORIZED"
    );
  }

  if (!response.ok) {
    throw new AzureDevOpsRequestError(
      "Azure DevOps returned an error.",
      response.status,
      "AZURE_DEVOPS_REQUEST_FAILED"
    );
  }

  let payload: AzureDevOpsListApiResponse;

  try {
    payload = (await response.json()) as AzureDevOpsListApiResponse;
  } catch {
    throw new AzureDevOpsRequestError(
      "Azure DevOps returned an invalid response.",
      502,
      "AZURE_DEVOPS_INVALID_RESPONSE"
    );
  }

  if (!Array.isArray(payload.value)) {
    throw new AzureDevOpsRequestError(
      missingListMessage,
      502,
      "AZURE_DEVOPS_INVALID_RESPONSE"
    );
  }

  return payload.value;
}

async function fetchAzureDevOpsJson({
  url,
  accessToken,
}: {
  url: string;
  accessToken: string;
}) {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    throw new AzureDevOpsRequestError(
      "Unable to reach Azure DevOps.",
      502,
      "AZURE_DEVOPS_NETWORK_ERROR"
    );
  }

  if (response.status >= 300 && response.status < 400) {
    throw new AzureDevOpsRequestError(
      "Azure DevOps redirected the request.",
      401,
      "AZURE_DEVOPS_UNAUTHORIZED"
    );
  }

  if (!response.ok) {
    throw new AzureDevOpsRequestError(
      "Azure DevOps returned an error.",
      response.status,
      "AZURE_DEVOPS_REQUEST_FAILED"
    );
  }

  try {
    return (await response.json()) as unknown;
  } catch {
    throw new AzureDevOpsRequestError(
      "Azure DevOps returned an invalid response.",
      502,
      "AZURE_DEVOPS_INVALID_RESPONSE"
    );
  }
}

function normalizeIteration(
  iteration: AzureDevOpsIterationsApiItem
): number | null {
  return numberOrNull(iteration.id);
}

function normalizeChangedFile(
  change: AzureDevOpsChangesApiItem
): AzurePullRequestChangedFile | null {
  const path = stringOrNull(change.item?.path);

  if (!path) {
    return null;
  }

  return {
    path,
    changeType: stringOrNull(change.changeType) ?? "unknown",
    isFolder: booleanOrNull(change.item?.isFolder) ?? false,
    itemObjectId: stringOrNull(change.item?.objectId),
    originalObjectId: stringOrNull(change.originalObjectId),
    url: stringOrNull(change.item?.url),
    imported: false,
    skippedReason: null,
    oldContentAvailable: false,
    newContentAvailable: false,
    diffAvailable: false,
  };
}

function getChangesArray(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const response = payload as AzureDevOpsChangesApiResponse;

  if (Array.isArray(response.changeEntries)) {
    return response.changeEntries;
  }

  if (Array.isArray(response.value)) {
    return response.value;
  }

  return null;
}

function normalizeBranchName(refName: string | null) {
  return refName?.replace(/^refs\/heads\//, "") ?? null;
}

function extensionFromPath(path: string) {
  const fileName = path.replace(/\\/g, "/").split("/").pop() ?? path;
  const lastDotIndex = fileName.lastIndexOf(".");

  return lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : "";
}

function getFileName(path: string) {
  return path.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? path;
}

function getSkippedPathReason(path: string) {
  const normalizedPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
  const fileName = getFileName(normalizedPath).toLowerCase();
  const extension = extensionFromPath(normalizedPath);
  const pathSegments = normalizedPath
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.toLowerCase());

  if (excludedFilenames.has(fileName)) {
    return "Lockfiles are excluded by default.";
  }

  if (pathSegments.some((segment) => excludedPathSegments.has(segment))) {
    return "Build, dependency, or generated output paths are excluded by default.";
  }

  if (binaryExtensions.has(extension)) {
    return "File type appears to be binary or unsupported for text review.";
  }

  return null;
}

function contentLooksBinary(content: string) {
  if (content.includes("\u0000")) {
    return true;
  }

  const sample = content.slice(0, 4096);
  let controlCharacters = 0;

  for (const character of sample) {
    const codePoint = character.charCodeAt(0);

    if (
      codePoint < 32 &&
      codePoint !== 9 &&
      codePoint !== 10 &&
      codePoint !== 13
    ) {
      controlCharacters += 1;
    }
  }

  return sample.length > 0 && controlCharacters / sample.length > 0.08;
}

function normalizeChangeType(value: string) {
  return value.trim().toLowerCase();
}

function isAddedChange(changeType: string) {
  const normalized = normalizeChangeType(changeType);

  return normalized.includes("add") && !normalized.includes("edit");
}

function isDeletedChange(changeType: string) {
  return normalizeChangeType(changeType).includes("delete");
}

function createPseudoDiffBlock({
  file,
  oldContent,
  newContent,
}: {
  file: AzurePullRequestChangedFile;
  oldContent: string | null;
  newContent: string | null;
}) {
  const lines = [
    `File: ${file.path}`,
    `Change type: ${file.changeType}`,
    "",
  ];

  if (oldContent !== null) {
    lines.push("Before:", oldContent);
  } else {
    lines.push("Before: Not available.");
  }

  lines.push("");

  if (newContent !== null) {
    lines.push("After:", newContent);
  } else {
    lines.push("After: Not available.");
  }

  return lines.join("\n");
}

function createFileContextBlock({
  file,
  oldContent,
  newContent,
}: {
  file: AzurePullRequestChangedFile;
  oldContent: string | null;
  newContent: string | null;
}) {
  const hasOldContent = oldContent !== null;
  const hasNewContent = newContent !== null;

  if (hasOldContent && hasNewContent) {
    return generateUnifiedDiff({
      oldContent,
      newContent,
      filePath: file.path.replace(/^\/+/, ""),
    }).trim();
  }

  return createPseudoDiffBlock({ file, oldContent, newContent });
}

function truncateBlockToRemainingBudget(block: string, remainingCharacters: number) {
  if (block.length <= remainingCharacters) {
    return { block, truncated: false };
  }

  const suffix = "\n\n[Context truncated to stay within import limits.]";
  const safeLength = Math.max(0, remainingCharacters - suffix.length);

  return {
    block: `${block.slice(0, safeLength)}${suffix}`,
    truncated: true,
  };
}

function addUniqueWarning(warnings: string[], warning: string) {
  if (!warnings.includes(warning)) {
    warnings.push(warning);
  }
}

function getChangedFilesSummary(changedFiles: AzurePullRequestChangedFile[]) {
  const importedFileCount = changedFiles.filter((file) => file.imported).length;
  const skippedFileCount = changedFiles.filter(
    (file) => file.skippedReason !== null
  ).length;

  return {
    changedFileCount: changedFiles.length,
    importedFileCount,
    skippedFileCount,
  };
}

function buildReviewInput({
  organization,
  project,
  repositoryName,
  pullRequest,
  latestIterationId,
  changedFiles,
  diffBlocks,
  truncated,
  warnings,
}: {
  organization: string;
  project: string;
  repositoryName: string | null;
  pullRequest: AzurePullRequest;
  latestIterationId: number | null;
  changedFiles: AzurePullRequestChangedFile[];
  diffBlocks: string[];
  truncated: boolean;
  warnings: string[];
}) {
  const author =
    pullRequest.createdBy?.displayName ??
    pullRequest.createdBy?.uniqueName ??
    "Unknown";
  const summary = getChangedFilesSummary(changedFiles);
  const changedFileLines =
    changedFiles.length > 0
      ? changedFiles
          .map((file) => {
            const status = file.imported
              ? "imported"
              : file.skippedReason
                ? `skipped: ${file.skippedReason}`
                : "metadata only";

            return `- [${file.changeType}] ${file.path} (${status})`;
          })
          .join("\n")
      : "- No changed files returned by Azure DevOps.";
  const diffContent =
    diffBlocks.length > 0
      ? diffBlocks.join("\n\n")
      : "No file content could be imported. Review is based on PR metadata and changed file paths only.";

  const lines = [
    "Azure DevOps Pull Request Review Context",
    "",
    `Organization: ${organization}`,
    `Project: ${project}`,
    `Repository: ${repositoryName ?? pullRequest.repository?.name ?? "Unknown"}`,
    `PR: #${pullRequest.pullRequestId} - ${pullRequest.title}`,
    `Status: ${pullRequest.status}`,
    `Source: ${pullRequest.sourceRefName ?? "Unknown"}`,
    `Target: ${pullRequest.targetRefName ?? "Unknown"}`,
    `Author: ${author}`,
    `URL: ${pullRequest.webUrl ?? "Not available"}`,
    `Latest iteration: ${latestIterationId ?? "Not available"}`,
    "",
    "Description:",
    pullRequest.description?.trim() || "No description provided.",
    "",
    "Import summary:",
    `- Changed files: ${summary.changedFileCount}`,
    `- Imported files: ${summary.importedFileCount}`,
    `- Skipped files: ${summary.skippedFileCount}`,
    `- Truncated: ${truncated ? "yes" : "no"}`,
    "",
  ];

  if (warnings.length > 0) {
    lines.push("Warnings:");
    lines.push(warnings.map((warning) => `- ${warning}`).join("\n"));
    lines.push("");
  }

  lines.push(
    "Changed files:",
    changedFileLines,
    "",
    "Diff/content:",
    diffContent,
    "",
    "Review instructions:",
    "Focus on real bugs, regressions, security issues, type safety, performance, maintainability, missing tests, and edge cases.",
    "Avoid generic comments.",
    "If context is incomplete, mention uncertainty."
  );

  return lines.join("\n");
}

export async function fetchAzureFileContent({
  organization,
  project,
  repositoryId,
  path,
  versionDescriptor,
  accessToken,
}: {
  organization: string;
  project: string;
  repositoryId: string;
  path: string;
  versionDescriptor?: {
    versionType: "branch" | "commit";
    version: string;
  };
  accessToken: string;
}): Promise<string | null> {
  const normalizedOrganization = normalizeAzureOrganization(organization);
  const normalizedProject = normalizeAzureProject(project);
  const normalizedRepositoryId = normalizeAzureRepositoryId(repositoryId);

  if (!normalizedOrganization || !normalizedProject || !normalizedRepositoryId) {
    throw new AzureDevOpsRequestError(
      "Invalid Azure DevOps file content request.",
      400,
      "AZURE_INVALID_FILE_CONTENT_REQUEST"
    );
  }

  const query = new URLSearchParams({
    path,
    includeContent: "true",
    resolveLfs: "false",
    "api-version": "7.1",
  });

  if (versionDescriptor) {
    query.set("versionDescriptor.versionType", versionDescriptor.versionType);
    query.set("versionDescriptor.version", versionDescriptor.version);
  }

  let response: Response;

  try {
    response = await fetch(
      `https://dev.azure.com/${encodeURIComponent(
        normalizedOrganization
      )}/${encodeURIComponent(
        normalizedProject
      )}/_apis/git/repositories/${encodeURIComponent(
        normalizedRepositoryId
      )}/items?${query}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
        redirect: "manual",
      }
    );
  } catch {
    throw new AzureDevOpsRequestError(
      "Unable to reach Azure DevOps.",
      502,
      "AZURE_DEVOPS_NETWORK_ERROR"
    );
  }

  if (response.status === 404) {
    return null;
  }

  if (response.status >= 300 && response.status < 400) {
    throw new AzureDevOpsRequestError(
      "Azure DevOps redirected the request.",
      401,
      "AZURE_DEVOPS_UNAUTHORIZED"
    );
  }

  if (!response.ok) {
    throw new AzureDevOpsRequestError(
      "Azure DevOps returned an error.",
      response.status,
      "AZURE_DEVOPS_REQUEST_FAILED"
    );
  }

  let payload: AzureDevOpsItemContentResponse;

  try {
    payload = (await response.json()) as AzureDevOpsItemContentResponse;
  } catch {
    throw new AzureDevOpsRequestError(
      "Azure DevOps returned an invalid file content response.",
      502,
      "AZURE_DEVOPS_INVALID_RESPONSE"
    );
  }

  return typeof payload.content === "string" ? payload.content : null;
}

async function importChangedFileContent({
  organization,
  project,
  repositoryId,
  accessToken,
  changedFiles,
  sourceBranch,
  targetBranch,
  warnings,
}: {
  organization: string;
  project: string;
  repositoryId: string;
  accessToken: string;
  changedFiles: AzurePullRequestChangedFile[];
  sourceBranch: string | null;
  targetBranch: string | null;
  warnings: string[];
}) {
  const importedFiles: ImportedChangedFile[] = [];
  const diffBlocks: string[] = [];
  let importedFileCount = 0;
  let totalReviewCharacters = 0;
  let truncated = false;

  for (const file of changedFiles) {
    const importedFile: ImportedChangedFile = {
      ...file,
      diffBlock: null,
    };

    if (file.isFolder) {
      importedFile.skippedReason = "Folders are skipped.";
      importedFiles.push(importedFile);
      continue;
    }

    const skippedPathReason = getSkippedPathReason(file.path);

    if (skippedPathReason) {
      importedFile.skippedReason = skippedPathReason;
      addUniqueWarning(warnings, `Skipped ${file.path}: ${skippedPathReason}`);
      importedFiles.push(importedFile);
      continue;
    }

    if (importedFileCount >= maxFilesWithContent) {
      importedFile.skippedReason = `Only the first ${maxFilesWithContent} changed files are imported with content.`;
      addUniqueWarning(
        warnings,
        `Only the first ${maxFilesWithContent} changed files were imported with content.`
      );
      importedFiles.push(importedFile);
      continue;
    }

    if (truncated) {
      importedFile.skippedReason =
        "Context import limit was reached before this file.";
      importedFiles.push(importedFile);
      continue;
    }

    let oldContent: string | null = null;
    let newContent: string | null = null;
    const shouldFetchOld = !isAddedChange(file.changeType) && targetBranch;
    const shouldFetchNew = !isDeletedChange(file.changeType) && sourceBranch;

    try {
      if (shouldFetchOld && targetBranch) {
        oldContent = await fetchAzureFileContent({
          organization,
          project,
          repositoryId,
          path: file.path,
          versionDescriptor: {
            versionType: "branch",
            version: targetBranch,
          },
          accessToken,
        });
      }

      if (shouldFetchNew && sourceBranch) {
        newContent = await fetchAzureFileContent({
          organization,
          project,
          repositoryId,
          path: file.path,
          versionDescriptor: {
            versionType: "branch",
            version: sourceBranch,
          },
          accessToken,
        });
      }
    } catch {
      importedFile.skippedReason =
        "Unable to fetch file content from Azure DevOps.";
      addUniqueWarning(
        warnings,
        `Skipped ${file.path}: Azure DevOps did not return readable file content.`
      );
      importedFiles.push(importedFile);
      continue;
    }

    importedFile.oldContentAvailable = oldContent !== null;
    importedFile.newContentAvailable = newContent !== null;

    if (oldContent === null && newContent === null) {
      importedFile.skippedReason =
        "File content was not available from source or target branch.";
      addUniqueWarning(
        warnings,
        `Skipped ${file.path}: content was not available from source or target branch.`
      );
      importedFiles.push(importedFile);
      continue;
    }

    const largestContentLength = Math.max(
      oldContent?.length ?? 0,
      newContent?.length ?? 0
    );

    if (largestContentLength > maxFileCharacters) {
      importedFile.skippedReason = `File is larger than ${Math.round(
        maxFileCharacters / 1024
      )} KB.`;
      addUniqueWarning(
        warnings,
        `Skipped ${file.path}: file is larger than ${Math.round(
          maxFileCharacters / 1024
        )} KB.`
      );
      importedFiles.push(importedFile);
      continue;
    }

    if (
      (oldContent !== null && contentLooksBinary(oldContent)) ||
      (newContent !== null && contentLooksBinary(newContent))
    ) {
      importedFile.skippedReason = "File content appears to be binary.";
      addUniqueWarning(
        warnings,
        `Skipped ${file.path}: file content appears to be binary.`
      );
      importedFiles.push(importedFile);
      continue;
    }

    const block = createFileContextBlock({
      file,
      oldContent,
      newContent,
    });
    const remainingCharacters = maxReviewInputCharacters - totalReviewCharacters;

    if (remainingCharacters <= 0) {
      importedFile.skippedReason =
        "Context import limit was reached before this file.";
      truncated = true;
      importedFiles.push(importedFile);
      continue;
    }

    const truncatedBlock = truncateBlockToRemainingBudget(
      block,
      remainingCharacters
    );

    importedFile.imported = true;
    importedFile.diffAvailable = oldContent !== null && newContent !== null;
    importedFile.diffBlock = truncatedBlock.block;
    diffBlocks.push(truncatedBlock.block);
    totalReviewCharacters += truncatedBlock.block.length;
    importedFileCount += 1;

    if (truncatedBlock.truncated) {
      truncated = true;
      addUniqueWarning(
        warnings,
        "Context was truncated to stay within the configured import limit."
      );
    }

    importedFiles.push(importedFile);
  }

  return {
    changedFiles: importedFiles.map((file) => ({
      path: file.path,
      changeType: file.changeType,
      isFolder: file.isFolder,
      itemObjectId: file.itemObjectId,
      originalObjectId: file.originalObjectId,
      url: file.url,
      imported: file.imported,
      skippedReason: file.skippedReason,
      oldContentAvailable: file.oldContentAvailable,
      newContentAvailable: file.newContentAvailable,
      diffAvailable: file.diffAvailable,
    })),
    diffBlocks,
    truncated,
  };
}

export async function fetchAzureProjects({
  organization,
  accessToken,
}: {
  organization: string;
  accessToken: string;
}): Promise<AzureProject[]> {
  const normalizedOrganization = normalizeAzureOrganization(organization);

  if (!normalizedOrganization) {
    throw new AzureDevOpsRequestError(
      "Invalid Azure DevOps organization name.",
      400,
      "AZURE_INVALID_ORGANIZATION"
    );
  }

  const projects = await fetchAzureDevOpsList({
    url: `https://dev.azure.com/${encodeURIComponent(
      normalizedOrganization
    )}/_apis/projects?api-version=7.1`,
    accessToken,
    missingListMessage: "Azure DevOps response did not include a project list.",
  });

  return projects
    .map((project) => normalizeProject(project as AzureDevOpsProjectApiItem))
    .filter((project): project is AzureProject => Boolean(project));
}

export async function fetchAzureRepositories({
  organization,
  project,
  accessToken,
}: {
  organization: string;
  project: string;
  accessToken: string;
}): Promise<AzureRepository[]> {
  const normalizedOrganization = normalizeAzureOrganization(organization);
  const normalizedProject = normalizeAzureProject(project);

  if (!normalizedOrganization) {
    throw new AzureDevOpsRequestError(
      "Invalid Azure DevOps organization name.",
      400,
      "AZURE_INVALID_ORGANIZATION"
    );
  }

  if (!normalizedProject) {
    throw new AzureDevOpsRequestError(
      "Invalid Azure DevOps project name.",
      400,
      "AZURE_INVALID_PROJECT"
    );
  }

  const repositories = await fetchAzureDevOpsList({
    url: `https://dev.azure.com/${encodeURIComponent(
      normalizedOrganization
    )}/${encodeURIComponent(
      normalizedProject
    )}/_apis/git/repositories?api-version=7.1`,
    accessToken,
    missingListMessage:
      "Azure DevOps response did not include a repository list.",
  });

  return repositories
    .map((repository) =>
      normalizeRepository(repository as AzureDevOpsRepositoryApiItem)
    )
    .filter((repository): repository is AzureRepository => Boolean(repository));
}

export async function fetchAzurePullRequests({
  organization,
  project,
  repositoryId,
  accessToken,
  status = "active",
}: {
  organization: string;
  project: string;
  repositoryId: string;
  accessToken: string;
  status?: AzurePullRequestStatus;
}): Promise<AzurePullRequest[]> {
  const normalizedOrganization = normalizeAzureOrganization(organization);
  const normalizedProject = normalizeAzureProject(project);
  const normalizedRepositoryId = normalizeAzureRepositoryId(repositoryId);
  const normalizedStatus = normalizeAzurePullRequestStatus(status);

  if (!normalizedOrganization) {
    throw new AzureDevOpsRequestError(
      "Invalid Azure DevOps organization name.",
      400,
      "AZURE_INVALID_ORGANIZATION"
    );
  }

  if (!normalizedProject) {
    throw new AzureDevOpsRequestError(
      "Invalid Azure DevOps project name.",
      400,
      "AZURE_INVALID_PROJECT"
    );
  }

  if (!normalizedRepositoryId) {
    throw new AzureDevOpsRequestError(
      "Invalid Azure DevOps repository id.",
      400,
      "AZURE_INVALID_REPOSITORY"
    );
  }

  if (!normalizedStatus) {
    throw new AzureDevOpsRequestError(
      "Invalid Azure DevOps pull request status.",
      400,
      "AZURE_INVALID_PULL_REQUEST_STATUS"
    );
  }

  const pullRequests = await fetchAzureDevOpsList({
    url: `https://dev.azure.com/${encodeURIComponent(
      normalizedOrganization
    )}/${encodeURIComponent(
      normalizedProject
    )}/_apis/git/repositories/${encodeURIComponent(
      normalizedRepositoryId
    )}/pullrequests?searchCriteria.status=${encodeURIComponent(
      normalizedStatus
    )}&api-version=7.1`,
    accessToken,
    missingListMessage:
      "Azure DevOps response did not include a pull request list.",
  });

  return pullRequests
    .map((pullRequest) =>
      normalizePullRequest(pullRequest as AzureDevOpsPullRequestApiItem, {
        organization: normalizedOrganization,
        project: normalizedProject,
        fallbackRepositoryId: normalizedRepositoryId,
      })
    )
    .filter((pullRequest): pullRequest is AzurePullRequest =>
      Boolean(pullRequest)
    );
}

export async function fetchAzurePullRequestReviewContext({
  organization,
  project,
  repositoryId,
  pullRequestId,
  accessToken,
}: {
  organization: string;
  project: string;
  repositoryId: string;
  pullRequestId: number;
  accessToken: string;
}): Promise<AzurePullRequestReviewContext> {
  const normalizedOrganization = normalizeAzureOrganization(organization);
  const normalizedProject = normalizeAzureProject(project);
  const normalizedRepositoryId = normalizeAzureRepositoryId(repositoryId);

  if (!normalizedOrganization) {
    throw new AzureDevOpsRequestError(
      "Invalid Azure DevOps organization name.",
      400,
      "AZURE_INVALID_ORGANIZATION"
    );
  }

  if (!normalizedProject) {
    throw new AzureDevOpsRequestError(
      "Invalid Azure DevOps project name.",
      400,
      "AZURE_INVALID_PROJECT"
    );
  }

  if (!normalizedRepositoryId) {
    throw new AzureDevOpsRequestError(
      "Invalid Azure DevOps repository id.",
      400,
      "AZURE_INVALID_REPOSITORY"
    );
  }

  const encodedOrganization = encodeURIComponent(normalizedOrganization);
  const encodedProject = encodeURIComponent(normalizedProject);
  const encodedRepositoryId = encodeURIComponent(normalizedRepositoryId);
  const basePullRequestUrl = `https://dev.azure.com/${encodedOrganization}/${encodedProject}/_apis/git/repositories/${encodedRepositoryId}/pullRequests/${pullRequestId}`;

  const pullRequestPayload = await fetchAzureDevOpsJson({
    url: `${basePullRequestUrl}?api-version=7.1`,
    accessToken,
  });
  const pullRequest = normalizePullRequest(
    pullRequestPayload as AzureDevOpsPullRequestApiItem,
    {
      organization: normalizedOrganization,
      project: normalizedProject,
      fallbackRepositoryId: normalizedRepositoryId,
    }
  );

  if (!pullRequest) {
    throw new AzureDevOpsRequestError(
      "Azure DevOps response did not include pull request details.",
      502,
      "AZURE_DEVOPS_INVALID_RESPONSE"
    );
  }

  const iterations = await fetchAzureDevOpsList({
    url: `${basePullRequestUrl}/iterations?api-version=7.1`,
    accessToken,
    missingListMessage:
      "Azure DevOps response did not include pull request iterations.",
  });
  const iterationIds = iterations
    .map((iteration) =>
      normalizeIteration(iteration as AzureDevOpsIterationsApiItem)
    )
    .filter((iterationId): iterationId is number => iterationId !== null)
    .sort((left, right) => left - right);
  const latestIterationId = iterationIds.at(-1) ?? null;
  const warnings: string[] = [
    "File content is imported from source and target branch snapshots when available; exact Azure DevOps patch hunks may differ for complex renames or rebases.",
  ];
  let changedFiles: AzurePullRequestChangedFile[] = [];
  let diffBlocks: string[] = [];
  let truncated = false;

  if (latestIterationId === null) {
    warnings.push("Azure DevOps did not return a pull request iteration.");
  } else {
    const changesPayload = await fetchAzureDevOpsJson({
      url: `${basePullRequestUrl}/iterations/${latestIterationId}/changes?$top=${maxChangedEntries}&$skip=0&api-version=7.1`,
      accessToken,
    });
    const changes = getChangesArray(changesPayload);

    if (!changes) {
      throw new AzureDevOpsRequestError(
        "Azure DevOps response did not include pull request changes.",
        502,
        "AZURE_DEVOPS_INVALID_RESPONSE"
      );
    }

    changedFiles = changes
      .map((change) => normalizeChangedFile(change as AzureDevOpsChangesApiItem))
      .filter((file): file is AzurePullRequestChangedFile => Boolean(file));

    if (changes.length >= maxChangedEntries) {
      warnings.push(
        `Only the first ${maxChangedEntries} changed entries were imported from Azure DevOps.`
      );
    }

    const sourceBranch = normalizeBranchName(pullRequest.sourceRefName);
    const targetBranch = normalizeBranchName(pullRequest.targetRefName);

    if (!sourceBranch) {
      warnings.push(
        "New file content could not be fetched because the PR source branch was not available."
      );
    }

    if (!targetBranch) {
      warnings.push(
        "Old file content could not be fetched because the PR target branch was not available."
      );
    }

    const importedContext = await importChangedFileContent({
      organization: normalizedOrganization,
      project: normalizedProject,
      repositoryId: normalizedRepositoryId,
      accessToken,
      changedFiles,
      sourceBranch,
      targetBranch,
      warnings,
    });
    changedFiles = importedContext.changedFiles;
    diffBlocks = importedContext.diffBlocks;
    truncated = importedContext.truncated;
  }

  const repositoryName = pullRequest.repository?.name ?? null;
  const summary = {
    ...getChangedFilesSummary(changedFiles),
    truncated,
  };
  const reviewInput = buildReviewInput({
    organization: normalizedOrganization,
    project: normalizedProject,
    repositoryName,
    pullRequest,
    latestIterationId,
    changedFiles,
    diffBlocks,
    truncated,
    warnings,
  });

  return {
    source: "azure-devops",
    organization: normalizedOrganization,
    project: normalizedProject,
    repositoryId: normalizedRepositoryId,
    repositoryName,
    pullRequest: {
      id: pullRequest.pullRequestId,
      title: pullRequest.title,
      description: pullRequest.description,
      status: pullRequest.status,
      sourceRefName: pullRequest.sourceRefName,
      targetRefName: pullRequest.targetRefName,
      author:
        pullRequest.createdBy?.displayName ??
        pullRequest.createdBy?.uniqueName ??
        null,
      creationDate: pullRequest.creationDate,
      webUrl: pullRequest.webUrl,
    },
    latestIterationId,
    summary,
    changedFiles,
    reviewInput,
    warnings,
  };
}
