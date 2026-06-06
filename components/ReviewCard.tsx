import { Check } from "lucide-react";
import { RatingStars } from "@/components/RatingStars";
import { ReviewCardActions } from "@/components/ReviewCardActions";
import { ReviewImageGallery } from "@/components/ReviewImageGallery";
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

export function ReviewCard({ review, brandSlug }: { review: ReviewWithReply; brandSlug?: string }) {
  const actionBrandSlug = brandSlug ?? review.companies?.slug ?? "";
  const latestReply = review.company_replies?.[0];

  return (
    <article id={`review-${review.id}`} className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-wash font-bold text-trust-dark ring-1 ring-line">
          {getInitials(review.reviewer_name) || "R"}
          {review.is_verified ? (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-[4px] bg-emerald-600 text-white ring-2 ring-white" title="Verified review" aria-label="Verified review">
              <Check size={11} strokeWidth={3} />
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-ink">{review.reviewer_name}</p>
              {review.is_verified ? (
                <p className="mt-0.5 text-xs font-bold text-emerald-700">Verified customer</p>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <RatingStars rating={review.rating} size="small" />
              </div>
            </div>
            <time className="text-sm text-muted" dateTime={review.created_at}>
              {formatReviewDate(review.created_at)}
            </time>
          </div>
          <h3 className="mt-4 text-lg font-bold text-ink">{review.title}</h3>
          <p className="mt-2 leading-7 text-muted">{review.content}</p>
          {review.review_image_urls && review.review_image_urls.length > 0 && (
            <ReviewImageGallery images={review.review_image_urls} maxImages={4} />
          )}
          {latestReply ? (
            <div className="mt-5 rounded-xl border border-line bg-wash p-4">
              <p className="text-sm font-bold text-ink">Company reply</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{latestReply.reply}</p>
            </div>
          ) : null}
          {actionBrandSlug && (
            <ReviewCardActions
              reviewId={review.id}
              brandSlug={actionBrandSlug}
              reviewTitle={review.title}
              initialUsefulCount={review.useful_count}
            />
          )}
        </div>
      </div>
    </article>
  );
}
