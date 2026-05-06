import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const bucketName = "brand-screenshots";
const screenshotTimeoutMs = 25_000;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

function normalizeWebsite(website: string) {
  const trimmed = website.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isAlreadyExistsError(message?: string) {
  return Boolean(message?.toLowerCase().includes("already") || message?.toLowerCase().includes("exist"));
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const supabase = getSupabaseAdmin();

  if (!adminPassword) {
    return jsonResponse({ success: false, error: "Admin password is not configured" }, 500);
  }

  if (!supabase) {
    return jsonResponse({ success: false, error: "Supabase service role is not configured" }, 500);
  }

  let body: { companyId?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid request body" }, 400);
  }

  const password = body.password || request.headers.get("x-admin-password") || "";
  if (password !== adminPassword) {
    return jsonResponse({ success: false, error: "Unauthorized" }, 401);
  }

  if (!body.companyId) {
    return jsonResponse({ success: false, error: "companyId is required" }, 400);
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug, website")
    .eq("id", body.companyId)
    .single();

  if (companyError || !company) {
    return jsonResponse({ success: false, error: companyError?.message || "Company not found" }, 404);
  }

  const website = normalizeWebsite(company.website || "");
  if (!website) {
    return jsonResponse({ success: false, error: "Company website is missing" }, 400);
  }

  const screenshotUrl = `https://image.thum.io/get/width/1200/${encodeURI(website)}`;
  let screenshotResponse: Response;

  try {
    screenshotResponse = await fetchWithTimeout(screenshotUrl, screenshotTimeoutMs);
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Screenshot API timed out"
        : error instanceof Error
          ? error.message
          : "Screenshot API request failed";
    return jsonResponse({ success: false, error: message }, 502);
  }

  if (!screenshotResponse.ok) {
    return jsonResponse({ success: false, error: `Screenshot API failed with status ${screenshotResponse.status}` }, 502);
  }

  const contentType = screenshotResponse.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("image/")) {
    return jsonResponse({ success: false, error: "Screenshot API did not return an image" }, 502);
  }

  const imageBuffer = Buffer.from(await screenshotResponse.arrayBuffer());
  if (imageBuffer.length === 0) {
    return jsonResponse({ success: false, error: "Screenshot API returned an empty image" }, 502);
  }

  const { error: bucketError } = await supabase.storage.createBucket(bucketName, { public: true });
  if (bucketError && !isAlreadyExistsError(bucketError.message)) {
    return jsonResponse({ success: false, error: bucketError.message }, 500);
  }

  const path = `${company.slug}.jpg`;
  const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, imageBuffer, {
    contentType: "image/jpeg",
    upsert: true
  });

  if (uploadError) {
    return jsonResponse({ success: false, error: uploadError.message }, 500);
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(bucketName).getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("companies")
    .update({ website_screenshot_url: publicUrl })
    .eq("id", company.id);

  if (updateError) {
    return jsonResponse({ success: false, error: updateError.message }, 500);
  }

  return jsonResponse({ success: true, website_screenshot_url: publicUrl, companyId: company.id });
}
