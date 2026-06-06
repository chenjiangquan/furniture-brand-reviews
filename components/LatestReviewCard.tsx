import { Check } from "lucide-react";
import Link from "next/link";
import { RatingStars } from "@/components/RatingStars";
import { ReviewCardActions } from "@/components/ReviewCardActions";
import { formatReviewDate } from "@/lib/format";
import type { ReviewWithReply } from "@/lib/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function LatestReviewCard({ review }: { review: ReviewWithReply }) {
  const brandSlug = review.companies?.slug ?? "";
  const brandName = review.companies?.name;
  const firstImage = review.review_image_urls?.[0];

  return (
    <article
      id={`review-${review.id}`}
      className="flex h-[360px] scroll-mt-24 flex-col rounded-2xl border border-line bg-white p-5 pb-6 shadow-sm"
    >
      <div className="flex min-h-0 flex-1 items-start gap-4 overflow-hidden">
        <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-wash font-bold text-trust-dark ring-1 ring-line">
          {getInitials(review.reviewer_name) || "R"}
          {review.is_verified ? (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-[4px] bg-emerald-600 text-white ring-2 ring-white" title="Verified review" aria-label="Verified review">
              <Check size={11} strokeWidth={3} />
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-bold text-ink">{review.reviewer_name}</p>
              {review.is_verified ? (
                <p className="mt-0.5 truncate text-xs font-bold text-emerald-700">Verified customer</p>
              ) : null}
              {brandSlug && brandName ? (
                <Link
                  href={`/review/${brandSlug}`}
                  className="mt-1 block truncate text-xs font-bold text-trust-dark hover:underline"
                >
                  Review for {brandName}
                </Link>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <RatingStars rating={review.rating} size="small" />
              </div>
            </div>
            <time className="shrink-0 text-sm text-muted" dateTime={review.created_at}>
              {formatReviewDate(review.created_at)}
            </time>
          </div>

          <h3 className="mt-4 line-clamp-2 text-lg font-bold leading-snug text-ink">{review.title}</h3>
          <p className="mt-2 line-clamp-4 overflow-hidden text-sm leading-6 text-muted">{review.content}</p>

          {firstImage ? (
            <a
              href={firstImage}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block w-28 overflow-hidden rounded-xl border border-line bg-wash"
              aria-label="Open review photo"
            >
              <img
                src={firstImage}
                alt="Review photo"
                className="h-20 w-28 object-cover"
                loading="lazy"
              />
            </a>
          ) : null}
        </div>
      </div>

      {brandSlug ? (
        <div className="mt-auto">
          <ReviewCardActions
            reviewId={review.id}
            brandSlug={brandSlug}
            reviewTitle={review.title}
            initialUsefulCount={review.useful_count}
            variant="latest"
          />
        </div>
      ) : null}
    </article>
  );
}
