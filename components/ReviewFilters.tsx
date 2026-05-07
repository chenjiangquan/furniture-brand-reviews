"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { ReviewCard } from "@/components/ReviewCard";
import type { ReviewWithReply } from "@/lib/types";

type SortOption = "recent" | "highest" | "lowest";
export type RatingValue = 5 | 4 | 3 | 2 | 1;
export type RatingFilter = RatingValue[];

const ratingOptions: RatingValue[] = [5, 4, 3, 2, 1];
const reviewsPerPage = 10;

const mentionKeywords = [
  "delivery",
  "quality",
  "sofa",
  "table",
  "customer service",
  "refund",
  "return",
  "assembly",
  "packaging",
  "damage",
  "price",
  "value",
  "communication",
  "chair",
  "bed",
  "wardrobe"
];

function getReviewText(review: ReviewWithReply) {
  return `${review.title} ${review.content}`.toLowerCase();
}

function countKeyword(text: string, keyword: string) {
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`\\b${escapedKeyword}\\b`, "gi"))?.length ?? 0;
}

function sortReviews(reviews: ReviewWithReply[], sort: SortOption) {
  return [...reviews].sort((first, second) => {
    const firstDate = new Date(first.created_at).getTime();
    const secondDate = new Date(second.created_at).getTime();

    if (sort === "highest") {
      return second.rating - first.rating || secondDate - firstDate;
    }

    if (sort === "lowest") {
      return first.rating - second.rating || secondDate - firstDate;
    }

    return secondDate - firstDate;
  });
}

