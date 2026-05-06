"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { RatingStars, getRatingColour } from "@/components/RatingStars";
import { ReviewFilters, type RatingFilter } from "@/components/ReviewFilters";
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
  breakdown,
  brandSlug,
  writeReviewHref
}: {
  companyName: string;
  averageRating: number;
  reviews: ReviewWithReply[];
  breakdown: RatingBreakdownItem[];
  brandSlug: string;
  writeReviewHref: string;
}) {
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");

  function toggleRatingFilter(rating: number) {
    setRatingFilter((current) => (current === rating ? "all" : (rating as RatingFilter)));
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
            <p className="mt-2 text-base text-ink underline underline-offset-4">{reviews.length} total reviews</p>
          </div>
          <div className="grid gap-3">
            {breakdown.map((item) => {
              const isActive = ratingFilter === item.rating;

              return (
                <button
                  key={item.rating}
                  type="button"
                  onClick={() => toggleRatingFilter(item.rating)}
                  className={`grid cursor-pointer grid-cols-[54px_1fr_42px] items-center gap-3 rounded-xl border p-2 text-left text-sm transition hover:bg-wash focus:outline-none focus-visible:border-trust focus-visible:ring-4 focus-visible:ring-[#A855F7]/20 ${
                    isActive ? "border-trust bg-wash font-bold text-ink" : "border-transparent text-ink"
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="font-semibold">{item.rating} stars</span>
                  <span className="h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${item.percentage}%`, backgroundColor: getRatingColour(item.rating) }}
                    />
                  </span>
                  <span className="text-right text-muted">{item.count}</span>
                </button>
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
