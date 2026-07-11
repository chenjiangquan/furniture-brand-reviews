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
    <article id={`review-${review.id}`} className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-wash font-bold text-trust-dark ring-1 ring-line sm:h-11 sm:w-11">
            {getInitials(review.reviewer_name) || "R"}
            {review.is_verified ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-[4px] bg-emerald-600 text-white ring-2 ring-white" title="Verified review" aria-label="Verified review">
                <Check size={11} strokeWidth={3} />
              </span>
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold text-black sm:text-[15px]">{review.reviewer_name}</p>
            {review.is_verified ? (
              <p className="mt-0.5 text-xs font-bold text-emerald-700">Verified customer</p>
            ) : null}
          </div>
        </div>
        <time className="shrink-0 text-[13px] text-black" dateTime={review.created_at}>
          {formatReviewDate(review.created_at)}
        </time>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-4">
        <RatingStars rating={review.rating} size="small" />
      </div>

      <h3 className="mt-4 text-[19px] font-bold leading-snug text-black sm:text-[17px]">{review.title}</h3>
      <p className="mt-3 text-[15px] leading-6 text-black">{review.content}</p>

      {review.review_image_urls && review.review_image_urls.length > 0 && (
        <ReviewImageGallery images={review.review_image_urls} maxImages={4} />
      )}

      {actionBrandSlug && (
        <ReviewCardActions
          reviewId={review.id}
          brandSlug={actionBrandSlug}
          reviewTitle={review.title}
          initialUsefulCount={review.useful_count}
        />
      )}

      {latestReply ? (
        <div className="mt-5 border-l-4 border-line pl-4 sm:rounded-xl sm:border sm:border-line sm:bg-wash sm:p-4">
          <p className="text-[13px] font-bold text-black">Company reply</p>
          {latestReply.created_at ? (
            <p className="mt-1 text-[11px] font-semibold text-black">{formatReviewDate(latestReply.created_at)}</p>
          ) : null}
          <p className="mt-2 whitespace-pre-line text-[13px] leading-5 text-black">{latestReply.reply}</p>
        </div>
      ) : null}
    </article>
  );
}
