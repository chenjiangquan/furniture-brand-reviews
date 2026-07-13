import { cache } from "react";
import crypto from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Company, ReviewWithReply } from "@/lib/types";

export type BusinessClaimAccess = {
  id: string;
  contact_email: string;
  contact_name: string;
  company_id: string;
  companies: Company | null;
};

export type AdminBusinessClaim = {
  id: string;
  company_id: string | null;
  brand_name: string;
  contact_name: string;
  contact_email: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  companies?: Pick<Company, "id" | "name" | "slug" | "website"> | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("base64url")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("base64url");
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;
  const [algorithm, iterationsText, salt, hash] = storedHash.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterationsText || !salt || !hash) return false;
  const iterations = Number(iterationsText);
  if (!Number.isFinite(iterations) || iterations < 10000) return false;

  const expected = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("base64url");
  const expectedBuffer = Buffer.from(expected);
  const hashBuffer = Buffer.from(hash);
  return expectedBuffer.length === hashBuffer.length && crypto.timingSafeEqual(expectedBuffer, hashBuffer);
}

function getBusinessLoginSecret() {
  return process.env.BUSINESS_LOGIN_SECRET || process.env.ADMIN_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function signBusinessTokenPayload(payload: string) {
  const secret = getBusinessLoginSecret();
  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function createSignedBusinessToken(email: string, expiresAt: string) {
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString("base64url");
  const signature = signBusinessTokenPayload(payload);
  return signature ? `v1.${payload}.${signature}` : "";
}

function createSignedPasswordResetToken(email: string, expiresAt: string) {
  const payload = Buffer.from(JSON.stringify({ email, expiresAt, purpose: "business-password-reset" })).toString("base64url");
  const signature = signBusinessTokenPayload(payload);
  return signature ? `pw1.${payload}.${signature}` : "";
}

export function verifySignedPasswordResetToken(email: string, token: string) {
  const [version, payload, signature] = token.split(".");
  if (version !== "pw1" || !payload || !signature) return false;

  const expectedSignature = signBusinessTokenPayload(payload);
  if (!expectedSignature) return false;

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; expiresAt?: string; purpose?: string };
    if (decoded.email !== email || decoded.purpose !== "business-password-reset" || !decoded.expiresAt) return false;
    return new Date(decoded.expiresAt).getTime() > Date.now();
  } catch {
    return false;
  }
}

export function verifySignedBusinessToken(email: string, token: string) {
  const [version, payload, signature] = token.split(".");
  if (version !== "v1" || !payload || !signature) return false;

  const expectedSignature = signBusinessTokenPayload(payload);
  if (!expectedSignature) return false;

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; expiresAt?: string };
    if (decoded.email !== email || !decoded.expiresAt) return false;
    return new Date(decoded.expiresAt).getTime() > Date.now();
  } catch {
    return false;
  }
}

export async function createBusinessLoginToken(email: string) {
  noStore();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const claims = await getBusinessClaimsByEmail(normalizedEmail);
  if (!claims.length) return null;

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  const token = createSignedBusinessToken(normalizedEmail, expiresAt);
  if (!token) return null;

  return { token, expiresAt, companies: claims.map((claim) => claim.companies).filter(Boolean) as Company[] };
}

export async function createBusinessPasswordResetToken(email: string) {
  noStore();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const claims = await getBusinessClaimsByEmail(normalizedEmail);
  if (!claims.length) return null;

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString();
  const token = createSignedPasswordResetToken(normalizedEmail, expiresAt);
  if (!token) return null;

  return { token, expiresAt, companies: claims.map((claim) => claim.companies).filter(Boolean) as Company[] };
}

export async function createBusinessSessionForPassword(email: string, password: string) {
  noStore();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) return null;

  const claims = await getBusinessClaimsByEmail(normalizedEmail);
  if (!claims.length) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("business_passwords")
    .select("password_hash")
    .eq("contact_email", normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error("Business password lookup failed", error);
    return null;
  }

  if (!verifyPassword(password, data?.password_hash)) return null;

  return createBusinessLoginToken(normalizedEmail);
}

export async function setBusinessPassword(email: string, password: string) {
  noStore();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || password.length < 10) return { ok: false, message: "Password must be at least 10 characters." };

  const claims = await getBusinessClaimsByEmail(normalizedEmail);
  if (!claims.length) return { ok: false, message: "No approved business claim was found for this email." };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const passwordHash = hashPassword(password);
  const { error } = await supabase.from("business_passwords").upsert(
    {
      contact_email: normalizedEmail,
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    },
    { onConflict: "contact_email" }
  );

  if (error) {
    console.error("Business password update failed", error);
    return { ok: false, message: "Could not update password." };
  }

  return { ok: true, message: "Password updated." };
}

