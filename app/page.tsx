import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BrandCard } from "@/components/BrandCard";
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
  const topRated = [...homepageCompanies].sort((a, b) => b.average_rating - a.average_rating).slice(0, 3);

  return (
    <div>
      <section className="bg-wash">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:py-20">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-trust-dark">
            <ShieldCheck size={17} />
            The world's most authoritative furniture brand review platform
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-6xl">
            Read real reviews of furniture brands worldwide
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
            Find honest customer experiences, delivery feedback and ratings for furniture brands around the world.
          </p>
          <div className="mt-9">
            <SearchBar companies={companies} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
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
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold text-ink">Latest reviews</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {latestReviews.slice(0, 4).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-ink">Top rated brands</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {topRated.map((company) => (
            <BrandCard key={company.id} company={company} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 text-white md:flex-row md:items-center md:justify-between">
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
