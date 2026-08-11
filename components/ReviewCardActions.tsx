"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flag, Share2, ThumbsUp } from "lucide-react";

type ReviewCardActionsProps = {
  reviewId: string;
  brandSlug: string;
  reviewTitle?: string;
  initialUsefulCount?: number | null;
  variant?: "default" | "latest";
};

export function ReviewCardActions({
  reviewId,
  brandSlug,
  reviewTitle,
  initialUsefulCount = 0,
  variant = "default"
}: ReviewCardActionsProps) {
  const [usefulCount, setUsefulCount] = useState(Number(initialUsefulCount ?? 0));
  const [hasMarkedUseful, setHasMarkedUseful] = useState(false);
  const [isSavingUseful, setIsSavingUseful] = useState(false);
  const [copied, setCopied] = useState(false);
  const reviewPath = `/review/${brandSlug}#review-${reviewId}`;
  const isLatest = variant === "latest";
  const rowClassName = isLatest
    ? "mt-3 flex flex-nowrap items-center gap-4 overflow-hidden whitespace-nowrap border-t border-gray-100 pt-3"
    : "mt-5 flex flex-nowrap items-center gap-2 border-t border-gray-100 pt-4";
  const buttonClassName = isLatest
    ? "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full py-1.5 text-xs font-bold transition"
    : "inline-flex min-w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition sm:px-4";

  const reviewUrl = useMemo(() => {
    if (typeof window === "undefined") return reviewPath;
    return `${window.location.origin}${reviewPath}`;
  }, [reviewPath]);

  async function handleUseful() {
    if (isSavingUseful || hasMarkedUseful) return;

    const previousCount = usefulCount;
    setIsSavingUseful(true);
    setHasMarkedUseful(true);
    setUsefulCount((current) => current + 1);

    try {
      const response = await fetch(`/api/reviews/${encodeURIComponent(reviewId)}/useful`, {
        method: "POST"
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Useful update failed.");
      }

      setUsefulCount(Number(result.useful_count ?? previousCount + 1));
    } catch (error) {
      console.error("Useful update failed", error);
      setUsefulCount(previousCount);
      setHasMarkedUseful(false);
    } finally {
      setIsSavingUseful(false);
    }
  }

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
    <div className={rowClassName}>
      <button
        type="button"
        onClick={handleUseful}
        disabled={isSavingUseful || hasMarkedUseful}
        className={`${buttonClassName} ${
          hasMarkedUseful ? "bg-[#A855F7] px-3 text-white sm:px-4" : "text-muted hover:bg-wash hover:text-trust-dark"
        }`}
      >
        <ThumbsUp size={15} />
        {usefulCount > 0 ? `Useful (${usefulCount})` : "Useful"}
      </button>

      <button
        type="button"
        onClick={handleShare}
        className={`${buttonClassName} text-muted hover:bg-wash hover:text-trust-dark`}
      >
        <Share2 size={15} />
        {copied ? "Link copied" : "Share"}
      </button>

      <Link
        href={`/report-review?review_id=${encodeURIComponent(reviewId)}`}
        className={`${buttonClassName} text-muted hover:bg-wash hover:text-trust-dark`}
      >
        <Flag size={15} />
        Report
      </Link>
    </div>
  );
}
