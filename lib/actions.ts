"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getBrandImageCandidates } from "@/lib/brand-images";
import { createAutoReplyForReview } from "@/lib/auto-reply";
import { parseCsv } from "@/lib/csv";
import {
  sendAdminBusinessClaimNotificationEmail,
  sendBusinessClaimApprovedEmail,
  sendBusinessClaimSubmittedEmail,
  sendBusinessLoginLinkEmail,
  sendBusinessPasswordResetEmail,
  sendBusinessReviewInvitationEmail,
  sendAdminNewReviewNotificationEmail,
  sendReviewApprovedEmail,
  sendReviewSubmittedEmail
} from "@/lib/email";
import { slugifyBrandName } from "@/lib/slug";
import { siteUrl } from "@/lib/seo";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";
import {
  createBusinessLoginToken,
  createBusinessPasswordResetToken,
  createBusinessSessionForPassword,
  hasBusinessTokenAccess,
  setBusinessPassword,
  verifySignedPasswordResetToken
} from "@/lib/business";
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

export type BusinessFlagState = {
  ok: boolean;
  message: string;
};

export type BusinessReplyState = {
  ok: boolean;
  message: string;
};

export type BusinessVerifyState = {
  ok: boolean;
  message: string;
};

export type BusinessAutoReplyState = {
  ok: boolean;
  message: string;
};

export type BusinessInvitationState = {
  ok: boolean;
  message: string;
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

function validateAdminPassword(password: string): ImportState | null {
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { ...initialImportResult, message: "Invalid admin password." };
  }

  return null;
}

function getAdminSupabaseClient() {
  return getSupabaseAdmin() ?? getSupabase();
}

function isValidReviewStatus(status: string): status is "pending" | "approved" | "rejected" {
  return ["pending", "approved", "rejected"].includes(status);
}

function parseBooleanValue(value: string | undefined) {
  return ["true", "1", "yes", "y"].includes((value || "").toLowerCase());
}

function normalizeEmailInput(value: string) {
  return value.trim().toLowerCase();
}

function hashReviewInvitationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function normalizeWebsiteInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return trimmed;
  }
}

function safeStorageFilename(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || `brand-logo-${Date.now()}.jpg`;
}