export function ReviewFilters({
  reviews,
  brandSlug,
  writeReviewHref,
  ratingFilter,
  onRatingFilterChange
}: {
  reviews: ReviewWithReply[];
  brandSlug: string;
  writeReviewHref: string;
  ratingFilter?: RatingFilter;
  onRatingFilterChange?: (rating: RatingFilter) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [localRatingFilter, setLocalRatingFilter] = useState<RatingFilter>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activeMention, setActiveMention] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const supportsVerified = reviews.some((review) => Object.prototype.hasOwnProperty.call(review, "is_verified"));
  const activeRatingFilter = ratingFilter ?? localRatingFilter;

  function updateRatingFilter(nextRatingFilter: RatingFilter) {
    if (onRatingFilterChange) {
      onRatingFilterChange(nextRatingFilter);
      return;
    }

    setLocalRatingFilter(nextRatingFilter);
  }

  function toggleRatingFilter(rating: RatingValue) {
    updateRatingFilter(
      activeRatingFilter.includes(rating) ? activeRatingFilter.filter((item) => item !== rating) : [...activeRatingFilter, rating]
    );
  }

  const topMentions = useMemo(() => {
    const allText = reviews.map(getReviewText).join(" ");

    return mentionKeywords
      .map((keywordItem) => ({
        keyword: keywordItem,
        count: countKeyword(allText, keywordItem)
      }))
      .filter((mention) => mention.count > 0)
      .sort((first, second) => second.count - first.count || first.keyword.localeCompare(second.keyword))
      .slice(0, 10);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    const filtered = reviews.filter((review) => {
      const text = getReviewText(review);
      const matchesKeyword = !trimmedKeyword || text.includes(trimmedKeyword);
      const matchesRating = activeRatingFilter.length === 0 || activeRatingFilter.includes(review.rating as RatingValue);
      const matchesVerified = !verifiedOnly || review.is_verified === true;

      return matchesKeyword && matchesRating && matchesVerified;
    });

    return sortReviews(filtered, sort);
  }, [activeRatingFilter, keyword, reviews, sort, verifiedOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / reviewsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedReviews = filteredReviews.slice((safeCurrentPage - 1) * reviewsPerPage, safeCurrentPage * reviewsPerPage);
  const hasActiveFilters = keyword.trim() || activeRatingFilter.length > 0 || verifiedOnly || sort !== "recent";

  useEffect(() => {
    setCurrentPage(1);
  }, [activeMention, activeRatingFilter, keyword, reviews, sort, verifiedOnly]);

  function clearFilters() {
    setKeyword("");
    setSort("recent");
    updateRatingFilter([]);
    setVerifiedOnly(false);
    setActiveMention("");
    setCurrentPage(1);
  }

  function toggleMention(mention: string) {
    if (activeMention === mention) {
      setActiveMention("");
      setKeyword("");
      return;
    }

    setActiveMention(mention);
    setKeyword(mention);
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative block min-w-0 lg:flex-1">
            <span className="sr-only">Search reviews by keyword</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                if (activeMention && event.target.value !== activeMention) setActiveMention("");
              }}
              placeholder="Search reviews by keyword..."
              className="h-12 w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm text-ink outline-none transition focus:border-trust focus:ring-4 focus:ring-[#A855F7]/15"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  setActiveMention("");
                }}
                aria-label="Clear keyword search"
                className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-wash hover:text-trust-dark"
              >
                <X size={16} />
              </button>
            )}
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-sm font-bold text-ink hover:border-trust hover:text-trust-dark"
            >
              <SlidersHorizontal size={17} />
              More filters
            </button>

            <label className="relative flex h-12 min-w-[180px] items-center">
              <span className="sr-only">Sort reviews</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="flex h-12 w-full appearance-none items-center justify-between rounded-full border border-gray-200 bg-white px-4 pr-10 text-sm font-bold text-ink outline-none focus:border-trust focus:ring-4 focus:ring-[#A855F7]/15"
              >
                <option value="recent">Most recent</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            </label>
          </div>
        </div>

        {showFilters && (
          <div className="mt-5 rounded-xl border border-line bg-wash p-4">
            <p className="text-sm font-bold text-ink">Filter by rating</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateRatingFilter([])}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold transition ${
                  activeRatingFilter.length === 0
                    ? "bg-trust text-white"
                    : "border border-gray-200 bg-white text-muted hover:border-trust hover:text-trust-dark"
                }`}
              >
                All ratings
              </button>
              {ratingOptions.map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => toggleRatingFilter(rating)}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold transition ${
                    activeRatingFilter.includes(rating)
                      ? "bg-trust text-white"
                      : "border border-gray-200 bg-white text-muted hover:border-trust hover:text-trust-dark"
                  }`}
                >
                  {rating}-star
                </button>
              ))}
              {supportsVerified && (
                <button
                  type="button"
                  onClick={() => setVerifiedOnly((current) => !current)}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold transition ${
                    verifiedOnly
                      ? "bg-trust text-white"
                      : "border border-gray-200 bg-white text-muted hover:border-trust hover:text-trust-dark"
                  }`}
                >
                  Verified only
                </button>
              )}
            </div>
          </div>
        )}

        {topMentions.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-bold text-ink">Top mentions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {topMentions.map((mention) => (
                <button
                  key={mention.keyword}
                  type="button"
                  onClick={() => toggleMention(mention.keyword)}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold transition ${
                    activeMention === mention.keyword
                      ? "bg-trust text-white"
                      : "border border-gray-200 bg-white text-muted hover:border-trust hover:text-trust-dark"
                  }`}
                >
                  {mention.keyword} <span className="opacity-75">({mention.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm text-muted">
          <p>
            Showing <span className="font-bold text-ink">{filteredReviews.length}</span> of{" "}
            <span className="font-bold text-ink">{reviews.length}</span> reviews
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="inline-flex items-center font-bold text-trust-dark hover:text-ink">
              Clear filters
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-5">
        {filteredReviews.length > 0 ? (
          <>
            {paginatedReviews.map((review) => <ReviewCard key={review.id} review={review} brandSlug={brandSlug} />)}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm">
                <p className="font-semibold text-muted">
                  Page {safeCurrentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safeCurrentPage === 1}
                    className="rounded-full border border-purple-200 bg-white px-4 py-2 font-bold text-ink transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="rounded-full border border-purple-200 bg-white px-4 py-2 font-bold text-ink transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : reviews.length > 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-bold text-ink">
              {activeRatingFilter.length === 0 ? "No reviews match your filters." : "No reviews found for the selected ratings."}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center rounded-full bg-trust px-5 py-3 font-bold text-white hover:bg-trust-dark"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-bold text-ink">No reviews yet.</p>
            <p className="mt-2 text-muted">Be the first to review this furniture brand.</p>
            <Link href={writeReviewHref} className="mt-5 inline-flex rounded-full bg-trust px-5 py-3 font-bold text-white hover:bg-trust-dark">
              Write a review
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
