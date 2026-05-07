"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { RatingStars, getRatingColour } from "@/components/RatingStars";
import { ReviewFilters, type RatingFilter, type RatingValue } from "@/components/ReviewFilters";
import type { ReviewWithReply } from "@/lib/types";

type RatingBreakdownItem = {
  rating: number;
  count: number;
  percentage: number;
};

export function ReviewSummaryWithFilters({
  companyName,
  averageRating,
  reviews,
  totalReviewCount,
  breakdown,
  brandSlug,
  writeReviewHref
}: {
  companyName: string;
  averageRating: number;
  reviews: ReviewWithReply[];
  totalReviewCount: number;
  breakdown: RatingBreakdownItem[];
  brandSlug: string;
  writeReviewHref: string;
}) {
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>([]);

  function toggleRatingFilter(rating: RatingValue) {
    setRatingFilter((current) => (current.includes(rating) ? current.filter((item) => item !== rating) : [...current, rating]));
  }

  function formatPercentage(percentage: number) {
    if (percentage === 0) return "0%";
    if (percentage < 1) return "<1%";
    return `${Math.round(percentage)}%`;
  }

  return (
    <>
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div>
            <p className="text-sm font-bold text-muted">Average rating</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-5xl font-bold text-ink">{averageRating.toFixed(1)}</span>
              <span className="pb-2 text-sm font-semibold text-muted">out of 5</span>
            </div>
            <div className="mt-3">
              <RatingStars rating={averageRating || 0} size="large" />
            </div>
            <p className="mt-2 text-base text-ink underline underline-offset-4">{totalReviewCount} total reviews</p>
          </div>
          <div className="grid gap-2.5">
            {breakdown.map((item) => {
              const rating = item.rating as RatingValue;
              const isActive = ratingFilter.includes(rating);

              return (
                <label
                  key={item.rating}
                  className={`grid cursor-pointer grid-cols-[20px_58px_1fr_44px] items-center gap-3 rounded-lg border px-2 py-1.5 text-left text-sm transition hover:bg-wash ${
                    isActive ? "border-[#A855F7] bg-wash font-bold text-ink" : "border-transparent text-ink"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleRatingFilter(rating)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#A855F7] outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/25"
                  />
                  <span className="font-semibold">{item.rating}-star</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${item.percentage}%`, backgroundColor: getRatingColour(item.rating) }}
                    />
                  </span>
                  <span className="text-right text-muted">{formatPercentage(item.percentage)}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="mt-6 flex gap-3 rounded-xl bg-wash p-4 text-sm leading-6 text-muted">
          <ShieldCheck className="mt-0.5 shrink-0 text-trust-dark" size={18} />
          <p>Reviews are moderated before publishing. Companies cannot pay to remove reviews.</p>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink">{companyName} reviews</h2>
            <p className="mt-1 text-sm text-muted">Approved independent furniture brand reviews from customers.</p>
          </div>
          <Link href={writeReviewHref} className="text-sm font-bold text-trust-dark">
            Write a review
          </Link>
        </div>
        <div className="mt-5">
          <ReviewFilters
            reviews={reviews}
            brandSlug={brandSlug}
            writeReviewHref={writeReviewHref}
            ratingFilter={ratingFilter}
            onRatingFilterChange={setRatingFilter}
          />
        </div>
      </section>
    </>
  );
}