async function uploadBusinessLogoFile(file: File, companySlug: string) {
  if (!file || file.size === 0) return null;

  if (!file.type.startsWith("image/")) {
    return { error: "Logo upload must be an image file." };
  }

  if (file.size > 1024 * 1024) {
    return { error: "Logo image must be under 1MB." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "Supabase Storage is not configured." };

  const filename = safeStorageFilename(file.name);
  const path = `${companySlug || "brand"}-${Date.now()}-${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("brand-logos").upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: true
  });

  if (uploadError) return { error: formatSupabaseError(uploadError) };

  const { data } = supabase.storage.from("brand-logos").getPublicUrl(path);
  return { url: data.publicUrl };
}

function extractClaimWebsite(message?: string | null) {
  if (!message) return "";
  const websiteLine = message.match(/website:\s*([^\s]+)/i);
  return normalizeWebsiteInput(websiteLine?.[1] ?? "");
}

function businessRedirect(email: string, companySlug?: string | null, params?: Record<string, string>): never {
  const searchParams = new URLSearchParams({ email, ...(companySlug ? { company: companySlug } : {}), ...(params ?? {}) });
  redirect(`/business/dashboard?${searchParams.toString()}`);
}

function getBusinessToken(formData: FormData) {
  return String(formData.get("businessToken") ?? "").trim();
}

async function hasBusinessFormAccess(email: string, companyId: string, token: string) {
  if (!email || !companyId || !token) return false;
  return hasBusinessTokenAccess(email, companyId, token);
}

function businessClaimsAdminRedirect(password: string, params?: Record<string, string>): never {
  const searchParams = new URLSearchParams({ password, ...(params ?? {}) });
  redirect(`/admin/business-claims?${searchParams.toString()}`);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hasSpamPattern(value: string) {
  const lower = value.toLowerCase();
  const spamKeywords = ["casino", "crypto giveaway", "free money", "viagra", "loan offer", "click here now"];
  const repeatedCharacter = /(.)\1{14,}/i.test(value);
  const repeatedWords = /\b(\w+)\b(?:\s+\1\b){5,}/i.test(lower);

  return repeatedCharacter || repeatedWords || spamKeywords.some((keyword) => lower.includes(keyword));
}

function getHostnameFromWebsite(value: string) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isValidBusinessClaimWebsite(value: string) {
  const hostname = getHostnameFromWebsite(value);
  return Boolean(hostname && hostname.includes(".") && !/\s/.test(hostname));
}

function looksLikeRandomToken(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 10 || /\s/.test(trimmed)) return false;

  const letters = trimmed.replace(/[^a-z]/gi, "");
  if (letters.length < 10) return false;

  const upperCount = (letters.match(/[A-Z]/g) || []).length;
  const lowerCount = (letters.match(/[a-z]/g) || []).length;
  const vowelCount = (letters.match(/[aeiou]/gi) || []).length;
  const vowelRatio = vowelCount / letters.length;
  const caseTransitions = (letters.match(/[a-z][A-Z]|[A-Z][a-z]/g) || []).length;
  const mixedCaseLooksGenerated = upperCount >= 3 && lowerCount >= 3 && (caseTransitions >= 4 || vowelRatio < 0.32);
  const consonantHeavyLooksGenerated = letters.length >= 12 && vowelRatio < 0.2;

  return mixedCaseLooksGenerated || consonantHeavyLooksGenerated;
}

function looksLikeGeneratedIdentifier(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 10 || /\s/.test(trimmed)) return false;

  const compact = trimmed.replace(/[^a-z0-9]/gi, "");
  if (compact.length < 10) return false;

  const letters = compact.replace(/[^a-z]/gi, "");
  if (letters.length < 10) return false;

  const upperCount = (letters.match(/[A-Z]/g) || []).length;
  const lowerCount = (letters.match(/[a-z]/g) || []).length;
  const caseTransitions = (letters.match(/[a-z][A-Z]|[A-Z][a-z]/g) || []).length;
  const vowelCount = (letters.match(/[aeiou]/gi) || []).length;
  const vowelRatio = vowelCount / letters.length;

  return upperCount >= 2 && lowerCount >= 4 && (caseTransitions >= 3 || vowelRatio < 0.24);
}

function looksLikeRandomDomainLabel(value: string) {
  const label = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (label.length < 6 || label.length > 20) return false;

  const furnitureWords = /(furn|sofa|bed|home|decor|interior|table|chair|living|design|wood|mattress|garden|office|kitchen|wardrobe|lighting)/;
  if (furnitureWords.test(label)) return false;

  const letters = label.replace(/[^a-z]/g, "");
  if (letters.length < 6) return false;

  const vowelCount = (letters.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowelCount / letters.length;
  const longConsonantCluster = /[bcdfghjklmnpqrstvwxyz]{5,}/.test(letters);

  return vowelRatio < 0.24 || longConsonantCluster;
}

function scoreBusinessClaimSpam(input: {
  brandName: string;
  companyId: string | null;
  website: string;
  contactName: string;
  contactEmail: string;
  message: string;
  honeypot: string;
}) {
  const reasons: string[] = [];
  const hostname = getHostnameFromWebsite(input.website);
  const domainLabel = hostname.split(".")[0] ?? "";
  const emailLocalPart = input.contactEmail.split("@")[0] ?? "";
  const emailDomain = input.contactEmail.split("@")[1] ?? "";

  if (input.honeypot.trim()) reasons.push("honeypot");
  if (!isValidBusinessClaimWebsite(input.website)) reasons.push("invalid website");
  if (looksLikeRandomToken(input.brandName) || looksLikeGeneratedIdentifier(input.brandName)) reasons.push("random brand name");
  if (looksLikeRandomToken(input.contactName) || looksLikeGeneratedIdentifier(input.contactName)) reasons.push("random contact name");
  if (looksLikeRandomToken(input.message) || looksLikeGeneratedIdentifier(input.message)) reasons.push("random message");
  if (looksLikeRandomToken(emailLocalPart.replace(/[._-]/g, "")) || looksLikeGeneratedIdentifier(emailLocalPart.replace(/[._-]/g, ""))) {
    reasons.push("random email local part");
  }
  if (looksLikeRandomDomainLabel(domainLabel) || looksLikeRandomToken(domainLabel) || looksLikeGeneratedIdentifier(domainLabel)) {
    reasons.push("random website domain");
  }
  if (hasSpamPattern(`${input.brandName} ${input.contactName} ${input.message}`)) reasons.push("known spam pattern");

  const freeEmailDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com", "proton.me", "protonmail.com"];
  if (freeEmailDomains.includes(emailDomain) && (looksLikeRandomDomainLabel(domainLabel) || looksLikeRandomToken(domainLabel) || looksLikeGeneratedIdentifier(domainLabel))) {
    reasons.push("free email with random website");
  }

  const randomReasonCount = reasons.filter((reason) => reason.includes("random")).length;
  const unmatchedProfile = !input.companyId;

  return {
    isSpam:
      reasons.includes("honeypot") ||
      randomReasonCount >= 2 ||
      (unmatchedProfile && randomReasonCount >= 1 && reasons.includes("random website domain")) ||
      reasons.length >= 3,
    reasons
  };
}

function scoreReviewSpam(input: {
  brandName?: string;
  brandWebsite?: string;
  title: string;
  content: string;
  reviewerName: string;
  reviewerEmail: string;
  honeypot: string;
}) {
  const reasons: string[] = [];
  const emailLocalPart = input.reviewerEmail.split("@")[0] ?? "";
  const text = `${input.brandName ?? ""} ${input.title} ${input.content} ${input.reviewerName}`;

  if (input.honeypot.trim()) reasons.push("honeypot");
  if (input.brandWebsite && !isValidBusinessClaimWebsite(input.brandWebsite)) reasons.push("invalid brand website");
  if (input.brandName && (looksLikeRandomToken(input.brandName) || looksLikeGeneratedIdentifier(input.brandName))) reasons.push("random brand name");
  if (looksLikeRandomToken(input.title) || looksLikeGeneratedIdentifier(input.title)) reasons.push("random title");
  if (looksLikeRandomToken(input.reviewerName) || looksLikeGeneratedIdentifier(input.reviewerName)) reasons.push("random reviewer name");
  if (looksLikeRandomToken(emailLocalPart.replace(/[._-]/g, "")) || looksLikeGeneratedIdentifier(emailLocalPart.replace(/[._-]/g, ""))) {
    reasons.push("random email local part");
  }
  if (hasSpamPattern(text)) reasons.push("known spam pattern");

  const compactContent = input.content.replace(/\s+/g, "");
  if (compactContent.length >= 40 && (looksLikeRandomToken(compactContent.slice(0, 40)) || looksLikeGeneratedIdentifier(compactContent.slice(0, 40)))) {
    reasons.push("random review content");
  }

  const randomReasonCount = reasons.filter((reason) => reason.includes("random")).length;

  return {
    isSpam:
      reasons.includes("honeypot") ||
      reasons.includes("random brand name") ||
      reasons.includes("random title") ||
      reasons.includes("random review content") ||
      randomReasonCount >= 2 ||
      reasons.length >= 3,
    reasons
  };
}

async function hasRecentBusinessClaimDuplicate(input: {
  contactEmail: string;
  brandName: string;
  website: string;
}) {
  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return false;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const hostname = getHostnameFromWebsite(input.website);

  const { data, error } = await supabase
    .from("business_claims")
    .select("brand_name, message, created_at")
    .eq("contact_email", input.contactEmail)
    .gte("created_at", since)
    .limit(20);

  if (error) {
    console.warn("Business claim duplicate check failed", formatSupabaseError(error));
    return false;
  }

  return (data ?? []).some((claim) => {
    const claimBrandName = String(claim.brand_name ?? "").trim().toLowerCase();
    const claimWebsite = extractClaimWebsite(String(claim.message ?? ""));
    return claimBrandName === input.brandName.toLowerCase() || getHostnameFromWebsite(claimWebsite) === hostname;
  });
}

export async function requestBusinessLoginLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    redirect("/business/login?error=invalid-email");
  }

  const loginToken = await createBusinessLoginToken(email);
  if (!loginToken) {
    redirect(`/business/login?email=${encodeURIComponent(email)}&error=no-approved-claim`);
  }

  const loginUrl = `${siteUrl}/business/dashboard?email=${encodeURIComponent(email)}&token=${encodeURIComponent(loginToken.token)}`;
  const emailSent = await sendBusinessLoginLinkEmail({
    to: email,
    loginUrl,
    expiresAt: loginToken.expiresAt
  });

  if (!emailSent) {
    redirect(`/business/login?email=${encodeURIComponent(email)}&error=email-not-sent`);
  }

  redirect(`/business/login?email=${encodeURIComponent(email)}&sent=1`);
}

export async function loginBusinessWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email)) {
    redirect("/business/login?error=invalid-email");
  }

  const session = await createBusinessSessionForPassword(email, password);
  if (!session) {
    redirect(`/business/login?email=${encodeURIComponent(email)}&error=invalid-password`);
  }

  redirect(`/business/dashboard?email=${encodeURIComponent(email)}&token=${encodeURIComponent(session.token)}`);
}

export async function requestBusinessPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    redirect("/business/reset-password?error=invalid-email");
  }

  const resetToken = await createBusinessPasswordResetToken(email);
  if (!resetToken) {
    redirect(`/business/reset-password?email=${encodeURIComponent(email)}&error=no-approved-claim`);
  }

  const resetUrl = `${siteUrl}/business/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken.token)}`;
  const emailSent = await sendBusinessPasswordResetEmail({
    to: email,
    resetUrl,
    expiresAt: resetToken.expiresAt
  });

  if (!emailSent) {
    redirect(`/business/reset-password?email=${encodeURIComponent(email)}&error=email-not-sent`);
  }

  redirect(`/business/reset-password?email=${encodeURIComponent(email)}&sent=1`);
}

export async function resetBusinessPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!isValidEmail(email) || !token || !verifySignedPasswordResetToken(email, token)) {
    redirect("/business/reset-password?error=invalid-token");
  }

  if (password !== confirmPassword) {
    redirect(`/business/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&error=password-mismatch`);
  }

  const result = await setBusinessPassword(email, password);
  if (!result.ok) {
    redirect(`/business/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&error=${encodeURIComponent(result.message)}`);
  }

  redirect(`/business/login?email=${encodeURIComponent(email)}&passwordSet=1`);
}

function validateReviewInput({
  rating,
  title,
  content,
  reviewerName,
  reviewerEmail,
  confirmed
}: {
  rating: number;
  title: string;
  content: string;
  reviewerName: string;
  reviewerEmail: string;
  confirmed: boolean;
}) {
  if (!rating || rating < 1 || rating > 5) return "Please choose an overall rating.";
  if (title.length < 5) return "Review title must be at least 5 characters.";
  if (content.length < 50) return "Review content must be at least 50 characters.";
  if (!reviewerName) return "Please enter your display name.";
  if (!isValidEmail(reviewerEmail)) return "Please enter a valid email address.";
  if (!confirmed) return "Please confirm this review is based on your genuine experience.";
  if (hasSpamPattern(`${title} ${content}`)) return "This review looks like spam. Please edit it and try again.";

  return "";
}

async function hasRecentReviewSubmission(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  companyId: string | null,
  pendingBrandSlug: string | null,
  reviewerEmail: string
) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let query = supabase
    .from("reviews")
    .select("id")
    .eq("reviewer_email", reviewerEmail)
    .gte("created_at", since)
    .limit(1);

  query = companyId ? query.eq("company_id", companyId) : query.eq("pending_brand_slug", pendingBrandSlug);

  const { data, error } = await query;
  if (error) {
    console.warn("Recent review duplicate check failed", formatSupabaseError(error));
    return false;
  }

  return Boolean(data?.length);
}

const allowedReviewImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxReviewImageCount = 5;
const maxReviewImageSize = 5 * 1024 * 1024;

function getReviewImages(formData: FormData) {
  return formData
    .getAll("reviewImages")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function getSafeFileName(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || `${crypto.randomUUID()}.jpg`;
}

async function uploadReviewImages(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  files: File[],
  folder: string
): Promise<{ ok: true; urls: string[] } | { ok: false; message: string }> {
  if (files.length === 0) return { ok: true, urls: [] };

  if (files.length > maxReviewImageCount) {
    return { ok: false, message: "Please upload no more than 5 photos." };
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!allowedReviewImageTypes.has(file.type)) {
      return { ok: false, message: "Review photos must be JPEG, PNG or WebP images." };
    }

    if (file.size > maxReviewImageSize) {
      return { ok: false, message: "Each review photo must be 5MB or smaller." };
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(extension) ? extension : "jpg";
    const safeFileName = getSafeFileName(file.name.replace(/\.[^.]+$/, ""));
    const path = `${folder}/${safeFileName}-${crypto.randomUUID()}.${safeExtension}`;
    const { error: uploadError } = await supabase.storage.from("review-images").upload(path, file, {
      contentType: file.type,
      upsert: false
    });

    if (uploadError) {
      console.error("Supabase review image upload failed", uploadError);
      return { ok: false, message: "Review image upload failed. Please try again." };
    }

    const { data } = supabase.storage.from("review-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return { ok: true, urls };
}

async function markReviewEmailSent(reviewId: string, field: "submitted_email_sent_at" | "approved_email_sent_at") {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase.from("reviews").update({ [field]: new Date().toISOString() }).eq("id", reviewId);
  if (error) {
    console.warn(`Could not update ${field}.`, formatSupabaseError(error));
  }
}

async function validateReviewInvitation(companyId: string, reviewerEmail: string, invitationToken: string) {
  const token = invitationToken.trim();
  if (!token) return { ok: true as const, isVerified: false, invitationId: null };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false as const, message: "Review invitation verification is not configured." };
  }

  const { data: invitation, error } = await supabase
    .from("review_invitations")
    .select("id, company_id, customer_email, status, expires_at, used_at")
    .eq("token_hash", hashReviewInvitationToken(token))
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    console.error("Review invitation lookup failed", error);
    return { ok: false as const, message: "Review invitation could not be verified." };
  }

  if (!invitation) return { ok: false as const, message: "This review invitation link is not valid." };
  if (invitation.status !== "pending" || invitation.used_at) return { ok: false as const, message: "This review invitation link has already been used." };
  if (invitation.expires_at && new Date(invitation.expires_at).getTime() <= Date.now()) {
    return { ok: false as const, message: "This review invitation link has expired." };
  }

  if (normalizeEmailInput(invitation.customer_email) !== normalizeEmailInput(reviewerEmail)) {
    return { ok: false as const, message: "Please submit the review using the email address that received this invitation." };
  }

  return { ok: true as const, isVerified: true, invitationId: invitation.id as string };
}

async function markReviewInvitationUsed(invitationId: string | null, reviewId: string | null) {
  if (!invitationId || !reviewId) return;
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase
    .from("review_invitations")
    .update({
      status: "used",
      used_at: new Date().toISOString(),
      review_id: reviewId
    })
    .eq("id", invitationId);

  if (error) console.warn("Could not mark review invitation as used.", formatSupabaseError(error));
}

export async function submitReview(slug: string, _state: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const reviewerName = String(formData.get("name") ?? "").trim();
  const reviewerEmail = String(formData.get("email") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim() || null;
  const productType = String(formData.get("productType") ?? "").trim() || null;
  const orderMonth = String(formData.get("orderMonth") ?? "").trim() || null;
  const deliveryExperience = String(formData.get("deliveryExperience") ?? "").trim() || null;
  const customerServiceExperience = String(formData.get("customerServiceExperience") ?? "").trim() || null;
  const wouldBuyAgain = String(formData.get("wouldBuyAgain") ?? "").trim() || null;
  const confirmedGenuineExperience = formData.get("confirmedGenuineExperience") === "on";
  const invitationToken = String(formData.get("invitationToken") ?? "").trim();
  const honeypot = String(formData.get("reviewWebsite") ?? "").trim();
  const proofImage = formData.get("proofImage");
  const reviewImages = getReviewImages(formData);
  console.log("Selected review images:", reviewImages.length);

  const validationMessage = validateReviewInput({
    rating,
    title,
    content,
    reviewerName,
    reviewerEmail,
    confirmed: confirmedGenuineExperience
  });
  if (validationMessage) return { ok: false, message: validationMessage };

  const spamCheck = scoreReviewSpam({
    title,
    content,
    reviewerName,
    reviewerEmail,
    honeypot
  });
  if (spamCheck.isSpam) {
    console.warn("Blocked spam review submission", { slug, reviewerEmail, reasons: spamCheck.reasons });
    return {
      ok: true,
      message: "Thanks for your review. It will be checked before publication."
    };
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured yet. Add the Supabase environment variables and try again."
    };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug, website, category, description, logo_url, favicon_url, og_image_url, cover_image_url, website_screenshot_url, average_rating, review_count")
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

  if (await hasRecentReviewSubmission(supabase, company.id, null, reviewerEmail)) {
    return { ok: false, message: "You have already submitted a review for this brand in the last 24 hours." };
  }

  const invitationResult = await validateReviewInvitation(company.id, reviewerEmail, invitationToken);
  if (!invitationResult.ok) return { ok: false, message: invitationResult.message };

  const reviewImageUpload = await uploadReviewImages(supabase, reviewImages, `${company.slug}/${Date.now()}`);
  if (!reviewImageUpload.ok) {
    return { ok: false, message: reviewImageUpload.message };
  }
  console.log("Uploaded review image urls:", reviewImageUpload.urls);

  let proofImageUrl: string | null = reviewImageUpload.urls[0] ?? null;
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
    product_type: productType,
    order_month: orderMonth,
    delivery_experience: deliveryExperience,
    customer_service_experience: customerServiceExperience,
    would_buy_again: wouldBuyAgain,
    proof_image_url: proofImageUrl,
    review_image_urls: reviewImageUpload.urls,
    status: "pending",
    is_verified: invitationResult.isVerified
  };
  console.log("Inserted review payload review_image_urls:", reviewPayload.review_image_urls);

  const { data: insertedReview, error } = await supabase.from("reviews").insert(reviewPayload).select("id").single();

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

  await markReviewInvitationUsed(invitationResult.invitationId, insertedReview?.id ?? null);

  await sendReviewSubmittedEmail({
    to: reviewerEmail,
    reviewerName,
    brandName: company.name
  });
  await sendAdminNewReviewNotificationEmail({
    brandName: company.name,
    rating,
    title,
    reviewerName,
    reviewerEmail
  });

  revalidatePath("/admin/reviews");

  return {
    ok: true,
    message: "Thanks for your review. It will be checked before publication."
  };
}

export async function submitFirstReview(_state: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const brandName = String(formData.get("brandName") ?? "").trim();
  const brandWebsite = normalizeWebsiteInput(String(formData.get("brandWebsite") ?? ""));
  const pendingBrandSlug = slugifyBrandName(brandName);
  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const reviewerName = String(formData.get("name") ?? "").trim();
  const reviewerEmail = String(formData.get("email") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim() || null;
  const productType = String(formData.get("productType") ?? "").trim() || null;
  const orderMonth = String(formData.get("orderMonth") ?? "").trim() || null;
  const deliveryExperience = String(formData.get("deliveryExperience") ?? "").trim() || null;
  const customerServiceExperience = String(formData.get("customerServiceExperience") ?? "").trim() || null;
  const wouldBuyAgain = String(formData.get("wouldBuyAgain") ?? "").trim() || null;
  const confirmedGenuineExperience = formData.get("confirmedGenuineExperience") === "on";
  const honeypot = String(formData.get("reviewWebsite") ?? "").trim();
  const reviewImages = getReviewImages(formData);
  console.log("Selected review images:", reviewImages.length);

  if (!brandName || !brandWebsite || !pendingBrandSlug || !isValidBusinessClaimWebsite(brandWebsite)) {
    return { ok: false, message: "Please complete all required brand fields before submitting." };
  }

  const validationMessage = validateReviewInput({
    rating,
    title,
    content,
    reviewerName,
    reviewerEmail,
    confirmed: confirmedGenuineExperience
  });
  if (validationMessage) return { ok: false, message: validationMessage };

  const spamCheck = scoreReviewSpam({
    brandName,
    brandWebsite,
    title,
    content,
    reviewerName,
    reviewerEmail,
    honeypot
  });
  if (spamCheck.isSpam) {
    console.warn("Blocked spam first review submission", { brandName, reviewerEmail, reasons: spamCheck.reasons });
    return {
      ok: true,
      message: "Thanks for your review. It will be checked before publication."
    };
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured yet. Add the Supabase environment variables and try again."
    };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("slug", pendingBrandSlug)
    .maybeSingle();

  if (companyError) {
    console.error("Supabase first review company lookup failed", {
      brandName,
      pendingBrandSlug,
      message: formatSupabaseError(companyError),
      error: companyError
    });
    return { ok: false, message: `Brand lookup failed: ${formatSupabaseError(companyError)}` };
  }

  if (await hasRecentReviewSubmission(supabase, company?.id ?? null, company ? null : pendingBrandSlug, reviewerEmail)) {
    return { ok: false, message: "You have already submitted a review for this brand in the last 24 hours." };
  }

  const reviewImageUpload = await uploadReviewImages(supabase, reviewImages, `${pendingBrandSlug}/${Date.now()}`);
  if (!reviewImageUpload.ok) {
    return { ok: false, message: reviewImageUpload.message };
  }
  console.log("Uploaded review image urls:", reviewImageUpload.urls);

  const reviewPayload = {
    company_id: company?.id ?? null,
    pending_brand_name: company ? null : brandName,
    pending_brand_slug: company ? null : pendingBrandSlug,
    pending_brand_website: company ? null : brandWebsite,
    rating,
    title,
    content,
    reviewer_name: reviewerName,
    reviewer_email: reviewerEmail,
    order_number: orderNumber,
    product_type: productType,
    order_month: orderMonth,
    delivery_experience: deliveryExperience,
    customer_service_experience: customerServiceExperience,
    would_buy_again: wouldBuyAgain,
    proof_image_url: reviewImageUpload.urls[0] ?? null,
    review_image_urls: reviewImageUpload.urls,
    status: "pending",
    is_verified: false
  };
  console.log("Inserted review payload review_image_urls:", reviewPayload.review_image_urls);

  const { error } = await supabase.from("reviews").insert(reviewPayload);

  if (error) {
    console.error(
      "Supabase first review insert failed",
      JSON.stringify(
        {
          brandName,
          pendingBrandSlug,
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

  await sendReviewSubmittedEmail({
    to: reviewerEmail,
    reviewerName,
    brandName: company?.name ?? brandName
  });
  await sendAdminNewReviewNotificationEmail({
    brandName: company?.name ?? brandName,
    rating,
    title,
    reviewerName,
    reviewerEmail
  });

  revalidatePath("/admin/reviews");

  return {
    ok: true,
    message: "Thanks for your review. It will be checked before publication."
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
    .select("id, company_id, pending_brand_name, pending_brand_slug, pending_brand_website, rating, title, status, is_verified, reviewer_name, reviewer_email, companies(name, slug)")
    .eq("id", reviewId)
    .single();

  if (reviewError || !review) {
    const message = reviewError ? formatSupabaseError(reviewError) : "Review not found.";
    console.error("Supabase admin review lookup failed", { reviewId, message, error: reviewError });
    adminRedirect(password, { error: message });
  }

  let updatePayload: { status?: "approved" | "rejected"; is_verified?: boolean; company_id?: string } | null = null;

  let approvedCompanySlug: string | null = null;
  let approvedCompanyName: string | null = null;

  if (action === "approve") {
    updatePayload = { status: "approved" };

    if (!review.company_id && review.pending_brand_slug) {
      const pendingBrandName = review.pending_brand_name || review.pending_brand_slug;
      const pendingBrandSlug = review.pending_brand_slug;
      const pendingBrandWebsite = normalizeWebsiteInput(review.pending_brand_website ?? "");

      const { data: existingCompany, error: existingCompanyError } = await supabase
        .from("companies")
        .select("id, name, slug")
        .eq("slug", pendingBrandSlug)
        .maybeSingle();

      if (existingCompanyError) {
        adminRedirect(password, { error: formatSupabaseError(existingCompanyError) });
      }

      let companyId = existingCompany?.id ?? null;
      approvedCompanySlug = existingCompany?.slug ?? pendingBrandSlug;
      approvedCompanyName = existingCompany?.name ?? pendingBrandName;

      if (!companyId) {
        const { data: createdCompany, error: createCompanyError } = await supabase
          .from("companies")
          .insert({
            name: pendingBrandName,
            slug: pendingBrandSlug,
            website: pendingBrandWebsite,
            category: "Furniture brand",
            description: null
          })
          .select("id, name, slug")
          .single();

        if (createCompanyError || !createdCompany) {
          adminRedirect(password, { error: createCompanyError ? formatSupabaseError(createCompanyError) : "Could not create brand profile." });
        }

        companyId = createdCompany.id;
        approvedCompanySlug = createdCompany.slug;
        approvedCompanyName = createdCompany.name;
      }

      updatePayload = {
        ...updatePayload,
        company_id: companyId
      };
    }
  }

  if (["reject", "delete", "spam"].includes(action)) {
    const { error: deleteError } = await supabase.from("reviews").delete().eq("id", reviewId);

    if (deleteError) {
      const message = formatSupabaseError(deleteError);
      console.error("Supabase admin review delete failed", {
        reviewId,
        action,
        message,
        error: deleteError
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
  if (action === "approve") {
    const approvedCompanyId = updatePayload.company_id ?? review.company_id;
    if (approvedCompanyId) {
      await createAutoReplyForReview(supabase, {
        reviewId,
        companyId: approvedCompanyId,
        reviewerName: review.reviewer_name,
        rating: review.rating,
        reviewTitle: review.title
      });
    }

    const brandSlug = companyRelation?.slug ?? approvedCompanySlug;
    const brandName = companyRelation?.name ?? approvedCompanyName ?? review.pending_brand_name ?? brandSlug;
    if (brandSlug && brandName) {
      const emailSent = await sendReviewApprovedEmail({
        to: review.reviewer_email,
        reviewerName: review.reviewer_name,
        brandName,
        brandSlug
      });
      if (emailSent) {
        await markReviewEmailSent(reviewId, "approved_email_sent_at");
      }
    }
  }

  if (companyRelation?.slug || approvedCompanySlug) {
    revalidatePath(`/review/${companyRelation?.slug ?? approvedCompanySlug}`);
  }

  adminRedirect(password);
}

export async function submitBusinessClaim(formData: FormData) {
  const brandName = String(formData.get("brandName") ?? "").trim();
  const companyId = String(formData.get("companyId") ?? "").trim() || null;
  const website = normalizeWebsiteInput(String(formData.get("website") ?? ""));
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim().toLowerCase();
  const messageInput = String(formData.get("message") ?? "").trim();
  const honeypot = String(formData.get("companyWebsite") ?? "").trim();
  const message = [website ? `Website: ${website}` : null, messageInput || null].filter(Boolean).join("\n\n") || null;

  if (!brandName || !website || !contactName || !isValidEmail(contactEmail) || !isValidBusinessClaimWebsite(website)) {
    redirect("/claim-your-profile?error=missing");
  }

  const spamCheck = scoreBusinessClaimSpam({
    brandName,
    companyId,
    website,
    contactName,
    contactEmail,
    message: messageInput,
    honeypot
  });

  if (spamCheck.isSpam) {
    console.warn("Blocked spam business claim", { brandName, contactEmail, website, reasons: spamCheck.reasons });
    redirect("/claim-your-profile?submitted=1");
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) redirect("/claim-your-profile?error=supabase");

  const isDuplicate = await hasRecentBusinessClaimDuplicate({ contactEmail, brandName, website });
  if (isDuplicate) {
    console.warn("Skipped duplicate business claim", { brandName, contactEmail, website });
    redirect("/claim-your-profile?submitted=1");
  }

  const { error } = await supabase.from("business_claims").insert({
    company_id: companyId,
    brand_name: brandName,
    contact_name: contactName,
    contact_email: contactEmail,
    message,
    status: "pending"
  });

  if (error) {
    console.error("Business claim submit failed", formatSupabaseError(error));
    redirect("/claim-your-profile?error=submit");
  }

  await sendBusinessClaimSubmittedEmail({
    to: contactEmail,
    contactName,
    brandName
  });

  await sendAdminBusinessClaimNotificationEmail({
    brandName,
    contactName,
    contactEmail,
    website,
    message: messageInput || null,
    companyId
  });

  revalidatePath("/admin/tools");
  revalidatePath("/admin/business-claims");
  redirect("/claim-your-profile?submitted=1");
}

export async function moderateBusinessClaim(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const claimId = String(formData.get("claimId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/business-claims?error=1");
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) businessClaimsAdminRedirect(password, { error: "Supabase is not configured." });

  const { data: claim, error: claimError } = await supabase
    .from("business_claims")
    .select("id, company_id, brand_name, contact_name, contact_email, message, status, companies(id, name, slug)")
    .eq("id", claimId)
    .single();

  if (claimError || !claim) {
    businessClaimsAdminRedirect(password, { error: claimError ? formatSupabaseError(claimError) : "Claim not found." });
  }

  if (!["approve", "reject"].includes(action)) {
    businessClaimsAdminRedirect(password, { error: "Unknown claim action." });
  }

  let companyRelation = Array.isArray(claim.companies) ? claim.companies[0] : claim.companies;

  if (action === "reject") {
    const { error: deleteError } = await supabase.from("business_claims").delete().eq("id", claimId);

    if (deleteError) {
      businessClaimsAdminRedirect(password, { error: formatSupabaseError(deleteError) });
    }

    revalidatePath("/admin/business-claims");
    businessClaimsAdminRedirect(password, { success: "Claim rejected and removed." });
  }

  let approvedCompanyId = claim.company_id;
  let approvedCompanySlug = companyRelation?.slug ?? "";
  let approvedCompanyName = companyRelation?.name ?? claim.brand_name;

  if (action === "approve" && !approvedCompanyId) {
    const generatedSlug = slugifyBrandName(claim.brand_name);
    const website = extractClaimWebsite(claim.message);

    if (!generatedSlug) {
      businessClaimsAdminRedirect(password, { error: "Claim brand name is not valid enough to create a profile." });
    }

    const { data: existingCompany, error: existingCompanyError } = await supabase
      .from("companies")
      .select("id, name, slug")
      .eq("slug", generatedSlug)
      .maybeSingle();

    if (existingCompanyError) {
      businessClaimsAdminRedirect(password, { error: formatSupabaseError(existingCompanyError) });
    }

    if (existingCompany) {
      approvedCompanyId = existingCompany.id;
      approvedCompanySlug = existingCompany.slug;
      approvedCompanyName = existingCompany.name;
      companyRelation = existingCompany;
    } else {
      const { data: createdCompany, error: createCompanyError } = await supabase
        .from("companies")
        .insert({
          name: claim.brand_name,
          slug: generatedSlug,
          website,
          category: "Furniture & Homewares",
          description: `${claim.brand_name} is listed on Furniture Brand Reviews so customers can share furniture and homeware buying experiences.`,
          is_claimed: true,
          average_rating: 0,
          review_count: 0
        })
        .select("id, name, slug")
        .single();

      if (createCompanyError || !createdCompany) {
        businessClaimsAdminRedirect(password, { error: createCompanyError ? formatSupabaseError(createCompanyError) : "Company profile could not be created." });
      }

      approvedCompanyId = createdCompany.id;
      approvedCompanySlug = createdCompany.slug;
      approvedCompanyName = createdCompany.name;
      companyRelation = createdCompany;
    }
  }

  const { error: updateError } = await supabase
    .from("business_claims")
    .update({ status: "approved", company_id: approvedCompanyId })
    .eq("id", claimId);

  if (updateError) {
    businessClaimsAdminRedirect(password, { error: formatSupabaseError(updateError) });
  }

  if (action === "approve" && approvedCompanyId) {
    await supabase.from("companies").update({ is_claimed: true }).eq("id", approvedCompanyId);
    const loginToken = await createBusinessLoginToken(claim.contact_email);
    const loginUrl = loginToken
      ? `${siteUrl}/business/dashboard?email=${encodeURIComponent(claim.contact_email)}&token=${encodeURIComponent(loginToken.token)}`
      : `${siteUrl}/business/login?email=${encodeURIComponent(claim.contact_email)}`;
    const passwordResetToken = await createBusinessPasswordResetToken(claim.contact_email);
    const passwordResetUrl = passwordResetToken
      ? `${siteUrl}/business/reset-password?email=${encodeURIComponent(claim.contact_email)}&token=${encodeURIComponent(passwordResetToken.token)}`
      : `${siteUrl}/business/reset-password?email=${encodeURIComponent(claim.contact_email)}`;

    await sendBusinessClaimApprovedEmail({
      to: claim.contact_email,
      contactName: claim.contact_name,
      brandName: approvedCompanyName,
      loginEmail: claim.contact_email,
      loginUrl,
      passwordResetUrl
    });

    if (approvedCompanySlug) revalidatePath(`/review/${approvedCompanySlug}`);
  }

  revalidatePath("/admin/business-claims");
  revalidatePath("/brands");
  revalidatePath("/");
  businessClaimsAdminRedirect(password, { success: "Claim approved and email sent." });
}

export async function bulkRejectBusinessClaims(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const claimIds = formData.getAll("claimIds").map((value) => String(value)).filter(Boolean);

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/business-claims?error=1");
  }

  if (!claimIds.length) {
    businessClaimsAdminRedirect(password, { error: "Select at least one claim to reject." });
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) businessClaimsAdminRedirect(password, { error: "Supabase is not configured." });

  const { error } = await supabase.from("business_claims").delete().in("id", claimIds);

  if (error) {
    businessClaimsAdminRedirect(password, { error: formatSupabaseError(error) });
  }

  revalidatePath("/admin/business-claims");
  businessClaimsAdminRedirect(password, { success: `${claimIds.length} claim request${claimIds.length === 1 ? "" : "s"} rejected and removed.` });
}

export async function updateBusinessProfile(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessToken = getBusinessToken(formData);
  const companyId = String(formData.get("companyId") ?? "").trim();
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const website = normalizeWebsiteInput(String(formData.get("website") ?? ""));
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const existingLogoUrl = String(formData.get("existingLogoUrl") ?? "").trim() || null;
  const logoFile = formData.get("logoFile");

  if (!(await hasBusinessFormAccess(email, companyId, businessToken))) {
    businessRedirect(email, companySlug, { error: "Access denied." });
  }

  if (!website || !category) {
    businessRedirect(email, companySlug, { token: businessToken, error: "Website and category are required." });
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) businessRedirect(email, companySlug, { token: businessToken, tab: "profile", error: "Supabase is not configured." });

  let logoUrl = existingLogoUrl;
  if (logoFile instanceof File && logoFile.size > 0) {
    const uploadResult = await uploadBusinessLogoFile(logoFile, companySlug);
    if (uploadResult?.error) {
      businessRedirect(email, companySlug, { token: businessToken, tab: "profile", error: uploadResult.error });
    }
    logoUrl = uploadResult?.url ?? logoUrl;
  }

  const { error } = await supabase
    .from("companies")
    .update({
      website,
      category,
      description,
      logo_url: logoUrl,
      cover_image_url: logoUrl,
      is_claimed: true
    })
    .eq("id", companyId);

  if (error) {
    businessRedirect(email, companySlug, { token: businessToken, tab: "profile", error: formatSupabaseError(error) });
  }

  revalidatePath(`/review/${companySlug}`);
  revalidatePath("/brands");
  revalidatePath("/");
  businessRedirect(email, companySlug, { token: businessToken, tab: "profile", success: "Profile updated." });
}

export async function updateBusinessPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessToken = getBusinessToken(formData);
  const companyId = String(formData.get("companyId") ?? "").trim();
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!(await hasBusinessFormAccess(email, companyId, businessToken))) {
    businessRedirect(email, companySlug, { error: "Access denied." });
  }

  if (password !== confirmPassword) {
    businessRedirect(email, companySlug, { token: businessToken, tab: "password", error: "Passwords do not match." });
  }

  const result = await setBusinessPassword(email, password);
  if (!result.ok) {
    businessRedirect(email, companySlug, { token: businessToken, tab: "password", error: result.message });
  }

  businessRedirect(email, companySlug, { token: businessToken, tab: "password", success: "Password updated." });
}

export async function sendBusinessReviewInvitation(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessToken = getBusinessToken(formData);
  const companyId = String(formData.get("companyId") ?? "").trim();
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const brandName = String(formData.get("brandName") ?? "").trim();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerEmail = normalizeEmailInput(String(formData.get("customerEmail") ?? ""));

  if (!(await hasBusinessFormAccess(email, companyId, businessToken))) {
    businessRedirect(email, companySlug, { error: "Access denied." });
  }

  if (!isValidEmail(customerEmail)) {
    businessRedirect(email, companySlug, { token: businessToken, tab: "invite", error: "Enter a valid customer email address." });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) businessRedirect(email, companySlug, { token: businessToken, tab: "invite", error: "Supabase is not configured." });

  const result = await createBusinessReviewInvitation({
    supabase,
    companyId,
    companySlug,
    businessEmail: email,
    customerEmail,
    customerName,
    brandName: brandName || companySlug
  });

  if (!result.ok) {
    businessRedirect(email, companySlug, { token: businessToken, tab: "invite", error: result.message });
  }

  businessRedirect(email, companySlug, { token: businessToken, tab: "invite", success: "Verified review invitation sent." });
}

async function createBusinessReviewInvitation({
  supabase,
  companyId,
  companySlug,
  businessEmail,
  customerEmail,
  customerName,
  brandName
}: {
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>;
  companyId: string;
  companySlug: string;
  businessEmail: string;
  customerEmail: string;
  customerName: string;
  brandName: string;
}) {
  const token = crypto.randomBytes(32).toString("base64url");
  const invitationUrl = `${siteUrl}/review/${companySlug}/write?invite=${encodeURIComponent(token)}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

  const { error } = await supabase.from("review_invitations").insert({
    company_id: companyId,
    business_email: businessEmail,
    customer_email: customerEmail,
    customer_name: customerName || null,
    token_hash: hashReviewInvitationToken(token),
    status: "pending",
    source_type: "business_invitation",
    expires_at: expiresAt
  });

  if (error) {
    return { ok: false, message: `Invitation could not be created: ${formatSupabaseError(error)}` };
  }

  const emailSent = await sendBusinessReviewInvitationEmail({
    to: customerEmail,
    customerName,
    brandName,
    invitationUrl
  });

  if (!emailSent) {
    return { ok: false, message: "Invitation was created, but the email could not be sent. Check RESEND_API_KEY and EMAIL_FROM." };
  }

  return { ok: true, message: "Verified review invitation sent." };
}

