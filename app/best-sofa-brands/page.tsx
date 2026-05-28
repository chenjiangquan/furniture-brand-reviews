import { RankingSeoPage } from "@/components/RankingSeoPage";
import { createRankingMetadata } from "@/lib/ranking-route";
import { getRankingConfig } from "@/lib/seo-page-config";

const slug = "best-sofa-brands";

export function generateMetadata() {
  return createRankingMetadata(slug);
}

export default function BestSofaBrandsPage() {
  return <RankingSeoPage config={getRankingConfig(slug)!} />;
}
