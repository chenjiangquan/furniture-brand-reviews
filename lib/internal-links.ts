import { featuredComparisons, getComparisonSlugForBrands } from "@/lib/comparison-config";
import { getComparisonPageData } from "@/lib/comparison-data";
import { categoryConfigs, companyMatchesKeywords, rankingConfigs, type SeoCategoryConfig } from "@/lib/seo-page-config";
import { shouldIndexBlog, type BlogPost } from "@/lib/blogs";
import type { Company } from "@/lib/types";

export type InternalLink = {
  href: string;
  label: string;
  description?: string;
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

function companySearchText(company: Company) {
  return normalizeText(`${company.name} ${company.slug} ${company.website} ${company.category} ${company.description ?? ""}`);
}

function blogSearchText(blog: BlogPost) {
  return normalizeText(`${blog.title} ${blog.slug} ${blog.category ?? ""} ${blog.excerpt ?? ""} ${blog.content ?? ""}`);
}

function uniqueLinks(links: InternalLink[], limit: number) {
  const seen = new Set<string>();
  return links
    .filter((link) => {
      if (seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    })
    .slice(0, limit);
}

export function isPublicBrand(company: Company) {
  return Boolean(company.slug) && company.status !== "draft";
}

export function getRelatedBrands(currentBrand: Company, allBrands: Company[], limit = 6) {
  return allBrands
    .filter((brand) => isPublicBrand(brand) && brand.slug !== currentBrand.slug)
    .sort((first, second) => {
      const firstSameCategory = first.category === currentBrand.category ? 1 : 0;
      const secondSameCategory = second.category === currentBrand.category ? 1 : 0;
      if (firstSameCategory !== secondSameCategory) return secondSameCategory - firstSameCategory;

      const reviewCountSort = Number(second.review_count || 0) - Number(first.review_count || 0);
      if (reviewCountSort !== 0) return reviewCountSort;

      return Number(second.average_rating || 0) - Number(first.average_rating || 0);
    })
    .slice(0, limit);
}

export function getRelatedCategories(input: Company | SeoCategoryConfig | string, limit = 4): InternalLink[] {
  const haystack =
    typeof input === "string"
      ? normalizeText(input)
      : "slug" in input && "keywords" in input
        ? normalizeText(`${input.slug} ${input.title} ${input.description} ${input.keywords.join(" ")}`)
        : companySearchText(input);

  const matched = categoryConfigs.filter((category) =>
    category.keywords.some((keyword) => haystack.includes(keyword.toLowerCase())) || haystack.includes(category.slug.replace(/-/g, " "))
  );

  const fallback = categoryConfigs.filter((category) => !matched.some((item) => item.slug === category.slug));

  return uniqueLinks(
    [...matched, ...fallback].map((category) => ({
      href: `/category/${category.slug}`,
      label: category.h1.replace(" Reviewed by Customers", "")
    })),
    limit
  );
}

export function getRelatedRankingPages(input?: Company | SeoCategoryConfig | string | null, limit = 4): InternalLink[] {
  const haystack = input
    ? typeof input === "string"
      ? normalizeText(input)
      : "keywords" in input
        ? normalizeText(`${input.slug} ${input.title} ${input.keywords.join(" ")}`)
        : companySearchText(input)
    : "";

  const matched = rankingConfigs.filter((ranking) =>
    ranking.keywords?.some((keyword) => haystack.includes(keyword.toLowerCase())) ||
    ranking.relatedCategories.some((slug) => haystack.includes(slug.replace(/-/g, " ")))
  );

  const fallback = rankingConfigs.filter((ranking) => !matched.some((item) => item.slug === ranking.slug));

  return uniqueLinks(
    [...matched, ...fallback].map((ranking) => ({
      href: `/${ranking.slug}`,
      label: ranking.h1
    })),
    limit
  );
}

export function getRelatedComparisons(currentBrand: Company, relatedBrands: Company[], limit = 4): InternalLink[] {
  const configured = featuredComparisons
    .filter((comparison) => comparison.brandASlug === currentBrand.slug || comparison.brandBSlug === currentBrand.slug)
    .map((comparison) => {
      const otherSlug = comparison.brandASlug === currentBrand.slug ? comparison.brandBSlug : comparison.brandASlug;
      const otherBrand = relatedBrands.find((brand) => brand.slug === otherSlug);
      if (!otherBrand) return null;
      return {
        href: `/compare/${comparison.slug}`,
        label: `${currentBrand.name} vs ${otherBrand.name}`
      };
    })
    .filter(Boolean) as InternalLink[];

  const generated = relatedBrands
    .filter((brand) => currentBrand.slug !== brand.slug)
    .filter((brand) => Number(currentBrand.review_count || 0) >= 3 || Number(brand.review_count || 0) >= 3)
    .map((brand) => ({
      href: `/compare/${getComparisonSlugForBrands(currentBrand.slug, brand.slug)}`,
      label: `${currentBrand.name} vs ${brand.name}`
    }));

  return uniqueLinks([...configured, ...generated], limit);
}

export function getCategoryComparisons(config: SeoCategoryConfig, companies: Company[], limit = 5): InternalLink[] {
  const categoryBrands = companies
    .filter((company) => isPublicBrand(company) && companyMatchesKeywords(company, config.keywords))
    .sort((first, second) => Number(second.review_count || 0) - Number(first.review_count || 0));

  const links: InternalLink[] = [];
  for (let index = 0; index < categoryBrands.length - 1 && links.length < limit; index += 1) {
    const first = categoryBrands[index];
    const second = categoryBrands[index + 1];
    if (Number(first.review_count || 0) < 3 && Number(second.review_count || 0) < 3) continue;
    links.push({
      href: `/compare/${getComparisonSlugForBrands(first.slug, second.slug)}`,
      label: `${first.name} vs ${second.name}`
    });
  }

  return uniqueLinks(links, limit);
}

export function getFeaturedComparisonLinks(limit = 5): InternalLink[] {
  return featuredComparisons.slice(0, limit).map((comparison) => ({
    href: `/compare/${comparison.slug}`,
    label: comparison.slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .replace(" Vs ", " vs ")
  }));
}

export async function getIndexableFeaturedComparisonLinks(limit = 5): Promise<InternalLink[]> {
  const comparisonData = await Promise.all(featuredComparisons.map((comparison) => getComparisonPageData(comparison)));

  return comparisonData
    .filter((comparison) => Boolean(comparison?.shouldIndex))
    .map((comparison) => ({
      href: `/compare/${comparison!.comparison.slug}`,
      label: `${comparison!.brandA.company.name} vs ${comparison!.brandB.company.name}`
    }))
    .slice(0, limit);
}

export function getRelatedBlogs(topic: Company | SeoCategoryConfig | string, blogs: BlogPost[], limit = 3): InternalLink[] {
  const topicText =
    typeof topic === "string"
      ? normalizeText(topic)
      : "keywords" in topic
        ? normalizeText(`${topic.slug} ${topic.title} ${topic.keywords.join(" ")}`)
        : companySearchText(topic);

  const topicTerms = topicText
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 4)
    .slice(0, 16);

  return blogs
    .filter((blog) => blog.status === "published" && blog.slug && shouldIndexBlog(blog))
    .map((blog) => {
      const searchText = blogSearchText(blog);
      const score = topicTerms.reduce((total, term) => total + (searchText.includes(term) ? 1 : 0), 0);
      return { blog, score };
    })
    .filter(({ score }) => score > 0)
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      return new Date(second.blog.published_at ?? second.blog.created_at).getTime() - new Date(first.blog.published_at ?? first.blog.created_at).getTime();
    })
    .map(({ blog }) => ({
      href: `/blog/${blog.slug}`,
      label: blog.title,
      description: blog.excerpt ?? undefined
    }))
    .slice(0, limit);
}

