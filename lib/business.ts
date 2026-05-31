import { cache } from "react";
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
    .eq("company_id", companyId);

  if (repliesError) {
    console.error("Business replies lookup failed", repliesError);
    return (reviews ?? []).map((review) => ({ ...review, company_replies: [] })) as ReviewWithReply[];
  }

  return (reviews ?? []).map((review) => ({
    ...review,
    company_replies: (replies ?? []).filter((reply) => reply.review_id === review.id)
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
