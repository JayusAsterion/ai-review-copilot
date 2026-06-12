import { generateUnifiedDiff } from "@/lib/parsers/diff-parser";

export const sampleReviewContext =
  "This PR updates a React user lookup panel to fetch profile data from a local API. QA should verify loading, error, empty, and successful states before merge.";

export const sampleFilePath = "src/components/user-profile.tsx";

export const sampleOldFile = `import { useEffect, useState } from "react";

type Props = {
  userId: string;
};

export function UserProfile(props: Props) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch("/api/users/" + props.userId)
      .then((response) => response.json())
      .then(setProfile);
  }, [props.userId]);

  return (
    <section>
      <h2>{profile?.name}</h2>
    </section>
  );
}`;

export const sampleNewFile = `import { useEffect, useState } from "react";

type Props = any;

export function UserProfile(props: Props) {
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

export const sampleReviewDiff = generateUnifiedDiff({
  oldContent: sampleOldFile,
  newContent: sampleNewFile,
  filePath: sampleFilePath,
});
