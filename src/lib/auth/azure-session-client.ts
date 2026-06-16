"use client";

import { signOut } from "next-auth/react";
import { toast } from "sonner";

let isSigningOutAfterAzureExpiry = false;

async function readJsonPayload(response: Response) {
  return response
    .clone()
    .json()
    .catch(() => null) as Promise<unknown>;
}

function getErrorCode(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const code = (payload as Record<string, unknown>).code;

  return typeof code === "string" ? code : null;
}

export async function fetchAzureApi(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  const response = await fetch(input, init);

  if (response.status !== 401) {
    return response;
  }

  const payload = await readJsonPayload(response);

  if (getErrorCode(payload) !== "AZURE_SESSION_EXPIRED") {
    return response;
  }

  if (!isSigningOutAfterAzureExpiry) {
    isSigningOutAfterAzureExpiry = true;
    toast.error(
      "Your Microsoft session expired. Please sign in again to continue using Azure DevOps."
    );
    void signOut({ callbackUrl: "/" });
  }

  return response;
}
