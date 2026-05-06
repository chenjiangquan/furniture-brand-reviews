"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flag, Share2, ThumbsUp } from "lucide-react";

type ReviewCardActionsProps = {
  reviewId: string;
  brandSlug: string;
  reviewTitle?: string;
};

export function ReviewCardActions({ reviewId, brandSlug, reviewTitle }: ReviewCardActionsProps) {
  const [isUseful, setIsUseful] = useState(false);
  const [copied, setCopied] = useState(false);
  const reviewPath = `/review/${brandSlug}#review-${reviewId}`;

  const reviewUrl = useMemo(() => {
    if (typeof window === "undefined") return reviewPath;
    return `${window.location.origin}${reviewPath}`;
  }, [reviewPath]);

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: reviewTitle ?? "Furniture Brand Reviews review",
          url: reviewUrl
        });
        return;
      }

      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
      <button
        type="button"
        onClick={() => setIsUseful((current) => !current)}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
          isUseful ? "bg-[#A855F7] text-white" : "text-muted hover:bg-wash hover:text-trust-dark"
        }`}
      >
        <ThumbsUp size={15} />
        {isUseful ? "Useful (1)" : "Useful"}
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-wash hover:text-trust-dark"
      >
        <Share2 size={15} />
        {copied ? "Link copied" : "Share"}
      </button>

      <Link
        href={`/report-review?review_id=${encodeURIComponent(reviewId)}`}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-wash hover:text-trust-dark"
      >
        <Flag size={15} />
        Report
      </Link>
    </div>
  );
}
