import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { JsonLd } from "@/components/JsonLd";
import { LatestReviewCard } from "@/components/LatestReviewCard";
import { LatestReviewsCarousel } from "@/components/LatestReviewsCarousel";
import { RatingStars } from "@/components/RatingStars";
import { SearchBar } from "@/components/SearchBar";
import { TopBrandsToggle } from "@/components/TopBrandsToggle";
import { getBlogCoverAlt, getBlogCoverImageForBlog } from "@/lib/blog-covers";
import { formatBlogDate, getLatestBlogs } from "@/lib/blogs";
import { getCompanies, getLatestApprovedReviews } from "@/lib/data";
import { getIndexableFeaturedComparisonLinks } from "@/lib/internal-links";
import { buildGraph, buildPlatformOrganizationSchema, buildWebsiteSchema } from "@/lib/jsonLd";
import { categoryConfigs } from "@/lib/seo-page-config";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Furniture Brand Reviews | Real Reviews of Furniture Brands Worldwide",
  description: "Find honest customer experiences, delivery feedback and ratings for furniture brands around the world.",
  path: "/",
  absoluteTitle: true
});

function getDomain(url?: string | null) {
  if (!url) return "Website";
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || "Website";
  }
}

type HomeCompany = Awaited<ReturnType<typeof getCompanies>>[number];

function getCompanyVisualUrl(company: HomeCompany) {
  return [company.logo_url, company.cover_image_url, company.og_image_url, company.website_screenshot_url]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .find(Boolean) ?? null;
}

