import { RankingSeoPage } from "@/components/RankingSeoPage";
import { createRankingMetadata } from "@/lib/ranking-route";
import { getRankingConfig } from "@/lib/seo-page-config";

const slug = "worst-furniture-brands";

export function generateMetadata() {
  return createRankingMetadata(slug);
}

export default function WorstFurnitureBrandsPage() {
  return <RankingSeoPage config={getRankingConfig(slug)!} />;
}