export async function getBusinessClaimsByToken(email: string, token: string): Promise<BusinessClaimAccess[]> {
  noStore();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !token) return [];

  if (verifySignedBusinessToken(normalizedEmail, token)) {
    return getBusinessClaimsByEmail(normalizedEmail);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: tokenRows, error: tokenError } = await supabase
    .from("business_login_tokens")
    .select("id")
    .eq("contact_email", normalizedEmail)
    .eq("token_hash", hashToken(token))
    .gt("expires_at", new Date().toISOString())
    .is("used_at", null)
    .limit(1);

  if (tokenError || !tokenRows?.length) {
    if (tokenError) console.error("Business login token lookup failed", tokenError);
    return [];
  }

  return getBusinessClaimsByEmail(normalizedEmail);
}

export const getBusinessClaimsByEmail = cache(async (email: string): Promise<BusinessClaimAccess[]> => {
  noStore();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return [];

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("business_claims")
    .select("id, contact_email, contact_name, company_id, companies(*)")
    .eq("status", "approved")
    .ilike("contact_email", normalizedEmail);

  if (error) {
    console.error("Business access lookup failed", error);
    return [];
  }

  return (data ?? []).map((claim) => ({
    ...claim,
    companies: Array.isArray(claim.companies) ? claim.companies[0] : claim.companies
  })) as BusinessClaimAccess[];
});

export async function getBusinessCompanyByEmail(email: string, slug?: string | null) {
  const claims = await getBusinessClaimsByEmail(email);
  const companies = claims.map((claim) => claim.companies).filter(Boolean) as Company[];

  if (!companies.length) {
    return { claims, companies, company: null };
  }

  const company = slug ? companies.find((item) => item.slug === slug) ?? companies[0] : companies[0];
  return { claims, companies, company };
}

export async function getBusinessCompanyByToken(email: string, token: string, slug?: string | null) {
  const claims = await getBusinessClaimsByToken(email, token);
  const companies = claims.map((claim) => claim.companies).filter(Boolean) as Company[];

  if (!companies.length) {
    return { claims, companies, company: null };
  }

  const company = slug ? companies.find((item) => item.slug === slug) ?? companies[0] : companies[0];
  return { claims, companies, company };
}

export async function hasBusinessAccess(email: string, companyId: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !companyId) return false;

  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("business_claims")
    .select("id")
    .eq("status", "approved")
    .eq("company_id", companyId)
    .ilike("contact_email", normalizedEmail)
    .limit(1);

  if (error) {
    console.error("Business access verification failed", error);
    return false;
  }

  return Boolean(data?.length);
}

export async function hasBusinessTokenAccess(email: string, companyId: string, token: string) {
  const claims = await getBusinessClaimsByToken(email, token);
  return claims.some((claim) => claim.company_id === companyId);
}

export async function getBusinessReviews(companyId: string): Promise<ReviewWithReply[]> {
  noStore();
  const supabase = getSupabaseAdmin();
  if (!supabase || !companyId) return [];

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, company_id, pending_brand_name, pending_brand_slug, rating, title, content, reviewer_name, reviewer_email, order_number, product_type, order_month, delivery_experience, customer_service_experience, would_buy_again, proof_image_url, review_image_urls, status, is_verified, useful_count, created_at")
    .eq("company_id", companyId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Business reviews lookup failed", error);
    return [];
  }

  const { data: replies, error: repliesError } = await supabase
    .from("company_replies")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (repliesError) {
    console.error("Business replies lookup failed", repliesError);
    return (reviews ?? []).map((review) => ({ ...review, company_replies: [] })) as ReviewWithReply[];
  }

  return (reviews ?? []).map((review) => ({
    ...review,
    company_replies: (replies ?? []).filter((reply) => reply.review_id === review.id).slice(0, 1)
  })) as ReviewWithReply[];
}

export async function getAdminBusinessClaims(password: string): Promise<AdminBusinessClaim[]> {
  noStore();
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return [];

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("business_claims")
    .select("id, company_id, brand_name, contact_name, contact_email, message, status, created_at, companies(id, name, slug, website)")
    .neq("status", "rejected")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin business claims lookup failed", error);
    return [];
  }

  return (data ?? []).map((claim) => ({
    ...claim,
    companies: Array.isArray(claim.companies) ? claim.companies[0] : claim.companies
  })) as AdminBusinessClaim[];
}
