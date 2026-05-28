import { RankingSeoPage } from "@/components/RankingSeoPage";
import { createRankingMetadata } from "@/lib/ranking-route";
import { getRankingConfig } from "@/lib/seo-page-config";

const slug = "best-outdoor-furniture-brands";

export function generateMetadata() {
  return createRankingMetadata(slug);
}

export default function BestOutdoorFurnitureBrandsPage() {
  return <RankingSeoPage config={getRankingConfig(slug)!} />;
}
