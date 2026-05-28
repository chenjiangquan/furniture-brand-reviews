import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandCard } from "@/components/BrandCard";
import { JsonLd } from "@/components/JsonLd";
import { LatestReviewCard } from "@/components/LatestReviewCard";
import { RatingStars } from "@/components/RatingStars";
import { buildBreadcrumbSchema, buildGraph, buildItemListSchema } from "@/lib/jsonLd";
import { getRankingSeoData } from "@/lib/seo-page-data";
import { categoryConfigs, type RankingConfig } from "@/lib/seo-page-config";
import { absoluteUrl } from "@/lib/seo";

export async function RankingSeoPage({ config }: { config: RankingConfig }) {
  const { rankedCompanies, latestReviews, minimumReviewCount } = await getRankingSeoData(config);
  const pageUrl = absoluteUrl(`/${config.slug}`);
  const now = new Date();
  const itemListSchema = buildItemListSchema(
    rankedCompanies.map((company, index) => ({
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
          buildBreadcrumbSchema([
            { name: "Home", url: absoluteUrl("/") },
            { name: "Rankings", url: absoluteUrl("/brands") },
            { name: config.h1, url: pageUrl }
          ]),
          itemListSchema
        ])}
      />

      <section className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <nav className="text-sm font-semibold text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-trust-dark">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/brands" className="hover:text-trust-dark">Rankings</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{config.h1}</span>
          </nav>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">{config.h1}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{config.intro}</p>
          <p className="mt-4 text-sm font-semibold text-muted">Last updated: {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(now)}</p>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1400px] gap-12 px-4 py-12 sm:px-6 lg:px-10">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Ranking methodology</h2>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted md:grid-cols-2">
            <li>Only approved reviews are included.</li>
            <li>Primary sort: {config.mode === "best" ? "highest average rating" : "lowest average rating"}.</li>
            <li>Secondary sort: higher review count.</li>
            <li>Minimum review count: {minimumReviewCount} approved reviews.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ink">Top 10 table</h2>
          {rankedCompanies.length > 0 ? (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
              <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                <thead className="bg-purple-50 text-ink">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Average rating</th>
                    <th className="px-4 py-3">Review count</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedCompanies.map((company, index) => (
                    <tr key={company.id} className="border-t border-line">
                      <td className="px-4 py-3 font-bold text-trust-dark">#{index + 1}</td>
                      <td className="px-4 py-3 font-bold text-ink">{company.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <RatingStars rating={company.average_rating} size="small" />
                          <span className="font-bold">{company.average_rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{company.review_count}</td>
                      <td className="px-4 py-3 text-muted">{company.category}</td>
                      <td className="px-4 py-3">
                        <Link href={`/review/${company.slug}`} className="font-bold text-trust-dark hover:underline">
                          Read reviews
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-muted shadow-sm">Not enough reviewed brands yet.</p>
          )}
        </section>

        {rankedCompanies.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-ink">Brand cards</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rankedCompanies.slice(0, 6).map((company) => (
                <BrandCard key={company.id} company={company} />
              ))}
            </div>
          </section>
        ) : null}

        {latestReviews.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-ink">Latest reviews</h2>
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
            {config.relatedCategories
              .map((slug) => categoryConfigs.find((category) => category.slug === slug))
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
            <div>
              <h3 className="font-bold text-ink">How are these rankings calculated?</h3>
              <p className="mt-2 text-sm leading-6 text-muted">Rankings use approved reviews, average rating and review count. Pending and rejected reviews are not included.</p>
            </div>
            <div>
              <h3 className="font-bold text-ink">Why is there a minimum review count?</h3>
              <p className="mt-2 text-sm leading-6 text-muted">A minimum count helps avoid ranking brands from too little customer feedback.</p>
            </div>
            <div>
              <h3 className="font-bold text-ink">Can rankings change?</h3>
              <p className="mt-2 text-sm leading-6 text-muted">Yes. Rankings can change as new approved reviews are published.</p>
            </div>
            <div>
              <h3 className="font-bold text-ink">Can companies pay to improve ranking?</h3>
              <p className="mt-2 text-sm leading-6 text-muted">Companies cannot pay Furniture Brand Reviews to change approved review ratings or ranking calculations.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
