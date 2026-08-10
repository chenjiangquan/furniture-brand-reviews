import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getCompanies } from "@/lib/data";
import { shouldIndexCategoryPage } from "@/lib/indexing-rules";
import { categoryConfigs, getCategoryCompanies } from "@/lib/seo-page-config";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Furniture Review Categories | Furniture Brand Reviews",
  description:
    "Browse furniture brand review categories including sofa brands, dining table brands, bedroom furniture, outdoor furniture and home office furniture.",
  path: "/category"
});

function getShortTitle(h1: string) {
  return h1.replace("Best ", "").replace(" Reviewed by Customers", "");
}

export default async function CategoryIndexPage() {
  const companies = await getCompanies();
  const categories = categoryConfigs.filter((category) =>
    shouldIndexCategoryPage(getCategoryCompanies(companies, category).length)
  );

  return (
    <main className="bg-wash">
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-trust-dark">Furniture categories</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">Browse furniture review categories</h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Explore category pages built from approved customer reviews, ratings, delivery feedback and furniture buying experiences.
          </p>
        </div>

        {categories.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-trust/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-ink">{getShortTitle(category.h1)}</h2>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-wash text-trust-dark ring-1 ring-line transition group-hover:bg-trust group-hover:text-white">
                  <ArrowRight size={17} />
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{category.description}</p>
              <span className="mt-auto pt-5 text-sm font-bold text-trust-dark">View category</span>
            </Link>
          ))}
        </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-line bg-white p-8 text-muted shadow-sm">
            There are not enough reviewed categories to show yet.
          </div>
        )}
      </section>
    </main>
  );
}
