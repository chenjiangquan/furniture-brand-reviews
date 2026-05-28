import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategorySeoPage } from "@/components/CategorySeoPage";
import { getCategorySeoData } from "@/lib/seo-page-data";
import { getCategoryConfig, categoryConfigs } from "@/lib/seo-page-config";
import { createSeoMetadata } from "@/lib/seo";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return categoryConfigs.map((category) => ({
    slug: category.slug
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = getCategoryConfig(params.slug);
  if (!config) {
    return {
      title: "Category not found",
      robots: { index: false, follow: false }
    };
  }

  const { shouldIndex } = await getCategorySeoData(config);
  return createSeoMetadata({
    title: config.title,
    description: config.description,
    path: `/category/${config.slug}`,
    noindex: !shouldIndex,
    absoluteTitle: true
  });
}

export default async function CategoryRoutePage({ params }: Props) {
  const config = getCategoryConfig(params.slug);
  if (!config) notFound();

  return <CategorySeoPage config={config} />;
}
