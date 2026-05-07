import { NextResponse } from "next/server";
import { sampleCompanies, sampleReviews } from "@/lib/sample-data";
import { getSupabase } from "@/lib/supabase";

type WidgetCompany = {
  id: string;
  name: string;
  slug: string;
  average_rating?: number | null;
  review_count?: number | null;
  status?: string | null;
};

type WidgetReview = {
  title: string;
  content: string;
  reviewer_name: string;
  rating: number;
  is_verified: boolean | null;
  created_at: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600"
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

function isMissingColumnError(message: string) {
  return message.includes("PGRST204") || message.toLowerCase().includes("column");
}

async function getCompany(brandSlug: string): Promise<WidgetCompany | null> {
  const supabase = getSupabase();
  if (!supabase) return sampleCompanies.find((company) => company.slug === brandSlug) ?? null;

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, slug, average_rating, review_count, status")
    .eq("slug", brandSlug)
    .maybeSingle();

  if (!error && data) {
    if (typeof data.status === "string" && data.status !== "published") return null;
    return data;
  }

  if (error && !isMissingColumnError(error.message)) return null;

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("companies")
    .select("id, name, slug, average_rating, review_count")
    .eq("slug", brandSlug)
    .maybeSingle();

  if (fallbackError || !fallbackData) return null;
  return fallbackData;
}

async function getApprovedReviews(companyId: string): Promise<WidgetReview[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return sampleReviews
      .filter((review) => review.company_id === companyId && review.status === "approved")
      .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
      .slice(0, 6)
      .map((review) => ({
        title: review.title,
        content: review.content,
        reviewer_name: review.reviewer_name,
        rating: review.rating,
        is_verified: review.is_verified,
        created_at: review.created_at
      }));
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("title, content, reviewer_name, rating, is_verified, created_at")
    .eq("company_id", companyId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data) return [];
  return data;
}

async function getApprovedRatingStats(companyId: string, company: WidgetCompany) {
  const supabase = getSupabase();
  const storedRating = Number(company.average_rating ?? 0);
  const storedReviewCount = Number(company.review_count ?? 0);

  if (!supabase) {
    return {
      rating: storedRating,
      reviewCount: storedReviewCount
    };
  }

  const { count, error: countError } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("status", "approved");

  if (countError) {
    return {
      rating: storedRating,
      reviewCount: storedReviewCount
    };
  }

  const reviewCount = count ?? storedReviewCount;

  if (storedRating > 0 || reviewCount > 1000) {
    return {
      rating: storedRating,
      reviewCount
    };
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("company_id", companyId)
    .eq("status", "approved");

  if (error || !data) {
    return {
      rating: storedRating,
      reviewCount
    };
  }

  const totalRating = data.reduce((sum, review) => sum + Number(review.rating ?? 0), 0);

  return {
    rating: data.length ? Math.round((totalRating / data.length) * 10) / 10 : storedRating,
    reviewCount
  };
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(_: Request, { params }: { params: { brandSlug: string } }) {
  const brandSlug = decodeURIComponent(params.brandSlug).trim().toLowerCase();
  if (!brandSlug) return jsonResponse({ error: "Brand slug is required." }, 400);

  const company = await getCompany(brandSlug);
  if (!company) return jsonResponse({ error: "Brand not found." }, 404);

  const [reviews, stats] = await Promise.all([
    getApprovedReviews(company.id),
    getApprovedRatingStats(company.id, company)
  ]);

  return jsonResponse({
    brandName: company.name,
    brandSlug: company.slug,
    rating: stats.rating,
    reviewCount: stats.reviewCount,
    verified: reviews.some((review) => review.is_verified === true),
    reviews: reviews.map((review) => ({
      title: review.title,
      body: review.content,
      authorName: review.reviewer_name,
      rating: review.rating,
      verified: review.is_verified === true,
      createdAt: review.created_at
    }))
  });
}
