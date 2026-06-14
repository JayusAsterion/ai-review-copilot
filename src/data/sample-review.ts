import {
  combineGeneratedDiffs,
  generateMultiFileDiffs,
} from "@/lib/parsers/diff-parser";
import type { ReviewSourceFile } from "@/types/review";

export const sampleReviewContext =
  "This PR updates a React user lookup panel, API client, and shared user types. QA should verify loading, error, empty, and successful states before merge.";

const sampleOldUserProfile = `import { useEffect, useState } from "react";
import type { UserProfile } from "@/types/user";

type Props = {
  userId: string;
};

export function UserProfileCard(props: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/" + props.userId)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load user profile");
        }

        return response.json();
      })
      .then(setProfile)
      .catch((reason) => setError(String(reason)));
  }, [props.userId]);

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <section>
      <h2>{profile?.name}</h2>
      <p>{profile?.email}</p>
    </section>
  );
}`;

const sampleNewUserProfile = `import { useEffect, useState } from "react";

type Props = any;

export function UserProfileCard(props: Props) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    console.log("Loading profile", props.userId);

    fetch("http://localhost:3000/api/users/" + props.userId)
      .then((response) => response.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      });
  }, [props.userId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <section>
      <h2>{profile.name}</h2>
      <p>{profile.email}</p>
    </section>
  );
}`;

const sampleOldUsersApi = `import type { UserProfile } from "@/types/user";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function loadUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(\`\${apiBaseUrl}/api/users/\${userId}\`);

  if (!response.ok) {
    throw new Error("Unable to load user profile");
  }

  return response.json();
}`;

const sampleNewUsersApi = `import type { UserProfile } from "@/types/user";

export async function loadUserProfile(userId: string): Promise<UserProfile> {
  // TODO: replace local API before merge
  const response = await fetch("http://localhost:3000/api/users/" + userId);
  console.log("Loaded user response", response.status);

  return response.json();
}`;

const sampleOldUserTypes = `export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
};`;

const sampleNewUserTypes = `export type UserProfile = any;

// FIXME: restore strict user profile shape before release`;

export const sampleOldFiles: ReviewSourceFile[] = [
  {
    id: "sample-old-user-profile",
    name: "user-profile.tsx",
    path: "src/components/user-profile.tsx",
    language: "TypeScript React",
    size: sampleOldUserProfile.length,
    content: sampleOldUserProfile,
    version: "old",
  },
  {
    id: "sample-old-users-api",
    name: "users.ts",
    path: "src/api/users.ts",
    language: "TypeScript",
    size: sampleOldUsersApi.length,
    content: sampleOldUsersApi,
    version: "old",
  },
  {
    id: "sample-old-user-types",
    name: "user.ts",
    path: "src/types/user.ts",
    language: "TypeScript",
    size: sampleOldUserTypes.length,
    content: sampleOldUserTypes,
    version: "old",
  },
];

export const sampleNewFiles: ReviewSourceFile[] = [
  {
    id: "sample-new-user-profile",
    name: "user-profile.tsx",
    path: "src/components/user-profile.tsx",
    language: "TypeScript React",
    size: sampleNewUserProfile.length,
    content: sampleNewUserProfile,
    version: "new",
  },
  {
    id: "sample-new-users-api",
    name: "users.ts",
    path: "src/api/users.ts",
    language: "TypeScript",
    size: sampleNewUsersApi.length,
    content: sampleNewUsersApi,
    version: "new",
  },
  {
    id: "sample-new-user-types",
    name: "user.ts",
    path: "src/types/user.ts",
    language: "TypeScript",
    size: sampleNewUserTypes.length,
    content: sampleNewUserTypes,
    version: "new",
  },
];

export const sampleTextDiffFilePath = "src/components/user-profile.tsx";
export const sampleOldFileContent = sampleOldUserProfile;
export const sampleNewFileContent = sampleNewUserProfile;

export const sampleFilePath = sampleTextDiffFilePath;
export const sampleOldFile = sampleOldFileContent;
export const sampleNewFile = sampleNewFileContent;

export const sampleReviewDiff = combineGeneratedDiffs(
  generateMultiFileDiffs({
    oldFiles: sampleOldFiles,
    newFiles: sampleNewFiles,
  })
);