export async function sendBulkBusinessReviewInvitations(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessToken = getBusinessToken(formData);
  const companyId = String(formData.get("companyId") ?? "").trim();
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const brandName = String(formData.get("brandName") ?? "").trim() || companySlug;
  const csvFile = formData.get("customerCsv");

  if (!(await hasBusinessFormAccess(email, companyId, businessToken))) {
    businessRedirect(email, companySlug, { error: "Access denied." });
  }

  if (!(csvFile instanceof File) || csvFile.size === 0) {
    businessRedirect(email, companySlug, { token: businessToken, tab: "invite", error: "Upload a CSV file with customer emails." });
  }

  if (csvFile.size > 1024 * 1024) {
    businessRedirect(email, companySlug, { token: businessToken, tab: "invite", error: "CSV file must be under 1MB." });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) businessRedirect(email, companySlug, { token: businessToken, tab: "invite", error: "Supabase is not configured." });

  const csvText = await csvFile.text();
  const rows = parseCsv(csvText).slice(0, 100);
  if (!rows.length) {
    businessRedirect(email, companySlug, { token: businessToken, tab: "invite", error: "CSV file did not contain any invitation rows." });
  }

  let successCount = 0;
  const errors: string[] = [];
  const seenEmails = new Set<string>();

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const customerEmail = normalizeEmailInput(row.email || row.customer_email || row["customer email"] || row.Email || "");
    const customerName = String(row.name || row.customer_name || row["customer name"] || row.Name || "").trim();

    if (!isValidEmail(customerEmail)) {
      errors.push(`Row ${index + 2}: invalid email`);
      continue;
    }

    if (seenEmails.has(customerEmail)) {
      errors.push(`Row ${index + 2}: duplicate email skipped`);
      continue;
    }

    seenEmails.add(customerEmail);
    const result = await createBusinessReviewInvitation({
      supabase,
      companyId,
      companySlug,
      businessEmail: email,
      customerEmail,
      customerName,
      brandName
    });

    if (result.ok) {
      successCount += 1;
    } else {
      errors.push(`Row ${index + 2}: ${result.message}`);
    }
  }

  const message =
    successCount > 0
      ? `Sent ${successCount} verified invitation${successCount === 1 ? "" : "s"}${errors.length ? `; ${errors.length} row${errors.length === 1 ? "" : "s"} skipped.` : "."}`
      : "No invitations were sent.";

  businessRedirect(email, companySlug, {
    token: businessToken,
    tab: "invite",
    ...(successCount > 0 ? { success: message } : { error: errors[0] || message })
  });
}

