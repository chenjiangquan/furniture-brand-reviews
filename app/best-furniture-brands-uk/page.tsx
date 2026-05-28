import { RankingSeoPage } from "@/components/RankingSeoPage";
import { createRankingMetadata } from "@/lib/ranking-route";
import { getRankingConfig } from "@/lib/seo-page-config";

const slug = "best-furniture-brands-uk";

export function generateMetadata() {
  return createRankingMetadata(slug);
}

export default function BestFurnitureBrandsUkPage() {
  return <RankingSeoPage config={getRankingConfig(slug)!} />;
}
