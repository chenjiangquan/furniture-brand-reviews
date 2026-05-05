import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";

type SitemapBrand = {
  slug: string;
  updated_at?: string | null;
  created_at?: string | null;
};

const baseUrl = "https://furniturebrandreviews.com";

async function getBrands(): Promise<SitemapBrand[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data: brands, error: brandsError } = await supabase.from("brands").select("slug, updated_at");
  if (!brandsError && brands) return brands;

  const { data: companies, error: companiesError } = await supabase.from("companies").select("slug, created_at");
  if (companiesError || !companies) return [];

  return companies;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brands = await getBrands();
  const staticRoutes = ["", "/brands", "/about", "/contact", "/review-guidelines", "/privacy-policy", "/terms", "/report-review"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date()
    })),
    ...brands.map((brand) => ({
      url: `${baseUrl}/review/${brand.slug}`,
      lastModified: brand.updated_at ?? brand.created_at ?? new Date()
    }))
  ];
}
