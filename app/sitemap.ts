import type { MetadataRoute } from "next";
import { getCompanies } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://www.furniturebrandreviews.com";
  const companies = await getCompanies();
  const staticRoutes = ["", "/brands"];

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
