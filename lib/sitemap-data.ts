import { featuredComparisons } from "@/lib/comparison-config";
import { getComparisonPageData, type ComparisonPageData } from "@/lib/comparison-data";
import { getCompanies } from "@/lib/data";
import { shouldIndexPublishedBlog, shouldIndexBrandPage, shouldIndexCategoryPage, shouldIndexRankingPage } from "@/lib/indexing-rules";
import { getSupabase } from "@/lib/supabase";
import { siteUrl } from "@/lib/seo";
import { categoryConfigs, getCategoryCompanies, getRankingCompanies, rankingConfigs } from "@/lib/seo-page-config";
import type { BlogPost } from "@/lib/blogs";

export type SitemapEntry = {
  url: string;
  lastmod: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
};

const nowIso = () => new Date().toISOString();

function isoDate(value: string | null | undefined) {
  if (!value) return nowIso();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? nowIso() : date.toISOString();
}

function absolute(path: string) {
  return `${siteUrl}${path}`;
}

export function getStaticSitemapEntries(): SitemapEntry[] {
  const now = nowIso();
  return [
    { url: absolute("/"), lastmod: now, changefreq: "daily", priority: "1.0" },
    { url: absolute("/brands"), lastmod: now, changefreq: "daily", priority: "0.8" },
    { url: absolute("/category"), lastmod: now, changefreq: "weekly", priority: "0.7" },
    { url: absolute("/compare"), lastmod: now, changefreq: "weekly", priority: "0.7" },
    { url: absolute("/blog"), lastmod: now, changefreq: "weekly", priority: "0.7" },
    { url: absolute("/about"), lastmod: now, changefreq: "monthly", priority: "0.5" },
    { url: absolute("/how-it-works"), lastmod: now, changefreq: "monthly", priority: "0.5" },
    { url: absolute("/review-guidelines"), lastmod: now, changefreq: "monthly", priority: "0.5" },
    { url: absolute("/trust-and-safety"), lastmod: now, changefreq: "monthly", priority: "0.5" },
    { url: absolute("/content-policy"), lastmod: now, changefreq: "monthly", priority: "0.5" },
    { url: absolute("/business-guidelines"), lastmod: now, changefreq: "monthly", priority: "0.5" },
    { url: absolute("/report-a-review"), lastmod: now, changefreq: "monthly", priority: "0.5" },
    { url: absolute("/contact"), lastmod: now, changefreq: "monthly", priority: "0.5" },
    { url: absolute("/privacy-policy"), lastmod: now, changefreq: "monthly", priority: "0.5" },
    { url: absolute("/terms"), lastmod: now, changefreq: "monthly", priority: "0.5" },
    { url: absolute("/cookie-policy"), lastmod: now, changefreq: "monthly", priority: "0.5" },
    { url: absolute("/system-status"), lastmod: now, changefreq: "monthly", priority: "0.5" }
  ];
}

export async function getBrandSitemapEntries(): Promise<SitemapEntry[]> {
  const companies = await getCompanies();
  return companies
    .filter((company) => shouldIndexBrandPage(company, Number(company.review_count || 0)))
    .sort((first, second) => Number(second.review_count || 0) - Number(first.review_count || 0))
    .map((company) => ({
      url: absolute(`/review/${company.slug}`),
      lastmod: isoDate(company.created_at),
      changefreq: "daily",
      priority: "0.8"
    }));
}

export async function getCategorySitemapEntries(): Promise<SitemapEntry[]> {
  const companies = await getCompanies();
  const now = nowIso();
  return categoryConfigs
    .filter((category) => shouldIndexCategoryPage(getCategoryCompanies(companies, category).length))
    .map((category) => ({
      url: absolute(`/category/${category.slug}`),
      lastmod: now,
      changefreq: "weekly",
      priority: "0.7"
    }));
}

export async function getRankingSitemapEntries(): Promise<SitemapEntry[]> {
  const companies = await getCompanies();
  const now = nowIso();
  return rankingConfigs
    .filter((ranking) => shouldIndexRankingPage(getRankingCompanies(companies, ranking, 5).length))
    .map((ranking) => ({
      url: absolute(`/${ranking.slug}`),
      lastmod: now,
      changefreq: "weekly",
      priority: "0.7"
    }));
}

export async function getComparisonSitemapEntries(): Promise<SitemapEntry[]> {
  const now = nowIso();
  const comparisonData = await Promise.all(featuredComparisons.map((comparison) => getComparisonPageData(comparison)));
  return comparisonData
    .filter((comparison): comparison is ComparisonPageData => Boolean(comparison?.shouldIndex))
    .map((comparison) => ({
      url: absolute(`/compare/${comparison.comparison.slug}`),
      lastmod: now,
      changefreq: "weekly",
      priority: "0.7"
    }));
}

export async function getBlogSitemapEntries(): Promise<SitemapEntry[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published");

  if (error || !data) return [];

  return (data as BlogPost[])
    .filter(shouldIndexPublishedBlog)
    .map((blog) => ({
      url: absolute(`/blog/${blog.slug}`),
      lastmod: isoDate(blog.updated_at ?? blog.published_at ?? blog.created_at),
      changefreq: "weekly",
      priority: "0.7"
    }));
}

export function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderUrlSet(entries: SitemapEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
}

export function renderSitemapIndex(entries: Array<{ loc: string; lastmod: string }>) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <sitemap>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;
}
