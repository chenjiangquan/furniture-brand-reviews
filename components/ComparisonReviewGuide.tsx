import Link from "next/link";
import type { ComparisonBrandData } from "@/lib/comparison-data";

function signalText(count: number, brandName: string, topic: string) {
  if (count <= 0) return `There are not enough approved ${brandName} reviews mentioning ${topic} yet.`;
  return `${count} approved ${count === 1 ? "review mentions" : "reviews mention"} ${topic} for ${brandName}.`;
}

export function ComparisonReviewGuide({
  brandA,
  brandB
}: {
  brandA: ComparisonBrandData;
  brandB: ComparisonBrandData;
}) {
  const brandAName = brandA.company.name;
  const brandBName = brandB.company.name;
  const totalReviews = brandA.intelligence.approvedReviewCount + brandB.intelligence.approvedReviewCount;

  return (
    <section className="grid gap-6 rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-trust-dark">Comparison guide</p>
        <h2 className="mt-2 text-2xl font-bold text-ink">How to read this {brandAName} vs {brandBName} comparison</h2>
        <p className="mt-3 leading-7 text-muted">
          This page compares {brandAName} and {brandBName} using approved customer reviews on Furniture Brand Reviews. It is intended to
          help shoppers compare current review signals, not to declare one furniture brand universally better than another. The most useful
          signal is usually the combination of average rating, review count and the written review context behind the numbers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl bg-wash p-5">
          <h3 className="font-bold text-ink">What this comparison can tell you</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            The comparison can show how many approved reviews each brand has, how customers rate them, and whether review text commonly
            mentions delivery, product quality, customer service, returns or complaint-related issues. Across both brands, this comparison
            currently draws on {totalReviews} approved {totalReviews === 1 ? "review" : "reviews"}.
          </p>
        </article>

        <article className="rounded-xl bg-wash p-5">
          <h3 className="font-bold text-ink">What this comparison cannot prove</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            It cannot prove that every future order will match past reviews, and it should not replace checking product details, delivery
            terms, return policies and the brand&apos;s own website. A brand with fewer reviews may have less reliable patterns, while a
            brand with many reviews may show a broader range of customer experiences.
          </p>
        </article>

        <article className="rounded-xl bg-wash p-5">
          <h3 className="font-bold text-ink">Delivery, quality and service signals</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {signalText(brandA.intelligence.deliveryMentionCount, brandAName, "delivery")}{" "}
            {signalText(brandB.intelligence.deliveryMentionCount, brandBName, "delivery")} Product quality and customer service mentions
            should be read as prompts for deeper review reading, especially for large furniture orders where delays, damage or support
            response can affect the overall buying experience.
          </p>
        </article>

        <article className="rounded-xl bg-wash p-5">
          <h3 className="font-bold text-ink">How complaint signals are handled</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Complaint signals are counted conservatively from low-rated approved reviews and review text that mentions problems such as
            damage, delays, refunds, returns or poor service. They are not legal findings and should not be treated as proof that a brand
            is unsafe or dishonest. Read the full reviews before making a decision.
          </p>
        </article>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={`/review/${brandA.company.slug}`} className="rounded-full bg-trust px-4 py-2 text-sm font-bold text-white hover:bg-trust-dark">
          Read {brandAName} reviews
        </Link>
        <Link href={`/review/${brandB.company.slug}`} className="rounded-full bg-trust px-4 py-2 text-sm font-bold text-white hover:bg-trust-dark">
          Read {brandBName} reviews
        </Link>
        <Link href="/review-guidelines" className="rounded-full bg-wash px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
          Review guidelines
        </Link>
      </div>
    </section>
  );
}
