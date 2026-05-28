import type { Metadata } from "next";
import Link from "next/link";
import { BrandGrid } from "@/components/BrandGrid";
import { getCompanies } from "@/lib/data";
import { categoryConfigs } from "@/lib/seo-page-config";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Furniture Brand Reviews | Browse Furniture Brands Worldwide",
  description: "Browse furniture brands worldwide by rating, category and review count.",
  path: "/brands",
  absoluteTitle: true
});

export default async function BrandsPage() {
  const companies = await getCompanies();
  const featuredCategories = categoryConfigs.filter((category) =>
    ["sofa-brands", "bedroom-furniture-brands", "dining-table-brands", "outdoor-furniture-brands", "cheap-furniture-brands"].includes(category.slug)
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Furniture Brand Reviews</h1>
      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Browse by category</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {featuredCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="rounded-full bg-wash px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust"
            >
              {category.h1.replace(" Reviewed by Customers", "")}
            </Link>
          ))}
          <Link href="/best-furniture-brands" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-trust-dark">
            Best furniture brands
          </Link>
        </div>
      </div>
      <BrandGrid companies={companies} />
    </div>
  );
}
