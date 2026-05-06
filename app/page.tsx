import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BrandCard } from "@/components/BrandCard";
import { CompanyLogo } from "@/components/CompanyLogo";
import { RatingStars } from "@/components/RatingStars";
import { ReviewCard } from "@/components/ReviewCard";
import { SearchBar } from "@/components/SearchBar";
import { getCompanies, getLatestApprovedReviews } from "@/lib/data";

export const metadata: Metadata = {
  title: "Read Real Reviews of Furniture Brands",
  description: "Find honest customer experiences, delivery feedback and ratings for furniture brands around the world."
};

export default async function HomePage() {
  const companies = await getCompanies();
  const homepageCompanies = companies.filter((company) => !company.name.toLowerCase().includes(" uk"));
  const latestReviews = await getLatestApprovedReviews();
  const topRated = [...homepageCompanies]
    .sort((a, b) => b.average_rating - a.average_rating || b.review_count - a.review_count)
    .slice(0, 10);

  return (
    <div>
      <section className="home-hero bg-wash md:flex md:items-center">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 md:py-20">
          <div className="max-w-[600px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-trust-dark shadow-sm">
              <ShieldCheck size={17} />
              The world&apos;s most authoritative furniture brand review platform
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl md:text-6xl">
              Discover real customer reviews of furniture brands worldwide
            </h1>
            <ul className="mt-6 grid gap-3 text-left">
              {[
                "100% real customer reviews, manually checked and verified — no fake ratings.",
                "Thousands of furniture and home brands listed worldwide.",
                "AI-powered daily ranking of top-rated furniture brands."
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-white/90 px-4 py-3 text-sm font-semibold leading-6 text-ink shadow-sm backdrop-blur"
                >
                  <ShieldCheck className="mt-1 shrink-0 text-trust" size={16} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <SearchBar companies={companies} />
            </div>
          </div>
        </div>
        <div className="home-hero-mobile-image md:hidden" aria-hidden="true" />
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-ink">Popular furniture brands</h2>
          <Link href="/brands" className="inline-flex items-center gap-1 text-sm font-bold text-trust-dark">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {homepageCompanies.slice(0, 3).map((company) => (
            <BrandCard key={company.id} company={company} />
          ))}
        </div>
      </section>

      <section className="bg-wash">
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
          <h2 className="text-2xl font-bold text-ink">Latest reviews</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {latestReviews.slice(0, 4).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
        <h2 className="text-2xl font-bold text-ink">Top 10 rated brands</h2>
        <div className="mt-6 grid gap-3">
          {topRated.map((company, index) => (
            <article key={company.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-4 md:items-center">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-wash text-sm font-bold text-trust-dark ring-1 ring-line">
                    #{index + 1}
                  </span>
                  <CompanyLogo
                    name={company.name}
                    logoUrl={company.logo_url ?? company.website_screenshot_url ?? company.favicon_url ?? company.og_image_url}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-ink">{company.name}</h3>
                    <p className="mt-1 text-sm font-medium text-muted">{company.category}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <RatingStars rating={company.average_rating} size="small" />
                    <span className="font-bold text-ink">{company.average_rating.toFixed(1)}</span>
                    <span className="text-sm text-muted">· {company.review_count} reviews</span>
                  </div>
                  <Link
                    href={`/review/${company.slug}`}
                    className="inline-flex justify-center rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-trust-dark"
                  >
                    Read reviews
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-ink">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-12 text-white sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <h2 className="text-2xl font-bold">Own a furniture brand? Claim your profile</h2>
            <p className="mt-2 text-white/75">Help customers understand your service, replies and delivery standards.</p>
          </div>
          <Link href="/contact" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink">
            Start a claim
          </Link>
        </div>
      </section>
    </div>
  );
}
