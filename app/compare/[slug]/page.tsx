import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ComparisonPage } from "@/components/ComparisonPage";
import { featuredComparisons, getComparisonConfig } from "@/lib/comparison-config";
import { getComparisonPageData } from "@/lib/comparison-data";
import { createNoIndexMetadata, createSeoMetadata } from "@/lib/seo";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return featuredComparisons.map((comparison) => ({ slug: comparison.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const comparison = getComparisonConfig(params.slug);
  if (!comparison) return createNoIndexMetadata("Comparison not found", "This furniture brand comparison could not be found.");

  const data = await getComparisonPageData(comparison);
  if (!data) return createNoIndexMetadata("Comparison not found", "This furniture brand comparison could not be found.");

  const brandA = data.brandA.company.name;
  const brandB = data.brandB.company.name;
  const title = `${brandA} vs ${brandB} Reviews | Ratings, Delivery & Complaints Compared`;
  const description =
    data.brandA.intelligence.approvedReviewCount > 0 && data.brandB.intelligence.approvedReviewCount > 0
      ? `Compare ${brandA} and ${brandB} using approved customer reviews on Furniture Brand Reviews. See ratings, delivery feedback, product quality, customer service and complaints.`
      : `Compare ${brandA} and ${brandB} based on customer reviews, average ratings, delivery feedback, product quality, customer service and complaints.`;

  return createSeoMetadata({
    title,
    description,
    path: `/compare/${data.comparison.slug}`,
    absoluteTitle: true,
    noindex: !data.shouldIndex
  });
}

export default async function ComparePage({ params }: Props) {
  const comparison = getComparisonConfig(params.slug);
  if (!comparison) notFound();

  const data = await getComparisonPageData(comparison);
  if (!data) notFound();

  return <ComparisonPage data={data} />;
}
