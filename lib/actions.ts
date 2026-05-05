"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getBrandImageCandidates } from "@/lib/brand-images";
import { parseCsv } from "@/lib/csv";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";
import type { Company } from "@/lib/types";

export type ReviewFormState = {
  ok: boolean;
  message: string;
};

export type ImportState = {
  ok: boolean;
  message: string;
  successCount: number;
  failureCount: number;
  errors: string[];
};

const initialImportResult: ImportState = {
  ok: false,
  message: "",
  successCount: 0,
  failureCount: 0,
  errors: []
};

function formatSupabaseError(error: unknown) {
  if (!error || typeof error !== "object") return "Unknown Supabase error.";

  const supabaseError = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };

  return [
    supabaseError.message,
    supabaseError.code ? `Code: ${supabaseError.code}` : null,
    supabaseError.details ? `Details: ${supabaseError.details}` : null,
    supabaseError.hint ? `Hint: ${supabaseError.hint}` : null
  ]
    .filter(Boolean)
    .join(" ");
}

function adminRedirect(password: string, params?: Record<string, string>): never {
  const searchParams = new URLSearchParams({ password, ...(params ?? {}) });
  redirect(`/admin/reviews?${searchParams.toString()}`);
}

export async function submitReview(slug: string, _state: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const reviewerName = String(formData.get("name") ?? "").trim();
  const reviewerEmail = String(formData.get("email") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim() || null;
  const proofImage = formData.get("proofImage");

  if (!rating || rating < 1 || rating > 5 || !title || !content || !reviewerName || !reviewerEmail) {
    return { ok: false, message: "Please complete all required fields before submitting." };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured yet. Add the Supabase environment variables and try again."
    };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug, website, category, description, logo_url, favicon_url, og_image_url, average_rating, review_count")
    .eq("slug", slug)
    .single<Company>();

  if (companyError || !company) {
    console.error(
      "Supabase company lookup failed",
      JSON.stringify(
        {
          slug,
          error: companyError,
          message: companyError ? formatSupabaseError(companyError) : "No company returned"
        },
        null,
        2
      )
    );
    return {
      ok: false,
      message: `Could not find this company in Supabase. ${companyError ? formatSupabaseError(companyError) : ""}`.trim()
    };
  }

  let proofImageUrl: string | null = null;
  if (proofImage instanceof File && proofImage.size > 0) {
    const extension = proofImage.name.split(".").pop() || "jpg";
    const path = `${company.slug}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("review-proof").upload(path, proofImage, {
      contentType: proofImage.type
    });
    if (!uploadError) {
      const { data } = supabase.storage.from("review-proof").getPublicUrl(path);
      proofImageUrl = data.publicUrl;
    }
  }

  const reviewPayload = {
    company_id: company.id,
    rating,
    title,
    content,
    reviewer_name: reviewerName,
    reviewer_email: reviewerEmail,
    order_number: orderNumber,
    proof_image_url: proofImageUrl,
    status: "pending",
    is_verified: false
  };

  const { error } = await supabase.from("reviews").insert(reviewPayload);

  if (error) {
    console.error(
      "Supabase review insert failed",
      JSON.stringify(
        {
          company: { id: company.id, slug: company.slug, name: company.name },
          payload: { ...reviewPayload, reviewer_email: "[redacted]" },
          error,
          message: formatSupabaseError(error)
        },
        null,
        2
      )
    );
    return { ok: false, message: `Review insert failed: ${formatSupabaseError(error)}` };
  }

  revalidatePath("/admin/reviews");

  return {
    ok: true,
    message: "Thank you. Your review has been submitted and will be checked before publishing."
  };
}

export async function moderateReview(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const reviewId = String(formData.get("reviewId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/reviews?error=1");
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) adminRedirect(password, { error: "Supabase is not configured yet." });

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id, company_id, status, is_verified, companies(slug)")
    .eq("id", reviewId)
    .single();

  if (reviewError || !review) {
    const message = reviewError ? formatSupabaseError(reviewError) : "Review not found.";
    console.error("Supabase admin review lookup failed", { reviewId, message, error: reviewError });
    adminRedirect(password, { error: message });
  }

  let updatePayload: { status?: "approved" | "rejected"; is_verified?: boolean } | null = null;

  if (action === "approve") {
    updatePayload = { status: "approved" };
  }

  if (action === "reject") {
    updatePayload = { status: "rejected" };
  }

  if (action === "verify") {
    updatePayload = { is_verified: true };
  }

  if (!updatePayload) {
    adminRedirect(password, { error: "Unknown moderation action." });
  }

  const { error: updateError } = await supabase.from("reviews").update(updatePayload).eq("id", reviewId);

  if (updateError) {
    const message = formatSupabaseError(updateError);
    console.error("Supabase admin review update failed", {
      reviewId,
      action,
      updatePayload,
      message,
      error: updateError
    });
    adminRedirect(password, { error: message });
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath("/brands");

  const companyRelation = Array.isArray(review.companies) ? review.companies[0] : review.companies;
  if (companyRelation?.slug) {
    revalidatePath(`/review/${companyRelation.slug}`);
  }

  adminRedirect(password);
}

export async function importCsv(_state: ImportState, formData: FormData): Promise<ImportState> {
  const password = String(formData.get("password") ?? "");
  const importType = String(formData.get("importType") ?? "");
  const defaultStatus = String(formData.get("defaultStatus") ?? "pending");
  const csvText = String(formData.get("csvText") ?? "").trim();

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { ...initialImportResult, message: "Invalid admin password." };
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) {
    return { ...initialImportResult, message: "Supabase is not configured yet." };
  }

  const rows = parseCsv(csvText);
  if (rows.length === 0) {
    return { ...initialImportResult, message: "CSV is empty or invalid." };
  }

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  if (importType === "companies") {
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const website = row.website;
      if (!row.name || !row.slug || !website || !row.category) {
        failureCount += 1;
        errors.push(`Row ${index + 2}: missing required company fields.`);
        continue;
      }

      const candidates = await getBrandImageCandidates(website);
      const payload = {
        name: row.name,
        slug: row.slug,
        website,
        category: row.category,
        description: row.description || null,
        logo_url: row.logo_url || candidates.logoUrl || null,
        favicon_url: candidates.faviconUrl,
        og_image_url: candidates.ogImageUrl
      };

      const { error } = await supabase.from("companies").upsert(payload, { onConflict: "slug" });
      if (error) {
        failureCount += 1;
        errors.push(`Row ${index + 2}: ${formatSupabaseError(error)}`);
      } else {
        successCount += 1;
      }
    }
  } else if (importType === "reviews") {
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const status = (row.status || defaultStatus) as "pending" | "approved";
      const createdAt = row.created_at || new Date().toISOString();
      const rating = Number(row.rating);

      if (!row.company_slug || !rating || !row.title || !row.content || !row.reviewer_name || !row.reviewer_email) {
        failureCount += 1;
        errors.push(`Row ${index + 2}: missing required review fields.`);
        continue;
      }

      if (!["pending", "approved"].includes(status)) {
        failureCount += 1;
        errors.push(`Row ${index + 2}: status must be pending or approved.`);
        continue;
      }

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id, slug")
        .eq("slug", row.company_slug)
        .single();

      if (companyError || !company) {
        failureCount += 1;
        errors.push(`Row ${index + 2}: company not found for slug ${row.company_slug}.`);
        continue;
      }

      const { data: existing, error: existingError } = await supabase
        .from("reviews")
        .select("id")
        .eq("company_id", company.id)
        .eq("title", row.title)
        .eq("reviewer_email", row.reviewer_email)
        .eq("created_at", createdAt)
        .maybeSingle();

      if (existingError) {
        failureCount += 1;
        errors.push(`Row ${index + 2}: duplicate check failed. ${formatSupabaseError(existingError)}`);
        continue;
      }

      if (existing) {
        failureCount += 1;
        errors.push(`Row ${index + 2}: duplicate review skipped.`);
        continue;
      }

      const { error } = await supabase.from("reviews").insert({
        company_id: company.id,
        rating,
        title: row.title,
        content: row.content,
        reviewer_name: row.reviewer_name,
        reviewer_email: row.reviewer_email,
        order_number: row.order_number || null,
        proof_image_url: null,
        status,
        is_verified: ["true", "1", "yes"].includes((row.is_verified || "").toLowerCase()),
        created_at: createdAt
      });

      if (error) {
        failureCount += 1;
        errors.push(`Row ${index + 2}: ${formatSupabaseError(error)}`);
      } else {
        successCount += 1;
      }
    }
  } else {
    return { ...initialImportResult, message: "Choose companies or reviews import type." };
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath("/admin/import");

  return {
    ok: failureCount === 0,
    message: `Import finished. Success: ${successCount}. Failed: ${failureCount}.`,
    successCount,
    failureCount,
    errors: errors.slice(0, 20)
  };
}