export function getBlogRelatedBrands(blog: BlogPost, companies: Company[], limit = 5) {
  const text = blogSearchText(blog);
  return companies
    .filter(isPublicBrand)
    .map((company) => {
      const exactName = text.includes(company.name.toLowerCase()) ? 4 : 0;
      const slugScore = text.includes(company.slug.replace(/-/g, " ")) ? 3 : 0;
      const categoryScore = normalizeText(company.category)
        .split(/[^a-z0-9]+/)
        .filter((term) => term.length >= 4)
        .reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
      return { company, score: exactName + slugScore + categoryScore };
    })
    .filter(({ score }) => score > 0)
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      return Number(second.company.review_count || 0) - Number(first.company.review_count || 0);
    })
    .map(({ company }) => company)
    .slice(0, limit);
}

export function getBlogRelatedComparisons(blog: BlogPost, companies: Company[], limit = 3): InternalLink[] {
  const brands = getBlogRelatedBrands(blog, companies, 6);
  const links: InternalLink[] = [];

  for (let firstIndex = 0; firstIndex < brands.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < brands.length; secondIndex += 1) {
      const first = brands[firstIndex];
      const second = brands[secondIndex];
      if (Number(first.review_count || 0) < 3 && Number(second.review_count || 0) < 3) continue;
      links.push({
        href: `/compare/${getComparisonSlugForBrands(first.slug, second.slug)}`,
        label: `${first.name} vs ${second.name}`
      });
    }
  }

  return uniqueLinks(links, limit);
}
