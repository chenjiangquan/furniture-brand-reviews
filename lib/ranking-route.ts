import type { Metadata } from "next";
import { getRankingSeoData } from "@/lib/seo-page-data";
import { getRankingConfig } from "@/lib/seo-page-config";
import { createSeoMetadata } from "@/lib/seo";

export async function createRankingMetadata(slug: string): Promise<Metadata> {
  const config = getRankingConfig(slug);
  if (!config) {
    return {
      title: "Ranking not found",
      robots: { index: false, follow: false }
    };
  }

  const { shouldIndex } = await getRankingSeoData(config);
  return createSeoMetadata({
    title: config.title,
    description: config.description,
    path: `/${config.slug}`,
    noindex: !shouldIndex,
    absoluteTitle: true
  });
}