export async function addBusinessReply(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessToken = getBusinessToken(formData);
  const companyId = String(formData.get("companyId") ?? "").trim();
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const reviewId = String(formData.get("reviewId") ?? "").trim();
  const reply = String(formData.get("reply") ?? "").trim();

  if (!(await hasBusinessFormAccess(email, companyId, businessToken))) {
    businessRedirect(email, companySlug, { error: "Access denied." });
  }

  if (!reviewId || reply.length < 10) {
    businessRedirect(email, companySlug, { token: businessToken, error: "Reply must be at least 10 characters." });
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) businessRedirect(email, companySlug, { token: businessToken, error: "Supabase is not configured." });

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("company_id", companyId)
    .eq("status", "approved")
    .single();

  if (reviewError || !review) {
    businessRedirect(email, companySlug, { token: businessToken, error: "Review not found." });
  }

  const { data: existingReplies, error: existingReplyError } = await supabase
    .from("company_replies")
    .select("id")
    .eq("review_id", reviewId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingReplyError) {
    businessRedirect(email, companySlug, { token: businessToken, error: formatSupabaseError(existingReplyError) });
  }

  const existingReply = existingReplies?.[0] ?? null;
  const { error } = await supabase.from("company_replies").upsert(
    {
      review_id: reviewId,
      company_id: companyId,
      reply
    },
    { onConflict: "review_id" }
  );

  if (error) {
    businessRedirect(email, companySlug, { token: businessToken, error: formatSupabaseError(error) });
  }

  revalidatePath(`/review/${companySlug}`);
  businessRedirect(email, companySlug, { token: businessToken, success: "Reply published." });
}

