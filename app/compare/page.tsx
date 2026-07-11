import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getIndexableFeaturedComparisonLinks } from "@/lib/internal-links";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Compare Furniture Brands | Furniture Brand Reviews",
  description:
    "Compare furniture brands by approved customer reviews, average ratings, delivery feedback, product quality, customer service and complaints.",
  path: "/compare"
});

export default async function CompareIndexPage() {
  const comparisons = await getIndexableFeaturedComparisonLinks(30);

  return (
    <main className="bg-wash">
      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-trust-dark">Brand comparisons</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">Compare furniture brands</h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Compare furniture companies using approved customer reviews, ratings, delivery feedback and review intelligence.
          </p>
        </div>

        {comparisons.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((comparison) => (
            <Link
              key={comparison.href}
              href={comparison.href}
              className="group rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-trust/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-ink">{comparison.label}</h2>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-wash text-trust-dark ring-1 ring-line transition group-hover:bg-trust group-hover:text-white">
                  <ArrowRight size={17} />
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                Compare customer ratings, delivery feedback, product quality, customer service and complaints.
              </p>
            </Link>
          ))}
        </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-line bg-white p-8 text-muted shadow-sm">
            There are not enough reviewed brand comparisons to show yet.
          </div>
        )}
      </section>
    </main>
  );
}
