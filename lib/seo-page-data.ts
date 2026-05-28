import { getCompanies, getLatestApprovedReviewsForCompanies } from "@/lib/data";
import {
  getCategoryCompanies,
  getRankingCompanies,
  type RankingConfig,
  type SeoCategoryConfig
} from "@/lib/seo-page-config";

const rankingMinimumReviewCount = 5;

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

export async function getCategorySeoData(config: SeoCategoryConfig) {
  const companies = await getCompanies();
  const categoryCompanies = getCategoryCompanies(companies, config);
  const topRatedCompanies = sortByRating(categoryCompanies).slice(0, 6);
  const mostReviewedCompanies = sortByReviewCount(categoryCompanies).slice(0, 6);
  const latestReviews = await getLatestApprovedReviewsForCompanies(
    categoryCompanies.map((company) => company.id),
    6
  );

  return {
    categoryCompanies,
    topRatedCompanies,
    mostReviewedCompanies,
    latestReviews,
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