export async function addBusinessReplyInline(_state: BusinessReplyState, formData: FormData): Promise<BusinessReplyState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessToken = getBusinessToken(formData);
  const companyId = String(formData.get("companyId") ?? "").trim();
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const reviewId = String(formData.get("reviewId") ?? "").trim();
  const reply = String(formData.get("reply") ?? "").trim();

  if (!(await hasBusinessFormAccess(email, companyId, businessToken))) {
    return { ok: false, message: "Access denied." };
  }

  if (!reviewId || reply.length < 10) {
    return { ok: false, message: "Reply must be at least 10 characters." };
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("company_id", companyId)
    .eq("status", "approved")
    .single();

  if (reviewError || !review) {
    return { ok: false, message: reviewError ? formatSupabaseError(reviewError) : "Review not found." };
  }

  const { data: existingReplies, error: existingReplyError } = await supabase
    .from("company_replies")
    .select("id")
    .eq("review_id", reviewId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingReplyError) {
    return { ok: false, message: formatSupabaseError(existingReplyError) };
  }

  const existingReply = existingReplies?.[0] ?? null;
  const { error } = await supabase.from("company_replies").upsert(
    {
      review_id: reviewId,
      company_id: companyId,
      reply
    },
    { onConflict: "review_id" }
  );

  if (error) {
    return { ok: false, message: formatSupabaseError(error) };
  }

  revalidatePath(`/review/${companySlug}`);
  revalidatePath(`/business/dashboard`);
  return { ok: true, message: existingReply ? "Reply updated. The latest reply is now visible on the public brand profile." : "Reply published. It is now visible on the public brand profile." };
}

