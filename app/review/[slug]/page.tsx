import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Clock3, ExternalLink, Globe2, Mail, MessageSquareReply, ShieldCheck } from "lucide-react";
import { BrandCard } from "@/components/BrandCard";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Rating } from "@/components/Rating";
import { RatingStars, getRatingColour } from "@/components/RatingStars";
import { ReviewCard } from "@/components/ReviewCard";
import { getApprovedReviewsForCompany, getCompanies, getCompanyBySlug, getRatingBreakdown } from "@/lib/data";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug);
  if (!company) return { title: "Brand not found" };
  return {
    title: {
      absolute: `${company.name} Reviews | Furniture Brand Reviews`
    },
    description: `Read customer reviews, ratings and delivery feedback for ${company.name}.`
  };
}

export default async function CompanyReviewPage({ params }: Props) {
  const company = await getCompanyBySlug(params.slug);
  if (!company) notFound();

  const reviews = await getApprovedReviewsForCompany(company.id);
  const breakdown = getRatingBreakdown(reviews);
  const companies = await getCompanies();
  const similarBrands = companies.filter((item) => item.slug !== company.slug).slice(0, 4);
  const aggregateRating = reviews.length
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: company.name,
        url: company.website,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: company.average_rating.toFixed(1),
          reviewCount: reviews.length
        }
      }
    : null;

  return (
    <div className="bg-white">
      {aggregateRating && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRating) }} />
      )}

      <div className="border-b border-line bg-wash">
        <section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-card md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-5">
                <CompanyLogo name={company.name} logoUrl={company.logo_url ?? company.favicon_url ?? company.og_image_url} size="lg" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-muted ring-1 ring-line">Unclaimed</span>
                    <span className="rounded-full bg-wash px-3 py-1 text-xs font-bold text-trust-dark">{company.category}</span>
                  </div>
                  <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink md:text-5xl">{company.name}</h1>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-trust-dark"
                  >
                    <Globe2 size={16} />
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>

              <div className="grid gap-4 rounded-2xl border border-line bg-wash p-4 sm:min-w-72">
                <div>
                  <Rating value={company.average_rating} count={reviews.length} size="medium" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <Link
                    href={`/review/${company.slug}/write`}
                    className="rounded-full bg-trust px-5 py-3 text-center font-bold text-white hover:bg-trust-dark"
                  >
                    Write a review
                  </Link>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3 font-bold text-ink hover:border-trust hover:text-trust-dark"
                  >
                    Visit website <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_340px]">
        <main className="grid gap-6">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <div>
                <p className="text-sm font-bold text-muted">Average rating</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-bold text-ink">{company.average_rating.toFixed(1)}</span>
                  <span className="pb-2 text-sm font-semibold text-muted">out of 5</span>
                </div>
                <div className="mt-3">
                  <RatingStars rating={company.average_rating || 0} size="large" />
                </div>
                <p className="mt-2 text-sm text-muted">{reviews.length} total reviews</p>
              </div>
              <div className="grid gap-3">
                {breakdown.map((item) => (
                  <div key={item.rating} className="grid grid-cols-[54px_1fr_42px] items-center gap-3 text-sm">
                    <span className="font-semibold text-ink">{item.rating} stars</span>
                    <span className="h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${item.percentage}%`, backgroundColor: getRatingColour(item.rating) }}
                      />
                    </span>
                    <span className="text-right text-muted">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex gap-3 rounded-2xl bg-wash p-4 text-sm leading-6 text-muted">
              <ShieldCheck className="mt-0.5 shrink-0 text-trust-dark" size={18} />
              <p>Reviews are moderated before publishing. Companies cannot pay to remove reviews.</p>
            </div>
          </section>

          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ink">Reviews</h2>
                <p className="mt-1 text-sm text-muted">Independent furniture brand reviews from shoppers worldwide.</p>
              </div>
              <Link href={`/review/${company.slug}/write`} className="text-sm font-bold text-trust-dark">
                Write a review
              </Link>
            </div>
            <div className="mt-5 grid gap-4">
              {reviews.length > 0 ? (
                reviews.map((review) => <ReviewCard key={review.id} review={review} />)
              ) : (
                <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
                  <p className="text-lg font-bold text-ink">No reviews yet.</p>
                  <p className="mt-2 text-muted">Be the first to review this furniture brand.</p>
                  <Link
                    href={`/review/${company.slug}/write`}
                    className="mt-5 inline-flex rounded-full bg-trust px-5 py-3 font-bold text-white hover:bg-trust-dark"
                  >
                    Write a review
                  </Link>
                </div>
              )}
            </div>
          </section>
        </main>

        <aside className="grid h-fit gap-5 lg:sticky lg:top-6">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Company details</h2>
            <div className="mt-5 grid gap-5 text-sm">
              <div>
                <p className="font-bold text-ink">About this brand</p>
                <p className="mt-2 leading-6 text-muted">
                  {company.description || `${company.name} is listed on Furniture Brand Reviews for independent furniture brand reviews.`}
                </p>
              </div>
              <div className="grid gap-3">
                <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted hover:text-trust-dark">
                  <Globe2 size={16} />
                  Website
                </a>
                <p className="flex items-center gap-2 text-muted">
                  <Mail size={16} />
                  Contact info not provided yet
                </p>
                <p className="flex items-center gap-2 text-muted">
                  <CheckCircle2 size={16} />
                  Unclaimed profile
                </p>
              </div>
              <div className="rounded-2xl bg-wash p-4">
                <p className="font-bold text-ink">Review activity</p>
                <div className="mt-3 grid gap-3 text-muted">
                  <p className="flex items-center gap-2">
                    <MessageSquareReply size={16} />
                    Replied to negative reviews: Not enough data yet
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 size={16} />
                    Typical reply time: Not available yet
                  </p>
                </div>
              </div>
              <p className="rounded-full bg-wash px-4 py-2 text-center font-bold text-trust-dark">{company.category}</p>
            </div>
          </section>
        </aside>
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="text-2xl font-bold text-ink">People also viewed</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {similarBrands.map((brand) => (
            <BrandCard key={brand.id} company={brand} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border border-line bg-wash p-6">
        <h2 className="text-2xl font-bold text-ink">FAQ</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <h3 className="font-bold">Is {company.name} legit?</h3>
            <p className="mt-2 text-sm leading-6 text-muted">Check approved reviews, ratings and delivery feedback before ordering.</p>
          </div>
          <div>
            <h3 className="font-bold">How are reviews verified?</h3>
            <p className="mt-2 text-sm leading-6 text-muted">Reviews are checked before publishing and may be marked verified when supporting details are provided.</p>
          </div>
          <div>
            <h3 className="font-bold">Can the company reply?</h3>
            <p className="mt-2 text-sm leading-6 text-muted">Companies can reply to reviews so customers can see how issues are handled.</p>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