function HomeBrandMiniCard({ company }: { company: HomeCompany }) {
  const visualUrl = getCompanyVisualUrl(company);

  return (
    <Link
      href={`/review/${company.slug}`}
      className="group flex min-h-[180px] min-w-[260px] snap-start flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-trust-dark sm:min-w-[300px] lg:min-w-0"
    >
      <div>
        <CompanyLogo
          name={company.name}
          logoUrl={visualUrl}
          size="md"
          preferScreenshotCrop
        />
        <h3 className="mt-4 line-clamp-2 text-base font-bold leading-snug text-ink group-hover:text-trust-dark">{company.name}</h3>
        <p className="mt-1 inline-flex items-center gap-1 truncate text-sm text-muted">
          {getDomain(company.website)} <ExternalLink size={13} />
        </p>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <RatingStars rating={company.average_rating} size="small" />
        <span className="text-sm font-bold text-ink">{company.average_rating.toFixed(1)}</span>
        <span className="text-sm text-muted">({company.review_count})</span>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const companies = await getCompanies();
  const homepageCompanies = companies.filter((company) => !company.name.toLowerCase().includes(" uk") && Number(company.review_count || 0) >= 30 && getCompanyVisualUrl(company));
  const latestReviews = await getLatestApprovedReviews();
  const latestBlogs = await getLatestBlogs(4);
  const featuredComparisons = await getIndexableFeaturedComparisonLinks(3);
  const featuredCategories = categoryConfigs.filter((category) =>
    ["sofa-brands", "bedroom-furniture-brands", "dining-table-brands", "outdoor-furniture-brands"].includes(category.slug)
  );

  return (
    <div>
      <JsonLd data={buildGraph([buildWebsiteSchema(), buildPlatformOrganizationSchema()])} />

      <section className="home-hero relative overflow-hidden bg-wash md:flex md:items-center md:bg-white">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:py-16 lg:px-10">
          <div className="relative z-10 max-w-[640px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur md:border-line md:bg-white md:text-trust-dark">
              <ShieldCheck size={17} />
              The world&apos;s most authoritative furniture brand review platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl md:text-ink">
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
                  className="flex items-start gap-3 rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-sm backdrop-blur md:border-line md:bg-white/90 md:text-ink"
                >
                  <ShieldCheck className="mt-1 shrink-0 text-white md:text-trust" size={16} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <SearchBar companies={companies} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/brands" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink hover:bg-purple-50 md:bg-ink md:text-white md:hover:bg-trust-dark">
                Browse furniture brands
              </Link>
              <Link href="/compare" className="rounded-full border border-white/40 bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/25 md:border-line md:bg-white md:text-trust-dark md:hover:border-trust">
                Compare furniture brands
              </Link>
              <Link href="/best-furniture-brands" className="rounded-full border border-white/40 bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/25 md:border-line md:bg-white md:text-trust-dark md:hover:border-trust">
                Best furniture brands
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-purple-100/70 blur-2xl" aria-hidden="true" />
            <Image
              src="/home-hero-dining-table.jpg"
              alt="Modern dining table and chairs in a bright furniture showroom"
              width={900}
              height={900}
              priority
              className="relative aspect-[1.16/1] w-full rounded-[2rem] object-cover shadow-sm ring-1 ring-purple-100"
            />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" aria-hidden="true" />
            <Link
              href="/write-review"
              className="relative inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-trust hover:text-trust-dark"
            >
              <span>Bought furniture recently?</span>
              <span className="inline-flex items-center gap-1 font-bold text-trust-dark">
                Write a review <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-ink">Popular furniture brands</h2>
          <Link href="/brands" className="inline-flex items-center gap-1 text-sm font-bold text-trust-dark">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
          {homepageCompanies.slice(0, 4).map((company) => (
            <HomeBrandMiniCard key={company.id} company={company} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink">Explore furniture review categories</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Browse category pages and rankings built from approved customer reviews.</p>
            </div>
            <Link href="/best-furniture-brands" className="inline-flex items-center gap-1 text-sm font-bold text-trust-dark">
              Best furniture brands <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {featuredCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="rounded-full bg-wash px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust"
              >
                {category.h1.replace(" Reviewed by Customers", "")}
              </Link>
            ))}
            <Link href="/compare" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-trust-dark">
              Compare furniture brands
            </Link>
            {featuredComparisons.map((comparison) => (
              <Link
                key={comparison.href}
                href={comparison.href}
                className="rounded-full bg-wash px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust"
              >
                {comparison.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-purple-200 bg-purple-100 px-6 py-7 shadow-sm">
          <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-purple-300/35" aria-hidden="true" />
          <div className="absolute bottom-4 right-10 hidden h-20 w-20 rounded-3xl border border-white/50 bg-white/30 backdrop-blur sm:block" aria-hidden="true" />
          <div className="absolute bottom-8 right-32 hidden h-12 w-32 rounded-full border border-white/50 bg-white/35 backdrop-blur md:block" aria-hidden="true" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink">Looking to grow your furniture business?</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-ink/80">
                Strengthen your reputation with moderated customer reviews, public replies and review invitation tools.
              </p>
            </div>
            <Link href="/claim-your-profile" className="inline-flex w-fit rounded-full bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">
              Get started
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-wash">
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
          <h2 className="text-2xl font-bold text-ink">Latest reviews</h2>
          {latestReviews.length > 0 ? (
            <LatestReviewsCarousel count={latestReviews.length}>
              {latestReviews.map((review) => (
                <LatestReviewCard key={review.id} review={review} />
              ))}
            </LatestReviewsCarousel>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 pt-16 sm:px-6 lg:px-10">
        <div className="grid gap-7 rounded-3xl bg-[#fff0d9] p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_520px] md:items-center md:p-10">
          <div>
            <h2 className="text-3xl font-bold leading-tight text-ink">Help furniture buyers make the right choice</h2>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-ink/80">
              Share your buying experience so other shoppers can compare delivery, product quality and customer service with more confidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/write-review" className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">
                Write a review
              </Link>
              <Link href="/brands" className="rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-bold text-ink hover:border-trust/40">
                Browse brands
              </Link>
            </div>
          </div>
          <div className="relative min-h-[220px] overflow-hidden rounded-3xl shadow-sm md:min-h-[280px]">
            <Image
              src="/home-review-choice.jpg"
              alt="Close-up furniture scene with sofa, marble table and interior styling"
              fill
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <TopBrandsToggle companies={companies} />

      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10">
        <div className="grid gap-6 rounded-3xl bg-emerald-100 p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_520px] md:items-center md:p-10">
          <div>
            <h2 className="text-3xl font-bold text-ink">We&apos;re FurnitureBrandReviews</h2>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-ink/80">
              Reviews are checked before publishing, companies cannot pay to remove reviews, and every public rating is based on approved customer feedback.
            </p>
            <Link href="/trust-and-safety" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">
              What we do
            </Link>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-3xl shadow-sm md:min-h-[340px]">
            <Image
              src="/home-trust-signals.jpg"
              alt="Styled furniture setting with coffee table and warm interior details"
              fill
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {latestBlogs.length > 0 ? (
        <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
          <div className="mb-8 rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">Browse by furniture category</h3>
                <p className="mt-1 text-sm leading-6 text-muted">Jump into review categories linked to buying guides and brand rankings.</p>
              </div>
              <Link href="/category" className="inline-flex items-center gap-1 text-sm font-bold text-trust-dark">
                All categories <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {categoryConfigs.slice(0, 10).map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="rounded-full border border-purple-100 bg-wash px-4 py-2 text-sm font-bold text-trust-dark transition hover:border-trust/40 hover:bg-purple-50"
                >
                  {category.h1.replace("Best ", "").replace(" Reviewed by Customers", "")}
                </Link>
              ))}
            </div>
          </div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-ink">Latest furniture blog</h2>
            <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-bold text-trust-dark">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {latestBlogs.map((blog) => {
              const coverImage = blog.cover_image_url || getBlogCoverImageForBlog(blog);
              return (
                <article
                  key={blog.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
                >
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="relative block aspect-[16/9] overflow-hidden bg-gradient-to-br from-purple-100 via-wash to-trust/25"
                    aria-label={`Read ${blog.title}`}
                  >
                    <Image
                      src={coverImage}
                      alt={blog.cover_image_alt || getBlogCoverAlt(blog)}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
                      {blog.category ? <span className="text-trust-dark">{blog.category}</span> : null}
                      <span>{formatBlogDate(blog.published_at ?? blog.created_at)}</span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight text-ink">
                      <Link href={`/blog/${blog.slug}`} className="hover:text-trust-dark">
                        {blog.title}
                      </Link>
                    </h3>
                    {blog.excerpt ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{blog.excerpt}</p> : null}
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-bold text-trust-dark"
                    >
                      Read article <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

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