export async function verifyBusinessReviewInline(_state: BusinessVerifyState, formData: FormData): Promise<BusinessVerifyState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessToken = getBusinessToken(formData);
  const companyId = String(formData.get("companyId") ?? "").trim();
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const reviewId = String(formData.get("reviewId") ?? "").trim();

  if (!(await hasBusinessFormAccess(email, companyId, businessToken))) {
    return { ok: false, message: "Access denied." };
  }

  if (!reviewId) {
    return { ok: false, message: "Review is missing." };
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("company_id", companyId)
    .eq("status", "approved")
    .single();

  if (reviewError || !review) {
    return { ok: false, message: reviewError ? formatSupabaseError(reviewError) : "Review not found." };
  }

  const { error } = await supabase
    .from("reviews")
    .update({ is_verified: true })
    .eq("id", reviewId)
    .eq("company_id", companyId);

  if (error) {
    return { ok: false, message: formatSupabaseError(error) };
  }

  revalidatePath(`/review/${companySlug}`);
  revalidatePath(`/business/dashboard`);
  return { ok: true, message: "Review marked as verified." };
}

export async function saveBusinessAutoReplySettings(_state: BusinessAutoReplyState, formData: FormData): Promise<BusinessAutoReplyState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessToken = getBusinessToken(formData);
  const companyId = String(formData.get("companyId") ?? "").trim();
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const enabled = formData.get("autoReplyEnabled") === "on";
  const template = String(formData.get("autoReplyTemplate") ?? "").trim();

  if (!(await hasBusinessFormAccess(email, companyId, businessToken))) {
    return { ok: false, message: "Access denied." };
  }

  if (enabled && template.length < 10) {
    return { ok: false, message: "Add an auto reply template before turning this on." };
  }

  if (template.length > 1500) {
    return { ok: false, message: "Auto reply template must be under 1,500 characters." };
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const { error } = await supabase
    .from("companies")
    .update({
      auto_reply_enabled: enabled,
      auto_reply_template: template || null
    })
    .eq("id", companyId);

  if (error) {
    return { ok: false, message: formatSupabaseError(error) };
  }

  revalidatePath(`/business/dashboard`);
  revalidatePath(`/review/${companySlug}`);

  return {
    ok: true,
    message: enabled ? "Auto reply is on for future approved reviews." : "Auto reply is off for future reviews."
  };
}

