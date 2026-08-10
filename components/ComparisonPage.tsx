import Link from "next/link";
import { ArrowRight, BarChart3, MessageCircleMore, ShieldCheck } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { ComparisonReviewGuide } from "@/components/ComparisonReviewGuide";
import { JsonLd } from "@/components/JsonLd";
import { LatestReviewCard } from "@/components/LatestReviewCard";
import { RatingStars } from "@/components/RatingStars";
import { getPublishedBlogs, shouldIndexBlog } from "@/lib/blogs";
import { buildBreadcrumbSchema, buildFaqSchema, buildGraph, buildItemListSchema } from "@/lib/jsonLd";
import { getRelatedBlogs, getRelatedCategories, getRelatedRankingPages } from "@/lib/internal-links";
import { absoluteUrl } from "@/lib/seo";
import type { ComparisonBrandData, ComparisonPageData } from "@/lib/comparison-data";

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function getStarPercentage(brand: ComparisonBrandData, rating: number) {
  return brand.intelligence.starDistribution.find((item) => item.rating === rating)?.percentage ?? 0;
}

function getTopTopicLabels(brand: ComparisonBrandData) {
  if (!brand.intelligence.topTopics.length) return "Not enough data yet";
  return brand.intelligence.topTopics
    .slice(0, 3)
    .map((topic) => topic.label)
    .join(", ");
}

