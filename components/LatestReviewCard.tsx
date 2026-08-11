import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RatingStars } from "@/components/RatingStars";
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

function getWebsiteDomain(website?: string | null) {
  if (!website) return "";

  try {
    const withProtocol = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    return new URL(withProtocol).hostname.replace(/^www\./, "");
  } catch {
    return website.replace(/^https?:\/\//i, "").replace(/^www\./, "").split("/")[0];
  }
}

export function LatestReviewCard({ review }: { review: ReviewWithReply }) {
  const brandSlug = review.companies?.slug ?? "";
  const brandName = review.companies?.name;
  const brandLogo = review.companies?.logo_url;
  const brandDomain = getWebsiteDomain(review.companies?.website);

  return (
    <article
      id={`review-${review.id}`}
      className="flex h-[300px] scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-colors hover:border-purple-300"
    >
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-purple-100 font-bold text-trust-dark ring-1 ring-purple-200">
            {getInitials(review.reviewer_name) || "R"}
            {review.is_verified ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-[4px] bg-emerald-600 text-white ring-2 ring-white" title="Verified review" aria-label="Verified review">
                <Check size={11} strokeWidth={3} />
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-bold text-ink">{review.reviewer_name}</p>
              <time className="shrink-0 text-xs font-medium text-muted" dateTime={review.created_at}>
                {formatReviewDate(review.created_at)}
              </time>
            </div>
            {review.is_verified ? (
              <p className="mt-0.5 truncate text-[11px] font-bold text-emerald-700">Verified customer</p>
            ) : null}
            <div className="mt-1.5">
              <RatingStars rating={review.rating} size="small" />
            </div>
          </div>
        </div>

        <h3 className="mt-3 truncate text-base font-bold leading-snug text-ink">{review.title}</h3>
        <p className="mt-2 line-clamp-4 overflow-hidden text-sm leading-5 text-slate-700">{review.content}</p>
      </div>

      {brandSlug && brandName ? (
        <Link
          href={`/review/${brandSlug}`}
          className="flex items-center gap-3 border-t border-line bg-[#fbfafc] px-4 py-3 transition-colors hover:bg-purple-50"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-white text-sm font-bold text-trust-dark">
            {brandLogo ? (
              <Image
                src={brandLogo}
                alt={`${brandName} logo`}
                width={40}
                height={40}
                className="h-full w-full object-contain p-1.5"
                loading="lazy"
              />
            ) : (
              brandName.charAt(0).toUpperCase()
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-ink">{brandName}</span>
            {brandDomain ? <span className="block truncate text-xs text-muted">{brandDomain}</span> : null}
          </span>
        </Link>
      ) : null}
    </article>
  );
}
