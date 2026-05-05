import type { MetadataRoute } from "next";
import { getCompanies } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const companies = await getCompanies();
  const staticRoutes = ["", "/brands", "/about", "/contact", "/review-guidelines", "/privacy-policy", "/terms", "/report-review"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date()
    })),
    ...companies.map((company) => ({
      url: `${siteUrl}/review/${company.slug}`,
      lastModified: new Date()
    }))
  ];
}
