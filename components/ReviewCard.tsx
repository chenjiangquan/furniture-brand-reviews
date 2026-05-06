import { CheckCircle2 } from "lucide-react";
import { RatingStars } from "@/components/RatingStars";
import { ReviewCardActions } from "@/components/ReviewCardActions";
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

  return (
    <article id={`review-${review.id}`} className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-wash font-bold text-trust-dark ring-1 ring-line">
          {getInitials(review.reviewer_name) || "R"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-ink">{review.reviewer_name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <RatingStars rating={review.rating} size="small" />
                {review.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-trust-dark">
                    <CheckCircle2 size={14} />
                    Verified
                  </span>
                )}
              </div>
            </div>
            <time className="text-sm text-muted" dateTime={review.created_at}>
              {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(review.created_at))}
            </time>
          </div>
          <h3 className="mt-4 text-lg font-bold text-ink">{review.title}</h3>
          <p className="mt-2 leading-7 text-muted">{review.content}</p>
          {review.company_replies?.map((reply) => (
            <div key={reply.id} className="mt-5 rounded-xl border border-line bg-wash p-4">
              <p className="text-sm font-bold text-ink">Company reply</p>
              <p className="mt-2 text-sm leading-6 text-muted">{reply.reply}</p>
            </div>
          ))}
          {actionBrandSlug && <ReviewCardActions reviewId={review.id} brandSlug={actionBrandSlug} reviewTitle={review.title} />}
        </div>
      </div>
    </article>
  );
}
