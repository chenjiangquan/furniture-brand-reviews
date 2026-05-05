import { cache } from "react";
import { sampleCompanies, sampleReviews } from "@/lib/sample-data";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";
import type { Company, Review, ReviewWithReply } from "@/lib/types";

function normalizeCompany(company: Company): Company {
  return {
    ...company,
    description:
      company.description
        ?.replace(/UK furniture brands/gi, "furniture brands worldwide")
        .replace(/UK furniture/gi, "global furniture")
        .replace(/UK shoppers/gi, "furniture shoppers worldwide")
        .replace(/UK homes/gi, "homes worldwide")
        .replace(/United Kingdom/gi, "worldwide")
        .replace(/\bUK\b/g, "worldwide") ?? null
  };
}

type ApprovedReviewRating = {
  company_id: string;
  rating: number;
};

function applyApprovedReviewStats(companies: Company[], approvedReviews: ApprovedReviewRating[]) {
  const stats = new Map<string, { count: number; total: number }>();

  for (const review of approvedReviews) {
    const current = stats.get(review.company_id) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += review.rating;
    stats.set(review.company_id, current);
  }

  return companies.map((company) => {
    const companyStats = stats.get(company.id);
    if (!companyStats) {
      return {
        ...company,
        average_rating: 0,
        review_count: 0
      };
    }

    return {
      ...company,
      average_rating: Math.round((companyStats.total / companyStats.count) * 10) / 10,
      review_count: companyStats.count
    };
  });
}

export const getCompanies = cache(async (): Promise<Company[]> => {
  const supabase = getSupabase();
  if (!supabase) return sampleCompanies.map(normalizeCompany);

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("average_rating", { ascending: false });

  if (error) {
    console.error(error);
    return sampleCompanies.map(normalizeCompany);
  }

  const companies = (data ?? []).map(normalizeCompany);

  const { data: approvedReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("company_id, rating")
    .eq("status", "approved");

  if (reviewsError) {
    console.error(reviewsError);
    return companies;
  }

  return applyApprovedReviewStats(companies, approvedReviews ?? []);
});

export const getCompanyBySlug = cache(async (slug: string): Promise<Company | null> => {
  const sampleCompany = sampleCompanies.find((company) => company.slug === slug) ?? null;
  const supabase = getSupabase();
  if (!supabase) return sampleCompany ? normalizeCompany(sampleCompany) : null;

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error);
    return sampleCompany ? normalizeCompany(sampleCompany) : null;
  }

  const company = data ? normalizeCompany(data) : sampleCompany ? normalizeCompany(sampleCompany) : null;
  if (!company) return null;

  const { data: approvedReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("company_id, rating")
    .eq("company_id", company.id)
    .eq("status", "approved");

  if (reviewsError) {
    console.error(reviewsError);
    return company;
  }

  return applyApprovedReviewStats([company], approvedReviews ?? [])[0];
});

export const getApprovedReviewsForCompany = cache(async (companyId: string): Promise<ReviewWithReply[]> => {
  const supabase = getSupabase();
  if (!supabase) return sampleReviews.filter((review) => review.company_id === companyId);

  const { data, error } = await supabase
    .from("reviews")
    .select("id, company_id, rating, title, content, reviewer_name, reviewer_email, order_number, proof_image_url, status, is_verified, created_at")
    .eq("company_id", companyId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  const reviews = data ?? [];
  if (reviews.length === 0) return [];

  const reviewIds = reviews.map((review) => review.id);
  const { data: replies, error: repliesError } = await supabase
    .from("company_replies")
    .select("*")
    .eq("company_id", companyId)
    .in("review_id", reviewIds);

  if (repliesError) {
    console.error(repliesError);
    return reviews.map((review) => ({ ...review, company_replies: [] })) as ReviewWithReply[];
  }

  return reviews.map((review) => ({
    ...review,
    company_replies: (replies ?? []).filter((reply) => reply.review_id === review.id)
  })) as ReviewWithReply[];
});

export const getLatestApprovedReviews = cache(async (): Promise<ReviewWithReply[]> => {
  const supabase = getSupabase();
  if (!supabase) return sampleReviews;

  const { data, error } = await supabase
    .from("reviews")
    .select("*, companies(name, slug)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error(error);
    return sampleReviews;
  }

  return data ?? [];
});

export async function getPendingReviews(password: string): Promise<Review[]> {
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return [];

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("id, company_id, rating, title, content, reviewer_name, reviewer_email, order_number, proof_image_url, status, is_verified, created_at, companies(name, slug)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((review) => ({
    ...review,
    companies: Array.isArray(review.companies) ? review.companies[0] : review.companies
  })) as Review[];
}

export function getRatingBreakdown(reviews: ReviewWithReply[]) {
  return [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length;
    return { rating, count, percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0 };
  });
}
