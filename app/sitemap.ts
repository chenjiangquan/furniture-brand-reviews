import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";

export const revalidate = 3600;

const baseUrl = "https://furniturebrandreviews.com";
const sitemapPageSize = 1000;

type SitemapCompany = {
  slug: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  status?: string | null;
};

type SitemapBlog = {
  slug: string | null;
  updated_at?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  status?: string | null;
};

const blockedSlugs = new Set(["test", "demo", "undefined", "null"]);

const staticRoutes = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/brands", changeFrequency: "daily", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.5 },
  { path: "/review-guidelines", changeFrequency: "monthly", priority: 0.6 },
  { path: "/report-review", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/reviewer-rules", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy-choices", changeFrequency: "monthly", priority: 0.4 },
  { path: "/help-centre", changeFrequency: "monthly", priority: 0.5 },
  { path: "/trust-and-safety", changeFrequency: "monthly", priority: 0.5 },
  { path: "/respond-to-reviews", changeFrequency: "monthly", priority: 0.5 },
  { path: "/brand-tools", changeFrequency: "monthly", priority: 0.5 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.4 },
  { path: "/sofa-brands", changeFrequency: "weekly", priority: 0.6 },
  { path: "/dining-table-brands", changeFrequency: "weekly", priority: 0.6 },
  { path: "/bedroom-furniture-brands", changeFrequency: "weekly", priority: 0.6 },
  { path: "/outdoor-furniture", changeFrequency: "weekly", priority: 0.6 },
  { path: "/home-office-furniture", changeFrequency: "weekly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.4 },
  { path: "/content-policy", changeFrequency: "monthly", priority: 0.4 },
  { path: "/cookie-policy", changeFrequency: "monthly", priority: 0.4 },
  { path: "/system-status", changeFrequency: "monthly", priority: 0.4 }
] satisfies Array<Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority"> & { path: string }>;

function isMissingColumnError(errorMessage: string) {
  return errorMessage.toLowerCase().includes("column") || errorMessage.includes("PGRST204");
}

function isValidSlug(slug: string | null): slug is string {
  if (!slug) return false;

  const cleanSlug = slug.trim();
  if (!cleanSlug) return false;
  if (/\s/.test(cleanSlug)) return false;
  if (blockedSlugs.has(cleanSlug.toLowerCase())) return false;

  return true;
}

function getLastModified(company: SitemapCompany, fallbackDate: Date) {
  const dateValue = company.updated_at ?? company.created_at;
  if (!dateValue) return fallbackDate;

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? fallbackDate : parsedDate;
}

function getBlogLastModified(blog: SitemapBlog, fallbackDate: Date) {
  const dateValue = blog.updated_at ?? blog.published_at ?? blog.created_at;
  if (!dateValue) return fallbackDate;

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? fallbackDate : parsedDate;
}

async function getCompanies(): Promise<SitemapCompany[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const companies: SitemapCompany[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("companies")
      .select("slug, updated_at, created_at, status")
      .range(from, from + sitemapPageSize - 1);

    if (!error && data) {
      companies.push(...data);
      if (data.length < sitemapPageSize) return companies;
      from += sitemapPageSize;
      continue;
    }

    if (error && !isMissingColumnError(error.message)) return companies;

    const fallbackCompanies: SitemapCompany[] = [];
    let fallbackFrom = 0;

    while (true) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("companies")
        .select("slug, created_at")
        .range(fallbackFrom, fallbackFrom + sitemapPageSize - 1);

      if (fallbackError || !fallbackData) return fallbackCompanies;

      fallbackCompanies.push(...fallbackData);
      if (fallbackData.length < sitemapPageSize) return fallbackCompanies;
      fallbackFrom += sitemapPageSize;
    }
  }
}

async function getBlogs(): Promise<SitemapBlog[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blogs")
    .select("slug, updated_at, published_at, status")
    .eq("status", "published");

  if (error || !data) return [];

  return data;
}

function getUniquePublishedCompanies(companies: SitemapCompany[]) {
  const seenSlugs = new Set<string>();

  return companies
    .filter((company) => {
      if (!isValidSlug(company.slug)) return false;
      if (typeof company.status === "string" && company.status !== "published") return false;

      const slug = company.slug.trim();
      if (seenSlugs.has(slug)) return false;

      seenSlugs.add(slug);
      return true;
    })
    .sort((a, b) => {
      const firstDate = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
      const secondDate = new Date(b.updated_at ?? b.created_at ?? 0).getTime();

      return secondDate - firstDate;
    });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const companies = getUniquePublishedCompanies(await getCompanies());
  const blogs = (await getBlogs()).filter((blog) => isValidSlug(blog.slug) && blog.status === "published");
  const staticSitemapRoutes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));

  const brandRoutes: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${baseUrl}/review/${company.slug?.trim()}`,
    lastModified: getLastModified(company, now),
    changeFrequency: "daily",
    priority: 0.8
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug?.trim()}`,
    lastModified: getBlogLastModified(blog, now),
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticSitemapRoutes, ...brandRoutes, ...blogRoutes];
}
