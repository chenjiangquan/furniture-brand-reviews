import { getCompanies, getLatestApprovedReviewsForCompanies } from "@/lib/data";
import { buildReviewIntelligence } from "@/lib/review-intelligence";
import {
  getCategoryCompanies,
  getRankingCompanies,
  type RankingConfig,
  type SeoCategoryConfig
} from "@/lib/seo-page-config";
import type { Company } from "@/lib/types";

const rankingMinimumReviewCount = 5;
export type CategorySort = "highest-rated" | "most-reviewed" | "best-delivery" | "fewest-complaints";
const categoryReviewKeywords: Record<string, string[]> = {
  "sofa-brands": ["sofa", "sofa bed", "sectional", "couch", "armchair", "lounge chair", "living room seating"],
  "dining-table-brands": ["dining table", "dining set", "table", "dining chair"],
  "bedroom-furniture-brands": ["bed", "mattress", "wardrobe", "dresser", "bedside", "bedroom"],
  "outdoor-furniture-brands": ["outdoor", "garden", "patio", "weatherproof", "rattan"],
  "home-office-furniture-brands": ["desk", "office chair", "study", "workspace"]
};

function normaliseText(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function reviewMatchesCategory(review: Awaited<ReturnType<typeof getLatestApprovedReviewsForCompanies>>[number], config: SeoCategoryConfig) {
  const keywords = categoryReviewKeywords[config.slug] ?? config.keywords;
  if (!keywords.length) return true;

  const haystack = normaliseText(`${review.product_type ?? ""} ${review.title ?? ""} ${review.content ?? ""}`);
  if (!haystack) return false;

  return keywords.some((keyword) => haystack.includes(normaliseText(keyword)));
}

function sortByRating(companies: Awaited<ReturnType<typeof getCompanies>>) {
  return [...companies]
    .filter((company) => Number(company.review_count || 0) > 0 && Number(company.average_rating || 0) > 0)
    .sort((first, second) => {
      const ratingSort = Number(second.average_rating || 0) - Number(first.average_rating || 0);
      return ratingSort || Number(second.review_count || 0) - Number(first.review_count || 0);
    });
}

function sortByReviewCount(companies: Awaited<ReturnType<typeof getCompanies>>) {
  return [...companies]
    .filter((company) => Number(company.review_count || 0) > 0)
    .sort((first, second) => {
      const countSort = Number(second.review_count || 0) - Number(first.review_count || 0);
      return countSort || Number(second.average_rating || 0) - Number(first.average_rating || 0);
    });
}

function sortCategoryInsights(insights: CategoryBrandInsight[], sort: CategorySort) {
  return [...insights].sort((first, second) => {
    if (sort === "most-reviewed") {
      return second.company.review_count - first.company.review_count || second.company.average_rating - first.company.average_rating;
    }

    if (sort === "best-delivery") {
      const firstScore = first.metrics.deliveryMentionCount ? first.company.average_rating : 0;
      const secondScore = second.metrics.deliveryMentionCount ? second.company.average_rating : 0;
      return secondScore - firstScore || second.metrics.deliveryMentionCount - first.metrics.deliveryMentionCount || second.company.review_count - first.company.review_count;
    }

    if (sort === "fewest-complaints") {
      return first.metrics.complaintCount - second.metrics.complaintCount || second.company.review_count - first.company.review_count || second.company.average_rating - first.company.average_rating;
    }

    return second.company.average_rating - first.company.average_rating || second.company.review_count - first.company.review_count;
  });
}

export type CategoryBrandInsight = {
  company: Company;
  metrics: {
    deliveryMentionCount: number;
    qualityMentionCount: number;
    complaintCount: number;
  };
};

export async function getCategorySeoData(config: SeoCategoryConfig, sort: CategorySort = "highest-rated") {
  const companies = await getCompanies();
  const categoryCompanies = getCategoryCompanies(companies, config);
  const topRatedCompanies = sortByRating(categoryCompanies).slice(0, 6);
  const mostReviewedCompanies = sortByReviewCount(categoryCompanies).slice(0, 6);
  const latestReviews = await getLatestApprovedReviewsForCompanies(
    categoryCompanies.map((company) => company.id),
    500
  );
  const categorySpecificLatestReviews = latestReviews.filter((review) => reviewMatchesCategory(review, config)).slice(0, 6);
  const categoryBrandInsights = sortCategoryInsights(
    categoryCompanies
      .filter((company) => Number(company.review_count || 0) > 0)
      .map((company) => {
        const companyReviews = latestReviews.filter((review) => review.company_id === company.id);
        const intelligence = buildReviewIntelligence(companyReviews);
        return {
          company,
          metrics: {
            deliveryMentionCount: intelligence.deliveryMentionCount,
            qualityMentionCount: intelligence.qualityMentionCount,
            complaintCount: intelligence.complaintCount
          }
        };
      }),
    sort
  ).slice(0, 12);

  return {
    categoryCompanies,
    categoryBrandInsights,
    topRatedCompanies,
    mostReviewedCompanies,
    latestReviews: categorySpecificLatestReviews,
    shouldIndex: categoryCompanies.length >= 3
  };
}

export async function getRankingSeoData(config: RankingConfig) {
  const companies = await getCompanies();
  const rankedCompanies = getRankingCompanies(companies, config, rankingMinimumReviewCount);
  const latestReviews = await getLatestApprovedReviewsForCompanies(
    rankedCompanies.map((company) => company.id),
    6
  );

  return {
    rankedCompanies,
    latestReviews,
    shouldIndex: rankedCompanies.length >= 5,
    minimumReviewCount: rankingMinimumReviewCount
  };
}
