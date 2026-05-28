import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandCard } from "@/components/BrandCard";
import { JsonLd } from "@/components/JsonLd";
import { LatestReviewCard } from "@/components/LatestReviewCard";
import { RatingStars } from "@/components/RatingStars";
import { buildBreadcrumbSchema, buildCollectionPageSchema, buildFaqSchema, buildGraph, buildItemListSchema } from "@/lib/jsonLd";
import { getCategorySeoData } from "@/lib/seo-page-data";
import { getCategoryConfig, type SeoCategoryConfig } from "@/lib/seo-page-config";
import { absoluteUrl } from "@/lib/seo";

export async function CategorySeoPage({ config }: { config: SeoCategoryConfig }) {
  const { categoryCompanies, topRatedCompanies, mostReviewedCompanies, latestReviews } = await getCategorySeoData(config);
  const pagePath = `/category/${config.slug}`;
  const pageUrl = absoluteUrl(pagePath);
  const itemListSchema = buildItemListSchema(
    topRatedCompanies.map((company, index) => ({
      position: index + 1,
      name: company.name,
      url: absoluteUrl(`/review/${company.slug}`),
      ratingValue: company.average_rating,
      reviewCount: company.review_count
    }))
  );

  return (
    <div className="bg-white">
      <JsonLd
        data={buildGraph([
          buildCollectionPageSchema(config.h1, config.description, pagePath),
          buildBreadcrumbSchema([
            { name: "Home", url: absoluteUrl("/") },
            { name: "Categories", url: absoluteUrl("/brands") },
            { name: config.h1, url: pageUrl }
          ]),
          itemListSchema,
          buildFaqSchema(config.faqs)
        ])}
      />

      <section className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <nav className="text-sm font-semibold text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-trust-dark">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/brands" className="hover:text-trust-dark">Categories</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{config.h1}</span>
          </nav>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">{config.h1}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{config.intro}</p>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1400px] gap-12 px-4 py-12 sm:px-6 lg:px-10">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-ink">Top rated brands in this category</h2>
              <p className="mt-2 text-sm text-muted">Sorted by approved review average rating, then review count.</p>
            </div>
            <span className="rounded-full bg-purple-50 px-4 py-2 text-sm font-bold text-trust-dark">
              {categoryCompanies.length} matching brands
            </span>
          </div>
          {topRatedCompanies.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topRatedCompanies.map((company) => (
                <BrandCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-muted shadow-sm">Not enough reviewed brands yet.</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ink">Most reviewed brands in this category</h2>
          <div className="mt-6 grid gap-3">
            {mostReviewedCompanies.map((company, index) => (
              <article key={company.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-trust-dark">#{index + 1}</p>
                    <h3 className="text-lg font-bold text-ink">{company.name}</h3>
                    <p className="text-sm text-muted">{company.category}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <RatingStars rating={company.average_rating} size="small" />
                    <span className="font-bold text-ink">{company.average_rating.toFixed(1)}</span>
                    <span className="text-sm text-muted">{company.review_count} reviews</span>
                    <Link href={`/review/${company.slug}`} className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-trust-dark">
                      Read reviews
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {latestReviews.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-ink">Latest reviews from brands in this category</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {latestReviews.map((review) => (
                <LatestReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-line bg-wash p-6">
          <h2 className="text-2xl font-bold text-ink">Related categories</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {config.related
              .map((slug) => getCategoryConfig(slug))
              .filter(Boolean)
              .map((category) => (
                <Link
                  key={category!.slug}
                  href={`/category/${category!.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust"
                >
                  {category!.h1.replace(" Reviewed by Customers", "")}
                  <ArrowRight size={15} />
                </Link>
              ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-ink">FAQ</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {config.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-bold text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
