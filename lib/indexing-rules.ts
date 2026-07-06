import { getWordCount, type BlogPost } from "@/lib/blogs";
import type { Company } from "@/lib/types";

export const largeBrandIndexAllowlist = new Set([
  "ikea",
  "wayfair",
  "dunelm",
  "dfs",
  "sofology",
  "furniture-village",
  "habitat",
  "made",
  "john-lewis",
  "next-home",
  "urban-outfitters-home"
]);

export const blockedPublicSlugs = new Set(["test", "demo", "undefined", "null"]);

export function isValidPublicSlug(slug: string | null | undefined): slug is string {
  if (!slug) return false;
  const cleanSlug = slug.trim();
  if (!cleanSlug) return false;
  if (/\s/.test(cleanSlug)) return false;
  if (blockedPublicSlugs.has(cleanSlug.toLowerCase())) return false;
  return true;
}

export function isPublishedCompany(company: Pick<Company, "slug" | "status">) {
  return isValidPublicSlug(company.slug) && company.status !== "draft";
}

export function shouldIndexBrandPage(company: Pick<Company, "slug" | "status" | "review_count">, approvedReviewCount: number) {
  if (!isPublishedCompany(company)) return false;
  if (approvedReviewCount >= 1) return true;
  return largeBrandIndexAllowlist.has(company.slug);
}

export function shouldIndexCategoryPage(publicBrandCount: number) {
  return publicBrandCount >= 3;
}

export function shouldIndexRankingPage(qualifiedBrandCount: number) {
  return qualifiedBrandCount >= 5;
}

export function shouldIndexComparisonPage(brandAApprovedReviewCount: number, brandBApprovedReviewCount: number) {
  return brandAApprovedReviewCount >= 3 || brandBApprovedReviewCount >= 3;
}

export function shouldIndexPublishedBlog(blog: Pick<BlogPost, "slug" | "status" | "content" | "allow_index">) {
  return Boolean(
    isValidPublicSlug(blog.slug) &&
      blog.status === "published" &&
      blog.content?.trim() &&
      (blog.allow_index || getWordCount(blog.content) >= 500)
  );
}
