import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { sampleCompanies, sampleReviews } from "@/lib/sample-data";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";
import type { Company, Review, ReviewFlag, ReviewWithReply } from "@/lib/types";

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

export type ApprovedReviewStats = {
  count: number;
  averageRating: number;
  ratingCounts: Record<1 | 2 | 3 | 4 | 5, number>;
};

export const approvedReviewListLimit = 1000;

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

    const calculatedAverage = Math.round((companyStats.total / companyStats.count) * 10) / 10;

    return {
      ...company,
      average_rating: calculatedAverage,
      review_count: companyStats.count
    };
  });
}

function buildApprovedReviewStats(reviews: Array<{ rating: number | null }>): ApprovedReviewStats {
  const ratingCounts: ApprovedReviewStats["ratingCounts"] = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };
  let total = 0;
  let count = 0;

  for (const review of reviews) {
    const rating = Number(review.rating);
    if (![1, 2, 3, 4, 5].includes(rating)) continue;

    ratingCounts[rating as 1 | 2 | 3 | 4 | 5] += 1;
    total += rating;
    count += 1;
  }

  return {
    count,
    averageRating: count ? Math.round((total / count) * 10) / 10 : 0,
    ratingCounts
  };
}

export const getApprovedReviewStatsForCompany = cache(async (companyId: string): Promise<ApprovedReviewStats> => {
  noStore();
  const supabase = getSupabase();

  if (!supabase) {
    return buildApprovedReviewStats(sampleReviews.filter((review) => review.company_id === companyId));
  }

  const pageSize = 1000;
  let from = 0;
  const ratings: Array<{ rating: number | null }> = [];

  while (true) {
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("company_id", companyId)
      .eq("status", "approved")
      .range(from, from + pageSize - 1);

    if (error) {
      console.error(error);
      break;
    }

    ratings.push(...(data ?? []));

    if (!data || data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return buildApprovedReviewStats(ratings);
});

export const getCompanies = cache(async (): Promise<Company[]> => {
  noStore();
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
  noStore();
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

  const approvedStats = await getApprovedReviewStatsForCompany(company.id);
  return {
    ...company,
    average_rating: approvedStats.averageRating,
    review_count: approvedStats.count
  };
});

export const getApprovedReviewsForCompany = cache(async (companyId: string): Promise<ReviewWithReply[]> => {
  noStore();
  const supabase = getSupabase();
  if (!supabase) return sampleReviews.filter((review) => review.company_id === companyId);

  const { data, error } = await supabase
    .from("reviews")
    .select("id, company_id, pending_brand_name, pending_brand_slug, rating, title, content, reviewer_name, reviewer_email, order_number, product_type, order_month, delivery_experience, customer_service_experience, would_buy_again, proof_image_url, review_image_urls, status, is_verified, useful_count, created_at")
    .eq("company_id", companyId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(approvedReviewListLimit);

  if (error) {
    console.error(error);
    return [];
  }

  const reviews = data ?? [];
  if (reviews.length === 0) return [];

  const { data: replies, error: repliesError } = await supabase
    .from("company_replies")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (repliesError) {
    console.error(repliesError);
    return reviews.map((review) => ({ ...review, company_replies: [] })) as ReviewWithReply[];
  }

  return reviews.map((review) => ({
    ...review,
    company_replies: (replies ?? []).filter((reply) => reply.review_id === review.id).slice(0, 1)
  })) as ReviewWithReply[];
});

export const getLatestApprovedReviews = cache(async (): Promise<ReviewWithReply[]> => {
  noStore();
  const supabase = getSupabase();
  if (!supabase) return sampleReviews.filter((review) => !review.review_image_urls?.length).slice(0, 8);

  const { data, error } = await supabase
    .from("reviews")
    .select("*, companies(name, slug)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) {
    console.error(error);
    return sampleReviews;
  }

  return (data ?? []).filter((review) => !review.review_image_urls?.length).slice(0, 8);
});

export const getLatestApprovedReviewsForCompanies = cache(async (companyIds: string[], limit = 6): Promise<ReviewWithReply[]> => {
  noStore();
  const filteredCompanyIds = companyIds.filter(Boolean);
  if (!filteredCompanyIds.length) return [];

  const supabase = getSupabase();
  if (!supabase) {
    return sampleReviews
      .filter((review) => review.company_id && filteredCompanyIds.includes(review.company_id))
      .slice(0, limit);
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*, companies(name, slug)")
    .eq("status", "approved")
    .in("company_id", filteredCompanyIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as ReviewWithReply[];
});

export async function getPendingReviews(password: string): Promise<Review[]> {
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return [];

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("id, company_id, pending_brand_name, pending_brand_slug, rating, title, content, reviewer_name, reviewer_email, order_number, product_type, order_month, delivery_experience, customer_service_experience, would_buy_again, proof_image_url, review_image_urls, status, is_verified, created_at, companies(name, slug)")
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

export async function getPendingReviewFlags(password: string): Promise<ReviewFlag[]> {
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return [];

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("review_flags")
    .select(
      "id, review_id, company_id, reason, details, reported_by_email, status, created_at, reviewed_at, reviews(id, rating, title, content, reviewer_name, reviewer_email, created_at), companies(name, slug)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((flag) => ({
    ...flag,
    reviews: Array.isArray(flag.reviews) ? flag.reviews[0] : flag.reviews,
    companies: Array.isArray(flag.companies) ? flag.companies[0] : flag.companies
  })) as ReviewFlag[];
}

export function getRatingBreakdown(reviews: ReviewWithReply[]) {
  return [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length;
    return { rating, count, percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0 };
  });
}

export function getRatingBreakdownFromStats(stats: ApprovedReviewStats) {
  return ([5, 4, 3, 2, 1] as const).map((rating) => {
    const count = stats.ratingCounts[rating];
    return {
      rating,
      count,
      percentage: stats.count ? Math.round((count / stats.count) * 100) : 0
    };
  });
}
