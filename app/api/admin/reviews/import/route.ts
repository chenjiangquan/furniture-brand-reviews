import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

type ImportReviewPayload = {
  brandId?: unknown;
  brandName?: unknown;
  rating?: unknown;
  title?: unknown;
  body?: unknown;
  reviewerName?: unknown;
  sourceType?: unknown;
  reviewDate?: unknown;
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status });
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function makeImportedReviewerEmail(companySlug: string, reviewerName: string) {
  const hash = createHash("sha256").update(`${companySlug}:${reviewerName}`).digest("hex").slice(0, 12);
  return `import+${companySlug}-${hash}@furniturebrandreviews.com`;
}

function parseReviewDate(value: unknown) {
  const rawDate = stringValue(value);
  const date = rawDate ? new Date(rawDate) : new Date();

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

export async function POST(request: Request) {
  const expectedApiKey = process.env.FBR_IMPORT_API_KEY;
  const authorization = request.headers.get("authorization");

  if (!expectedApiKey || authorization !== `Bearer ${expectedApiKey}`) {
    return jsonResponse({ success: false, message: "Unauthorized" }, 401);
  }

  let payload: ImportReviewPayload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ success: false, message: "Invalid JSON body" }, 400);
  }

  const brandId = stringValue(payload.brandId);
  const brandName = stringValue(payload.brandName);
  const rating = Number(payload.rating);
  const title = stringValue(payload.title) || "Customer review";
  const body = stringValue(payload.body);
  const reviewerName = stringValue(payload.reviewerName);
  const sourceType = stringValue(payload.sourceType) || "manual/import";
  const createdAt = parseReviewDate(payload.reviewDate);

  if (!brandId) return jsonResponse({ success: false, message: "brandId is required" }, 400);
  if (!brandName) return jsonResponse({ success: false, message: "brandName is required" }, 400);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return jsonResponse({ success: false, message: "Rating must be between 1 and 5" }, 400);
  }
  if (!body || body.length < 20) {
    return jsonResponse({ success: false, message: "Body must be at least 20 characters" }, 400);
  }
  if (!reviewerName) return jsonResponse({ success: false, message: "reviewerName is required" }, 400);
  if (!createdAt) return jsonResponse({ success: false, message: "reviewDate must be a valid date" }, 400);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonResponse({ success: false, message: "Supabase admin client is not configured" }, 500);
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("slug", brandId)
    .maybeSingle();

  if (companyError) {
    console.error("Import review brand lookup failed", companyError);
    return jsonResponse({ success: false, message: "Database lookup failed" }, 500);
  }

  if (!company) {
    return jsonResponse({ success: false, message: "Brand not found" }, 404);
  }

  const { data: existingReview, error: duplicateError } = await supabase
    .from("reviews")
    .select("id")
    .eq("company_id", company.id)
    .eq("reviewer_name", reviewerName)
    .eq("created_at", createdAt)
    .eq("content", body)
    .maybeSingle();

  if (duplicateError) {
    console.error("Import review duplicate check failed", duplicateError);
    return jsonResponse({ success: false, message: "Duplicate check failed" }, 500);
  }

  if (existingReview) {
    return jsonResponse({ success: true, duplicate: true, message: "Duplicate review skipped" }, 200);
  }

  const reviewPayload = {
    company_id: company.id,
    rating,
    title,
    content: body,
    reviewer_name: reviewerName,
    reviewer_email: makeImportedReviewerEmail(company.slug, reviewerName),
    order_number: sourceType,
    proof_image_url: null,
    review_image_urls: [],
    status: "approved",
    is_verified: false,
    created_at: createdAt
  };

  const { data: insertedReview, error: insertError } = await supabase
    .from("reviews")
    .insert(reviewPayload)
    .select("id")
    .single();

  if (insertError || !insertedReview) {
    console.error("Import review insert failed", insertError);
    return jsonResponse({ success: false, message: "Database write failed" }, 500);
  }

  return jsonResponse(
    {
      success: true,
      reviewId: insertedReview.id,
      message: "Review imported successfully"
    },
    200
  );
}
