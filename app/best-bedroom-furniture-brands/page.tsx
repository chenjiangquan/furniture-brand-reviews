import { RankingSeoPage } from "@/components/RankingSeoPage";
import { createRankingMetadata } from "@/lib/ranking-route";
import { getRankingConfig } from "@/lib/seo-page-config";

const slug = "best-bedroom-furniture-brands";

export function generateMetadata() {
  return createRankingMetadata(slug);
}

export default function BestBedroomFurnitureBrandsPage() {
  return <RankingSeoPage config={getRankingConfig(slug)!} />;
}
