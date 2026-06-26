import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BrandCard } from "@/components/BrandCard";
import { JsonLd } from "@/components/JsonLd";
import { LatestReviewCard } from "@/components/LatestReviewCard";
import { LatestReviewsCarousel } from "@/components/LatestReviewsCarousel";
import { SearchBar } from "@/components/SearchBar";
import { TopBrandsToggle } from "@/components/TopBrandsToggle";
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

export default async function HomePage() {
  const companies = await getCompanies();
  const homepageCompanies = companies.filter((company) => !company.name.toLowerCase().includes(" uk"));
  const latestReviews = await getLatestApprovedReviews();
  const latestBlogs = await getLatestBlogs(4);
  const featuredComparisons = await getIndexableFeaturedComparisonLinks(3);
  const featuredCategories = categoryConfigs.filter((category) =>
    ["sofa-brands", "bedroom-furniture-brands", "dining-table-brands", "outdoor-furniture-brands"].includes(category.slug)
  );

  return (
    <div>
      <JsonLd data={buildGraph([buildWebsiteSchema(), buildPlatformOrganizationSchema()])} />

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
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/brands" className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">
                Browse furniture brands
              </Link>
              <Link href="/compare" className="rounded-full border border-line bg-white px-5 py-3 text-sm font-bold text-trust-dark hover:border-trust">
                Compare furniture brands
              </Link>
              <Link href="/best-furniture-brands" className="rounded-full border border-line bg-white px-5 py-3 text-sm font-bold text-trust-dark hover:border-trust">
                Best furniture brands
              </Link>
            </div>
          </div>
        </div>
        <div className="home-hero-mobile-image md:hidden" aria-hidden="true" />
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {homepageCompanies.slice(0, 3).map((company) => (
            <BrandCard key={company.id} company={company} />
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

      <TopBrandsToggle companies={companies} />

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
            {latestBlogs.map((blog) => (
              <article
                key={blog.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
              >
                <Link
                  href={`/blog/${blog.slug}`}
                  className="block aspect-[16/9] bg-gradient-to-br from-purple-100 via-wash to-trust/25"
                  style={
                    blog.cover_image_url
                      ? {
                          backgroundImage: `url(${blog.cover_image_url})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover"
                        }
                      : undefined
                  }
                  aria-label={`Read ${blog.title}`}
                />
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
            ))}
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
