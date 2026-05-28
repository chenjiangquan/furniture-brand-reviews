import { getApprovedReviewsForCompany, getCompanies, getCompanyBySlug } from "@/lib/data";
import { buildReviewIntelligence, getReviewsForIntelligence, type ReviewIntelligence } from "@/lib/review-intelligence";
import type { FeaturedComparison } from "@/lib/comparison-config";
import type { Company, ReviewWithReply } from "@/lib/types";

export type ComparisonBrandData = {
  company: Company;
  reviews: ReviewWithReply[];
  intelligence: ReviewIntelligence;
};

export type ComparisonPageData = {
  comparison: FeaturedComparison;
  brandA: ComparisonBrandData;
  brandB: ComparisonBrandData;
  latestReviews: ReviewWithReply[];
  relatedComparisons: Array<{ slug: string; label: string }>;
  shouldIndex: boolean;
};

export function isComparisonIndexable(brandA: ComparisonBrandData, brandB: ComparisonBrandData) {
  return brandA.intelligence.approvedReviewCount >= 3 || brandB.intelligence.approvedReviewCount >= 3;
}

function getLatestComparisonReviews(reviewsA: ReviewWithReply[], reviewsB: ReviewWithReply[]) {
  return [...reviewsA, ...reviewsB]
    .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
    .slice(0, 6);
}

function getRelatedComparisons(companyA: Company, companyB: Company, companies: Company[]) {
  return companies
    .filter((company) => company.slug !== companyA.slug && company.slug !== companyB.slug)
    .filter((company) => company.category === companyA.category || company.category === companyB.category)
    .sort((first, second) => Number(second.review_count ?? 0) - Number(first.review_count ?? 0))
    .slice(0, 4)
    .map((company) => ({
      slug: `${companyA.slug}-vs-${company.slug}`,
      label: `${companyA.name} vs ${company.name}`
    }));
}

export async function getComparisonPageData(comparison: FeaturedComparison): Promise<ComparisonPageData | null> {
  if (comparison.brandASlug === comparison.brandBSlug) return null;

  const [companyA, companyB] = await Promise.all([
    getCompanyBySlug(comparison.brandASlug),
    getCompanyBySlug(comparison.brandBSlug)
  ]);

  if (!companyA || !companyB || companyA.id === companyB.id) return null;

  const [rawReviewsA, rawReviewsB, companies] = await Promise.all([
    getApprovedReviewsForCompany(companyA.id),
    getApprovedReviewsForCompany(companyB.id),
    getCompanies()
  ]);

  const reviewsA = getReviewsForIntelligence(rawReviewsA);
  const reviewsB = getReviewsForIntelligence(rawReviewsB);
  const brandA = {
    company: companyA,
    reviews: reviewsA,
    intelligence: buildReviewIntelligence(reviewsA)
  };
  const brandB = {
    company: companyB,
    reviews: reviewsB,
    intelligence: buildReviewIntelligence(reviewsB)
  };

  return {
    comparison,
    brandA,
    brandB,
    latestReviews: getLatestComparisonReviews(reviewsA, reviewsB),
    relatedComparisons: getRelatedComparisons(companyA, companyB, companies),
    shouldIndex: isComparisonIndexable(brandA, brandB)
  };
}
