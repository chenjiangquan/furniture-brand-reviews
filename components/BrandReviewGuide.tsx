import Link from "next/link";
import type { InternalLink } from "@/lib/internal-links";

type BrandReviewGuideProps = {
  brandName: string;
  brandSlug: string;
  category: string;
  approvedReviewCount: number;
  averageRating: number;
  relatedCategories: InternalLink[];
  relatedRankingPages: InternalLink[];
};

export function BrandReviewGuide({
  brandName,
  brandSlug,
  category,
  approvedReviewCount,
  averageRating,
  relatedCategories,
  relatedRankingPages
}: BrandReviewGuideProps) {
  const hasReviews = approvedReviewCount > 0 && averageRating > 0;
  const categoryLabel = category || "furniture brand";
  const primaryCategory = relatedCategories[0];
  const primaryRanking = relatedRankingPages[0];

  return (
    <section className="grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-trust-dark">Customer review guide</p>
        <h2 className="mt-2 text-2xl font-bold text-ink">How to use this {brandName} review page</h2>
        <p className="mt-3 leading-7 text-muted">
          This profile is designed to help furniture shoppers read {brandName} feedback in context, rather than relying on a single rating
          or one isolated customer story. The public score, review count, topic summaries and review list are based on approved reviews on
          Furniture Brand Reviews. New submissions are checked before publishing, and pending reviews do not affect the public rating,
          review schema, category rankings or comparison pages.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-wash p-5">
          <h3 className="font-bold text-ink">What to compare before ordering</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Before buying from {brandName}, compare the rating with the number of approved reviews and read several recent comments. For
            furniture purchases, shoppers often need to consider delivery timing, product condition on arrival, material quality, assembly,
            returns and how clearly the company responds when something goes wrong. A high score with very few reviews should be treated
            differently from a score supported by a larger sample.
          </p>
        </div>
        <div className="rounded-xl bg-wash p-5">
          <h3 className="font-bold text-ink">Current review signal</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {hasReviews
              ? `${brandName} currently has ${approvedReviewCount} approved customer ${approvedReviewCount === 1 ? "review" : "reviews"} with an average rating of ${averageRating.toFixed(1)} out of 5. Use the rating breakdown and individual review cards to understand whether feedback is concentrated around positive experiences, mixed feedback or lower-rated complaints.`
              : `There are not enough approved ${brandName} reviews yet to identify a reliable rating pattern. You can still use this page to check brand information, compare related ${categoryLabel.toLowerCase()} pages and submit a genuine customer review.`}
          </p>
        </div>
        <div className="rounded-xl bg-wash p-5">
          <h3 className="font-bold text-ink">How Furniture Brand Reviews handles feedback</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Reviews are moderated before publishing to reduce spam and keep the platform useful for furniture buyers. Companies cannot pay
            to remove approved reviews, and incentivised feedback should be disclosed. If a review looks suspicious or contains private
            information, it can be reported for manual review.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/review-guidelines" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
              Review guidelines
            </Link>
            <Link href="/trust-and-safety" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
              Trust and safety
            </Link>
            <Link href="/content-policy" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
              Content policy
            </Link>
          </div>
        </div>
        <div className="rounded-xl bg-wash p-5">
          <h3 className="font-bold text-ink">Explore related furniture choices</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            If you are still comparing options, use related category and ranking pages to check other brands with similar product ranges.
            {primaryCategory ? ` The ${primaryCategory.label} page can help you compare broader customer feedback in this category.` : ""}
            {primaryRanking ? ` You can also review ${primaryRanking.label.toLowerCase()} for a wider market view.` : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/review/${brandSlug}/write`} className="rounded-full bg-trust px-3 py-1.5 text-xs font-bold text-white hover:bg-trust-dark">
              Write a review
            </Link>
            {primaryCategory ? (
              <Link href={primaryCategory.href} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
                {primaryCategory.label}
              </Link>
            ) : null}
            {primaryRanking ? (
              <Link href={primaryRanking.href} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
                {primaryRanking.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
