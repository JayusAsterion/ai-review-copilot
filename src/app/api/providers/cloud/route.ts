import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    {
      error: "Cloud AI providers are not implemented yet.",
    },
    { status: 501 }
  );
}
