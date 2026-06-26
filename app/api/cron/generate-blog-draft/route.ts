import { NextResponse } from "next/server";
import { runBlogAutoDraft } from "@/lib/blog-auto-draft";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isAuthorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

async function handleCronRequest(request: Request) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.BLOG_AUTO_DRAFT_ENABLED === "false") {
    return NextResponse.json({
      success: false,
      skipped: true,
      error: "Blog auto draft generation is disabled"
    });
  }

  const result = await runBlogAutoDraft();
  const status = result.success || result.skipped ? 200 : 500;
  return NextResponse.json(result, { status });
}

export async function GET(request: Request) {
  return handleCronRequest(request);
}

export async function POST(request: Request) {
  return handleCronRequest(request);
}