const reviewFlagReasons = new Set([
  "Harmful or illegal",
  "Personal information",
  "Advertising or promotional",
  "About a different business",
  "Not based on a genuine experience",
  "None of the flagging reasons apply"
]);

export async function flagBusinessReview(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessToken = getBusinessToken(formData);
  const companyId = String(formData.get("companyId") ?? "").trim();
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const reviewId = String(formData.get("reviewId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim() || null;

  if (!(await hasBusinessFormAccess(email, companyId, businessToken))) {
    businessRedirect(email, companySlug, { error: "Access denied." });
  }

  if (!reviewId || !reviewFlagReasons.has(reason)) {
    businessRedirect(email, companySlug, { token: businessToken, error: "Choose a valid flag reason." });
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) businessRedirect(email, companySlug, { token: businessToken, error: "Supabase is not configured." });

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("company_id", companyId)
    .eq("status", "approved")
    .single();

  if (reviewError || !review) {
    businessRedirect(email, companySlug, { token: businessToken, error: reviewError ? formatSupabaseError(reviewError) : "Review not found." });
  }

  const { data: existingFlag, error: existingFlagError } = await supabase
    .from("review_flags")
    .select("id")
    .eq("review_id", reviewId)
    .ilike("reported_by_email", email)
    .eq("status", "pending")
    .limit(1);

  if (existingFlagError) {
    businessRedirect(email, companySlug, { token: businessToken, error: formatSupabaseError(existingFlagError) });
  }

  if (existingFlag?.length) {
    businessRedirect(email, companySlug, { token: businessToken, success: "This review is already flagged and waiting for manual review." });
  }

  const { error } = await supabase.from("review_flags").insert({
    review_id: reviewId,
    company_id: companyId,
    reason,
    details,
    reported_by_email: email,
    status: "pending"
  });

  if (error) {
    businessRedirect(email, companySlug, { token: businessToken, error: formatSupabaseError(error) });
  }

  revalidatePath("/admin/reviews");
  businessRedirect(email, companySlug, { token: businessToken, success: "Flag submitted. We will manually review this report." });
}

export async function flagBusinessReviewInline(_state: BusinessFlagState, formData: FormData): Promise<BusinessFlagState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessToken = getBusinessToken(formData);
  const companyId = String(formData.get("companyId") ?? "").trim();
  const reviewId = String(formData.get("reviewId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim() || null;

  if (!(await hasBusinessFormAccess(email, companyId, businessToken))) {
    return { ok: false, message: "Access denied." };
  }

  if (!reviewId || !reviewFlagReasons.has(reason)) {
    return { ok: false, message: "Choose a valid flag reason." };
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("company_id", companyId)
    .eq("status", "approved")
    .single();

  if (reviewError || !review) {
    return { ok: false, message: reviewError ? formatSupabaseError(reviewError) : "Review not found." };
  }

  const { data: existingFlag, error: existingFlagError } = await supabase
    .from("review_flags")
    .select("id")
    .eq("review_id", reviewId)
    .ilike("reported_by_email", email)
    .eq("status", "pending")
    .limit(1);

  if (existingFlagError) {
    return { ok: false, message: formatSupabaseError(existingFlagError) };
  }

  if (existingFlag?.length) {
    return { ok: true, message: "This review is already flagged and waiting for manual review." };
  }

  const { error } = await supabase.from("review_flags").insert({
    review_id: reviewId,
    company_id: companyId,
    reason,
    details,
    reported_by_email: email,
    status: "pending"
  });

  if (error) {
    return { ok: false, message: formatSupabaseError(error) };
  }

  revalidatePath("/admin/reviews");
  return { ok: true, message: "Flag submitted. We will manually review this report." };
}

export async function moderateReviewFlag(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const flagId = String(formData.get("flagId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/reviews?error=1");
  }

  if (!flagId || !["dismissed", "remove_review"].includes(action)) {
    adminRedirect(password, { error: "Unknown flag action." });
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) adminRedirect(password, { error: "Supabase is not configured yet." });

  if (action === "remove_review") {
    const { data: flag, error: flagError } = await supabase
      .from("review_flags")
      .select("id, review_id, companies(slug)")
      .eq("id", flagId)
      .single();

    if (flagError || !flag) {
      adminRedirect(password, { error: flagError ? formatSupabaseError(flagError) : "Flag not found." });
    }

    const { error: deleteError } = await supabase.from("reviews").delete().eq("id", flag.review_id);

    if (deleteError) {
      adminRedirect(password, { error: formatSupabaseError(deleteError) });
    }

    const companyRelation = Array.isArray(flag.companies) ? flag.companies[0] : flag.companies;
    if (companyRelation?.slug) {
      revalidatePath(`/review/${companyRelation.slug}`);
    }
    revalidatePath("/");
    revalidatePath("/brands");
    revalidatePath("/admin/reviews");
    adminRedirect(password, { success: "Review removed." });
  }

  const { error } = await supabase
    .from("review_flags")
    .update({ status: "dismissed", reviewed_at: new Date().toISOString() })
    .eq("id", flagId);

  if (error) {
    adminRedirect(password, { error: formatSupabaseError(error) });
  }

  revalidatePath("/admin/reviews");
  adminRedirect(password, { success: "Flag dismissed." });
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
        og_image_url: candidates.ogImageUrl,
        cover_image_url: row.cover_image_url || null,
        website_screenshot_url: row.website_screenshot_url || null
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

export async function upsertCompanyFromAdmin(_state: ImportState, formData: FormData): Promise<ImportState> {
  const password = String(formData.get("password") ?? "");
  const invalidPassword = validateAdminPassword(password);
  if (invalidPassword) return invalidPassword;

  const supabase = getAdminSupabaseClient();
  if (!supabase) return { ...initialImportResult, message: "Supabase is not configured yet." };

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    logo_url: String(formData.get("logo_url") ?? "").trim() || null,
    favicon_url: String(formData.get("favicon_url") ?? "").trim() || null,
    og_image_url: String(formData.get("og_image_url") ?? "").trim() || null,
    cover_image_url: String(formData.get("cover_image_url") ?? "").trim() || null,
    website_screenshot_url: String(formData.get("website_screenshot_url") ?? "").trim() || null,
    is_claimed: formData.get("is_claimed") === "on"
  };

  if (!payload.name || !payload.slug || !payload.website || !payload.category) {
    return { ...initialImportResult, message: "Brand name, slug, website and category are required." };
  }

  const { error } = await supabase.from("companies").upsert(payload, { onConflict: "slug" });
  if (error) {
    return { ...initialImportResult, message: `Brand save failed: ${formatSupabaseError(error)}` };
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/review/${payload.slug}`);
  revalidatePath("/admin/tools");

  return {
    ok: true,
    message: `Brand profile saved for ${payload.name}.`,
    successCount: 1,
    failureCount: 0,
    errors: []
  };
}

export async function importCompaniesFromAdmin(_state: ImportState, formData: FormData): Promise<ImportState> {
  const password = String(formData.get("password") ?? "");
  const invalidPassword = validateAdminPassword(password);
  if (invalidPassword) return invalidPassword;

  const supabase = getAdminSupabaseClient();
  if (!supabase) return { ...initialImportResult, message: "Supabase is not configured yet." };

  const rows = parseCsv(String(formData.get("csvText") ?? "").trim());
  if (rows.length === 0) return { ...initialImportResult, message: "CSV is empty or invalid." };

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row.name || !row.slug || !row.website || !row.category) {
      failureCount += 1;
      errors.push(`Row ${index + 2}: missing required company fields.`);
      continue;
    }

    const payload = {
      name: row.name,
      slug: row.slug,
      website: row.website,
      category: row.category,
      description: row.description || null,
      logo_url: row.logo_url || null,
      favicon_url: row.favicon_url || null,
      og_image_url: row.og_image_url || null,
      cover_image_url: row.cover_image_url || null,
      website_screenshot_url: row.website_screenshot_url || null
    };

    const { error } = await supabase.from("companies").upsert(payload, { onConflict: "slug" });
    if (error) {
      failureCount += 1;
      errors.push(`Row ${index + 2}: ${formatSupabaseError(error)}`);
    } else {
      successCount += 1;
      revalidatePath(`/review/${payload.slug}`);
    }
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath("/admin/tools");

  return {
    ok: failureCount === 0,
    message: `Companies import finished. Success: ${successCount}. Failed: ${failureCount}.`,
    successCount,
    failureCount,
    errors: errors.slice(0, 20)
  };
}

export async function importReviewsFromAdmin(_state: ImportState, formData: FormData): Promise<ImportState> {
  const password = String(formData.get("password") ?? "");
  const invalidPassword = validateAdminPassword(password);
  if (invalidPassword) return invalidPassword;

  const supabase = getAdminSupabaseClient();
  if (!supabase) return { ...initialImportResult, message: "Supabase is not configured yet." };

  const rows = parseCsv(String(formData.get("csvText") ?? "").trim());
  if (rows.length === 0) return { ...initialImportResult, message: "CSV is empty or invalid." };

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];
  const touchedSlugs = new Set<string>();

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const rating = Number(row.rating);
    const status = row.status || "pending";
    const createdAt = row.created_at || new Date().toISOString();

    if (!row.company_slug || !row.title || !row.content || !row.reviewer_name || !row.reviewer_email) {
      failureCount += 1;
      errors.push(`Row ${index + 2}: missing required review fields.`);
      continue;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      failureCount += 1;
      errors.push(`Row ${index + 2}: rating must be a whole number from 1 to 5.`);
      continue;
    }

    if (!isValidReviewStatus(status)) {
      failureCount += 1;
      errors.push(`Row ${index + 2}: status must be pending, approved or rejected.`);
      continue;
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, slug")
      .eq("slug", row.company_slug)
      .single();

    if (companyError || !company) {
      failureCount += 1;
      errors.push(`Row ${index + 2}: company_slug "${row.company_slug}" was not found.`);
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
      proof_image_url: row.proof_image_url || null,
      status,
      is_verified: parseBooleanValue(row.is_verified),
      created_at: createdAt
    });

    if (error) {
      failureCount += 1;
      errors.push(`Row ${index + 2}: ${formatSupabaseError(error)}`);
    } else {
      successCount += 1;
      touchedSlugs.add(company.slug);
    }
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/tools");
  touchedSlugs.forEach((slug) => revalidatePath(`/review/${slug}`));

  return {
    ok: failureCount === 0,
    message: `Reviews import finished. Success: ${successCount}. Failed: ${failureCount}.`,
    successCount,
    failureCount,
    errors: errors.slice(0, 30)
  };
}
