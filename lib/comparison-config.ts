import type { Company } from "@/lib/types";

export type FeaturedComparison = {
  slug: string;
  brandASlug: string;
  brandBSlug: string;
};

export const featuredComparisons: FeaturedComparison[] = [
  { slug: "wayfair-vs-dunelm", brandASlug: "wayfair-uk", brandBSlug: "dunelm" },
  { slug: "dfs-vs-sofology", brandASlug: "dfs", brandBSlug: "sofology" },
  { slug: "dfs-vs-furniture-village", brandASlug: "dfs", brandBSlug: "furniture-village" },
  { slug: "sofology-vs-furniture-village", brandASlug: "sofology", brandBSlug: "furniture-village" },
  { slug: "habitat-vs-dunelm", brandASlug: "habitat", brandBSlug: "dunelm" },
  { slug: "made-vs-habitat", brandASlug: "made", brandBSlug: "habitat" },
  { slug: "wayfair-vs-furniture-village", brandASlug: "wayfair-uk", brandBSlug: "furniture-village" },
  { slug: "dunelm-vs-furniture-village", brandASlug: "dunelm", brandBSlug: "furniture-village" },
  { slug: "dfs-vs-wayfair", brandASlug: "dfs", brandBSlug: "wayfair-uk" },
  { slug: "sofology-vs-wayfair", brandASlug: "sofology", brandBSlug: "wayfair-uk" }
];

export function getComparisonConfig(slug: string): FeaturedComparison | null {
  const configured = featuredComparisons.find((comparison) => comparison.slug === slug);
  if (configured) return configured;

  const separator = "-vs-";
  const separatorIndex = slug.indexOf(separator);
  if (separatorIndex === -1) return null;

  const brandASlug = slug.slice(0, separatorIndex).trim();
  const brandBSlug = slug.slice(separatorIndex + separator.length).trim();

  if (!brandASlug || !brandBSlug || brandASlug === brandBSlug) return null;

  return {
    slug,
    brandASlug,
    brandBSlug
  };
}

export function getComparisonSlugForBrands(brandASlug: string, brandBSlug: string) {
  const configured = featuredComparisons.find(
    (comparison) =>
      (comparison.brandASlug === brandASlug && comparison.brandBSlug === brandBSlug) ||
      (comparison.brandASlug === brandBSlug && comparison.brandBSlug === brandASlug)
  );

  return configured?.slug ?? `${brandASlug}-vs-${brandBSlug}`;
}

export function getFeaturedComparisonsForCompany(company: Company, companies: Company[], limit = 4) {
  const configured = featuredComparisons
    .filter((comparison) => comparison.brandASlug === company.slug || comparison.brandBSlug === company.slug)
    .map((comparison) => {
      const otherSlug = comparison.brandASlug === company.slug ? comparison.brandBSlug : comparison.brandASlug;
      const otherCompany = companies.find((item) => item.slug === otherSlug);
      return otherCompany ? { comparison, otherCompany } : null;
    })
    .filter(Boolean) as Array<{ comparison: FeaturedComparison; otherCompany: Company }>;

  if (configured.length >= limit) return configured.slice(0, limit);

  const sameCategory = companies
    .filter((item) => item.slug !== company.slug)
    .filter((item) => item.category === company.category)
    .sort((first, second) => Number(second.review_count ?? 0) - Number(first.review_count ?? 0))
    .slice(0, limit - configured.length)
    .map((otherCompany) => ({
      comparison: {
        slug: getComparisonSlugForBrands(company.slug, otherCompany.slug),
        brandASlug: company.slug,
        brandBSlug: otherCompany.slug
      },
      otherCompany
    }));

  return [...configured, ...sameCategory].slice(0, limit);
}
