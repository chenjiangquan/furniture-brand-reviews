"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";

type BrandShareActionsProps = {
  brandName: string;
  reviewPageUrl: string;
  writeReviewUrl: string;
};

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export function BrandShareActions({ brandName, reviewPageUrl, writeReviewUrl }: BrandShareActionsProps) {
  const [message, setMessage] = useState("");
  const shareText = `Read and write ${brandName} reviews on Furniture Brand Reviews.`;

  async function handleCopy(value: string, label: string) {
    try {
      await copyText(value);
      setMessage(`${label} copied`);
      window.setTimeout(() => setMessage(""), 2200);
    } catch {
      setMessage("Copy failed. Please copy the link manually.");
    }
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${brandName} reviews`,
          text: shareText,
          url: reviewPageUrl
        });
        return;
      }

      await handleCopy(`${shareText}\n${reviewPageUrl}`, "Share text");
    } catch {
      setMessage("Share cancelled.");
      window.setTimeout(() => setMessage(""), 1800);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <p className="text-sm font-bold text-ink">Share this review page</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleCopy(reviewPageUrl, "Review page link")}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-trust-dark hover:border-trust"
        >
          <Copy size={15} />
          Copy review page link
        </button>
        <button
          type="button"
          onClick={() => handleCopy(writeReviewUrl, "Write review link")}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-trust-dark hover:border-trust"
        >
          <Copy size={15} />
          Copy write review link
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full bg-wash px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust"
        >
          <Share2 size={15} />
          Share
        </button>
      </div>
      {message ? <p className="mt-3 text-xs font-semibold text-trust-dark">{message}</p> : null}
    </div>
  );
}
