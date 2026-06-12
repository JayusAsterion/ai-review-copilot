import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    {
      error: "Server-side review preparation is not implemented yet.",
    },
    { status: 501 }
  );
}