function BrandSummaryCard({ brand }: { brand: ComparisonBrandData }) {
  const company = brand.company;

  return (
    <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <CompanyLogo
          name={company.name}
          logoUrl={company.logo_url ?? company.cover_image_url ?? company.og_image_url ?? company.website_screenshot_url}
          size="md"
        />
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-ink">{company.name}</h2>
          <p className="mt-1 text-sm text-muted">{company.category}</p>
          <div className="mt-3">
            <RatingStars rating={brand.intelligence.averageRating} size="medium" showValue />
          </div>
          <p className="mt-2 text-sm font-semibold text-muted">
            {brand.intelligence.approvedReviewCount} approved {brand.intelligence.approvedReviewCount === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>
      <Link href={`/review/${company.slug}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">
        Read full {company.name} reviews <ArrowRight size={15} />
      </Link>
    </article>
  );
}

function RatingBreakdown({ brand }: { brand: ComparisonBrandData }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-ink">{brand.company.name}</h3>
      <div className="mt-4 grid gap-3">
        {brand.intelligence.starDistribution.map((item) => (
          <div key={item.rating} className="grid grid-cols-[58px_1fr_44px] items-center gap-3 text-sm">
            <span className="font-bold text-ink">{item.rating}-star</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-[#E5E7EB]">
              <span className="block h-full rounded-full bg-trust" style={{ width: `${item.percentage}%` }} />
            </span>
            <span className="text-right font-semibold text-muted">{formatPercent(item.percentage)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricRow({ label, brandAValue, brandBValue }: { label: string; brandAValue: number; brandBValue: number }) {
  return (
    <div className="grid gap-3 rounded-xl bg-wash p-4 sm:grid-cols-[1fr_120px_120px] sm:items-center">
      <p className="font-bold text-ink">{label}</p>
      <p className="text-sm font-semibold text-muted">{brandAValue} reviews</p>
      <p className="text-sm font-semibold text-muted">{brandBValue} reviews</p>
    </div>
  );
}

export async function ComparisonPage({ data }: { data: ComparisonPageData }) {
  const { brandA, brandB, latestReviews, relatedComparisons } = data;
  const blogs = await getPublishedBlogs();
  const brandAName = brandA.company.name;
  const brandBName = brandB.company.name;
  const pagePath = `/compare/${data.comparison.slug}`;
  const pageUrl = absoluteUrl(pagePath);
  const hasEnoughData = data.shouldIndex;
  const relatedCategories = [
    ...getRelatedCategories(brandA.company, 3),
    ...getRelatedCategories(brandB.company, 3)
  ].filter((link, index, links) => links.findIndex((item) => item.href === link.href) === index).slice(0, 4);
  const relatedRankings = [
    ...getRelatedRankingPages(brandA.company, 3),
    ...getRelatedRankingPages(brandB.company, 3)
  ].filter((link, index, links) => links.findIndex((item) => item.href === link.href) === index).slice(0, 4);
  const relatedBlogs = [
    ...getRelatedBlogs(brandA.company, blogs, 3),
    ...getRelatedBlogs(brandB.company, blogs, 3)
  ].filter((link, index, links) => links.findIndex((item) => item.href === link.href) === index).slice(0, 3);
  const fallbackBlogs = blogs
    .filter((blog) => blog.status === "published" && blog.slug && shouldIndexBlog(blog))
    .slice(0, 3)
    .map((blog) => ({
      href: `/blog/${blog.slug}`,
      label: blog.title,
      description: blog.excerpt ?? undefined
    }));
  const visibleBlogLinks = relatedBlogs.length > 0 ? relatedBlogs : fallbackBlogs;
  const comparisonFaqs = [
    {
      question: `How is the ${brandAName} vs ${brandBName} comparison calculated?`,
      answer: `This page compares approved customer reviews for ${brandAName} and ${brandBName}, including average rating, review count, delivery mentions, product quality mentions, customer service mentions and complaint signals.`
    },
    {
      question: `Does Furniture Brand Reviews decide whether ${brandAName} or ${brandBName} is better?`,
      answer: "No. The comparison shows current approved review data and avoids making unsupported claims about which brand is better."
    },
    {
      question: `Can I read the full ${brandAName} and ${brandBName} reviews?`,
      answer: `Yes. Each brand has a full review profile where you can read approved customer reviews and write your own review.`
    },
    {
      question: "Are pending reviews included in this comparison?",
      answer: "No. Pending, rejected and hidden reviews are not used in comparison scores, review counts or review intelligence."
    }
  ];

  const webPageSchema = {
    "@type": "WebPage",
    name: `${brandAName} vs ${brandBName}: Customer Reviews Compared`,
    description: `Compare ${brandAName} and ${brandBName} based on approved customer reviews, ratings, delivery feedback, product quality, customer service and complaints.`,
    url: pageUrl
  };

  const itemListSchema = buildItemListSchema([
    {
      position: 1,
      name: brandAName,
      url: absoluteUrl(`/review/${brandA.company.slug}`),
      ratingValue: brandA.intelligence.averageRating,
      reviewCount: brandA.intelligence.approvedReviewCount
    },
    {
      position: 2,
      name: brandBName,
      url: absoluteUrl(`/review/${brandB.company.slug}`),
      ratingValue: brandB.intelligence.averageRating,
      reviewCount: brandB.intelligence.approvedReviewCount
    }
  ]);

  return (
    <div className="bg-white">
      <JsonLd
        data={buildGraph([
          buildBreadcrumbSchema([
            { name: "Home", url: absoluteUrl("/") },
            { name: "Compare Furniture Brands", url: absoluteUrl("/compare") },
            { name: `${brandAName} vs ${brandBName}`, url: pageUrl }
          ]),
          webPageSchema,
          itemListSchema,
          buildFaqSchema(comparisonFaqs)
        ])}
      />

      <section className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <nav className="text-sm font-semibold text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-trust-dark">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/compare" className="hover:text-trust-dark">Compare Furniture Brands</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{brandAName} vs {brandBName}</span>
          </nav>
          <h1 className="mt-5 max-w-5xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {brandAName} vs {brandBName}: Customer Reviews Compared
          </h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-muted">
            This comparison is based on approved customer reviews on Furniture Brand Reviews. It compares ratings, review count, delivery feedback, product quality, customer service, returns and complaint signals without favouring either brand.
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:px-6 lg:px-8">
        {!hasEnoughData ? (
          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <p className="text-lg font-bold text-ink">There are not enough approved reviews yet to draw a clear comparison.</p>
            <p className="mt-2 text-sm leading-6 text-muted">This page is available for shoppers, but it should not be treated as a full comparison until more approved reviews are published.</p>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-2">
          <BrandSummaryCard brand={brandA} />
          <BrandSummaryCard brand={brandB} />
        </section>

        <ComparisonReviewGuide brandA={brandA} brandB={brandB} />

        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Summary comparison table</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="bg-purple-50 text-ink">
                <tr>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Average rating</th>
                  <th className="px-4 py-3">Review count</th>
                  <th className="px-4 py-3">5-star percentage</th>
                  <th className="px-4 py-3">1-star percentage</th>
                  <th className="px-4 py-3">Most mentioned topics</th>
                  <th className="px-4 py-3">Full profile</th>
                </tr>
              </thead>
              <tbody>
                {[brandA, brandB].map((brand) => (
                  <tr key={brand.company.id} className="border-t border-line">
                    <td className="px-4 py-3 font-bold text-ink">{brand.company.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <RatingStars rating={brand.intelligence.averageRating} size="small" />
                        <span className="font-bold">{brand.intelligence.averageRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{brand.intelligence.approvedReviewCount}</td>
                    <td className="px-4 py-3 text-muted">{formatPercent(getStarPercentage(brand, 5))}</td>
                    <td className="px-4 py-3 text-muted">{formatPercent(getStarPercentage(brand, 1))}</td>
                    <td className="px-4 py-3 text-muted">{getTopTopicLabels(brand)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/review/${brand.company.slug}`} className="font-bold text-trust-dark hover:underline">
                        View reviews
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2">
            <BarChart3 size={22} className="text-trust-dark" />
            <h2 className="text-2xl font-bold text-ink">Rating comparison</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <RatingBreakdown brand={brandA} />
            <RatingBreakdown brand={brandB} />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageCircleMore size={22} className="text-trust-dark" />
            <h2 className="text-2xl font-bold text-ink">What customers mention</h2>
          </div>
          <div className="mt-5 grid gap-3">
            <MetricRow label="Delivery mentions" brandAValue={brandA.intelligence.deliveryMentionCount} brandBValue={brandB.intelligence.deliveryMentionCount} />
            <MetricRow label="Product quality mentions" brandAValue={brandA.intelligence.qualityMentionCount} brandBValue={brandB.intelligence.qualityMentionCount} />
            <MetricRow label="Customer service mentions" brandAValue={brandA.intelligence.customerServiceMentionCount} brandBValue={brandB.intelligence.customerServiceMentionCount} />
            <MetricRow label="Returns/refunds mentions" brandAValue={brandA.intelligence.returnsMentionCount} brandBValue={brandB.intelligence.returnsMentionCount} />
            <MetricRow label="Complaint signals" brandAValue={brandA.intelligence.complaintCount} brandBValue={brandB.intelligence.complaintCount} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Who might compare {brandAName}?</h2>
            <p className="mt-3 leading-7 text-muted">
              Shoppers may want to read {brandAName} reviews if they are comparing brands by current approved customer ratings, delivery feedback, product quality comments and after-sales experience.
            </p>
            <Link href={`/review/${brandA.company.slug}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-wash px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
              Read {brandAName} reviews <ArrowRight size={15} />
            </Link>
          </article>
          <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Who might compare {brandBName}?</h2>
            <p className="mt-3 leading-7 text-muted">
              Shoppers may want to read {brandBName} reviews if they need more context on customer service, delivery timing, quality mentions, returns or complaint signals before choosing a furniture brand.
            </p>
            <Link href={`/review/${brandB.company.slug}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-wash px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
              Read {brandBName} reviews <ArrowRight size={15} />
            </Link>
          </article>
        </section>

        {(brandA.intelligence.deliveryMentionCount >= 3 || brandB.intelligence.deliveryMentionCount >= 3) && (
          <section className="rounded-2xl border border-line bg-wash p-6">
            <h2 className="text-2xl font-bold text-ink">Delivery feedback comparison</h2>
            <p className="mt-3 leading-7 text-muted">
              Delivery is mentioned in {brandA.intelligence.deliveryMentionCount} approved reviews for {brandAName} and {brandB.intelligence.deliveryMentionCount} approved reviews for {brandBName}. Reviews may refer to courier experience, delivery timing, tracking or arrival condition.
            </p>
          </section>
        )}

        {(brandA.intelligence.qualityMentionCount >= 3 || brandB.intelligence.qualityMentionCount >= 3) && (
          <section className="rounded-2xl border border-line bg-wash p-6">
            <h2 className="text-2xl font-bold text-ink">Product quality comparison</h2>
            <p className="mt-3 leading-7 text-muted">
              Product quality is mentioned in {brandA.intelligence.qualityMentionCount} approved reviews for {brandAName} and {brandB.intelligence.qualityMentionCount} approved reviews for {brandBName}. Reviews may refer to materials, comfort, build quality, finish or durability.
            </p>
          </section>
        )}

        {(brandA.intelligence.customerServiceMentionCount >= 3 || brandB.intelligence.customerServiceMentionCount >= 3) && (
          <section className="rounded-2xl border border-line bg-wash p-6">
            <h2 className="text-2xl font-bold text-ink">Customer service comparison</h2>
            <p className="mt-3 leading-7 text-muted">
              Customer service is mentioned in {brandA.intelligence.customerServiceMentionCount} approved reviews for {brandAName} and {brandB.intelligence.customerServiceMentionCount} approved reviews for {brandBName}. Reviews may refer to response times, support quality, email communication or issue resolution.
            </p>
          </section>
        )}

        {(brandA.intelligence.complaintCount >= 3 || brandB.intelligence.complaintCount >= 3) && (
          <section className="rounded-2xl border border-line bg-wash p-6">
            <h2 className="text-2xl font-bold text-ink">Complaints comparison</h2>
            <p className="mt-3 leading-7 text-muted">
              Some approved reviews mention issues such as delivery delays, product condition, returns or customer service. This section is based only on published customer reviews on Furniture Brand Reviews and does not make claims beyond the visible review data.
            </p>
          </section>
        )}

        {latestReviews.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-ink">Latest reviews from both brands</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {latestReviews.map((review) => (
                <LatestReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>
        ) : null}

        {relatedComparisons.length > 0 ? (
          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Related comparisons</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {relatedComparisons.map((comparison) => (
                <Link
                  key={comparison.slug}
                  href={`/compare/${comparison.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-wash px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust"
                >
                  {comparison.label}
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {(relatedCategories.length > 0 || relatedRankings.length > 0) ? (
          <section className="rounded-2xl border border-line bg-wash p-6">
            <h2 className="text-2xl font-bold text-ink">Explore related review pages</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {[...relatedCategories, ...relatedRankings].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust"
                >
                  {link.label}
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {visibleBlogLinks.length > 0 ? (
          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Related buying guides</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {visibleBlogLinks.map((blog) => (
                <Link key={blog.href} href={blog.href} className="rounded-xl border border-line bg-wash p-4 hover:border-trust">
                  <h3 className="font-bold leading-snug text-ink">{blog.label}</h3>
                  {blog.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{blog.description}</p> : null}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-ink">FAQ</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {comparisonFaqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-bold text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-ink p-6 text-white">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 shrink-0" size={22} />
            <div>
              <h2 className="text-2xl font-bold">Continue comparing furniture brands</h2>
              <p className="mt-2 text-white/75">Read the full review profiles, write your own review or browse all furniture companies.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/review/${brandA.company.slug}`} className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink">
                  Read full {brandAName} reviews
                </Link>
                <Link href={`/review/${brandB.company.slug}`} className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink">
                  Read full {brandBName} reviews
                </Link>
                <Link href="/write-review" className="rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                  Write a review
                </Link>
                <Link href="/brands" className="rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                  Browse all furniture brands
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
