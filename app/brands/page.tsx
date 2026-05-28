import type { Metadata } from "next";
import Link from "next/link";
import { BrandGrid } from "@/components/BrandGrid";
import { getLatestBlogs } from "@/lib/blogs";
import { getCompanies } from "@/lib/data";
import { getIndexableFeaturedComparisonLinks, getRelatedRankingPages } from "@/lib/internal-links";
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
  const latestBlogs = await getLatestBlogs(3);
  const featuredCategories = categoryConfigs.filter((category) =>
    ["sofa-brands", "bedroom-furniture-brands", "dining-table-brands", "outdoor-furniture-brands", "cheap-furniture-brands"].includes(category.slug)
  );
  const rankingLinks = getRelatedRankingPages("furniture sofa dining bedroom outdoor", 4);
  const comparisonLinks = await getIndexableFeaturedComparisonLinks(4);

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

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Best furniture brand rankings</h2>
          <div className="mt-4 grid gap-2">
            {rankingLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-xl bg-wash px-4 py-3 text-sm font-bold text-trust-dark hover:bg-purple-50">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Compare brands</h2>
          <div className="mt-4 grid gap-2">
            <Link href="/compare" className="rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white hover:bg-trust-dark">
              Compare furniture brands
            </Link>
            {comparisonLinks.slice(0, 3).map((link) => (
              <Link key={link.href} href={link.href} className="rounded-xl bg-wash px-4 py-3 text-sm font-bold text-trust-dark hover:bg-purple-50">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        {latestBlogs.length > 0 ? (
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Latest review guides</h2>
            <div className="mt-4 grid gap-2">
              {latestBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="rounded-xl bg-wash px-4 py-3 text-sm font-bold text-trust-dark hover:bg-purple-50">
                  {blog.title}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <BrandGrid companies={companies} />
    </div>
  );
}
