import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Automatic screenshot generation is disabled. Upload a brand image manually from Admin Tools."
    },
    { status: 410 }
  );
}
