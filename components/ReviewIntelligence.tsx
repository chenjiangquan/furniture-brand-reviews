import { AlertTriangle, BarChart3, MessageCircleMore, PackageCheck, RotateCcw, Truck } from "lucide-react";
import { getRatingColour } from "@/components/RatingStars";
import type { ReviewIntelligence as ReviewIntelligenceData } from "@/lib/review-intelligence";

function pluralizeReviews(count: number) {
  return `${count} ${count === 1 ? "review" : "reviews"}`;
}

function TopicSentiment({ positive, mixed, negative }: { positive: number; mixed: number; negative: number }) {
  const parts = [
    positive > 0 ? `${positive} positive` : "",
    mixed > 0 ? `${mixed} mixed` : "",
    negative > 0 ? `${negative} negative` : ""
  ].filter(Boolean);

  if (!parts.length) return null;

  return <span className="text-xs font-semibold text-muted">{parts.join(" · ")}</span>;
}

export function ReviewIntelligence({ companyName, intelligence }: { companyName: string; intelligence: ReviewIntelligenceData }) {
  const usesLatestSample = intelligence.analysisReviewCount < intelligence.approvedReviewCount;

  return (
    <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-trust-dark">Review intelligence</p>
        <h2 className="mt-2 text-2xl font-bold text-ink">What customers mention about {companyName}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          These insights are generated from approved reviews only. Pending, rejected and deleted reviews are not included.
          {usesLatestSample
            ? ` Rating totals use all ${pluralizeReviews(intelligence.approvedReviewCount)}; topic and complaint signals use the latest ${pluralizeReviews(intelligence.analysisReviewCount)}.`
            : ""}
        </p>
      </div>

      {!intelligence.hasEnoughForPatterns ? (
        <div className="rounded-xl bg-wash p-5 text-sm leading-6 text-muted">
          There are not enough approved reviews yet to identify clear customer patterns.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-wash p-4">
              <p className="text-sm font-bold text-muted">Average rating</p>
              <p className="mt-2 text-3xl font-bold text-ink">{intelligence.averageRating.toFixed(1)}</p>
              <p className="mt-1 text-xs font-semibold text-muted">based on approved reviews</p>
            </div>
            <div className="rounded-xl bg-wash p-4">
              <p className="text-sm font-bold text-muted">Approved reviews</p>
              <p className="mt-2 text-3xl font-bold text-ink">{intelligence.approvedReviewCount}</p>
              <p className="mt-1 text-xs font-semibold text-muted">used for rating totals</p>
            </div>
            <div className="rounded-xl bg-wash p-4">
              <p className="text-sm font-bold text-muted">Complaint signals</p>
              <p className="mt-2 text-3xl font-bold text-ink">{intelligence.complaintCount}</p>
              <p className="mt-1 text-xs font-semibold text-muted">
                low rating or issue keywords{usesLatestSample ? ` in latest ${intelligence.analysisReviewCount}` : ""}
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <div className="rounded-xl border border-line bg-white p-5">
              <div className="flex items-center gap-2">
                <MessageCircleMore size={19} className="text-trust-dark" />
                <h3 className="text-lg font-bold text-ink">Top mentioned topics</h3>
              </div>

              {intelligence.hasEnoughForTopics && intelligence.topTopics.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {intelligence.topTopics.map((topic) => (
                    <div key={topic.label} className="rounded-xl bg-wash px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-ink">{topic.label}</p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-trust-dark ring-1 ring-line">
                          {pluralizeReviews(topic.count)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <TopicSentiment {...topic.sentiment} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-wash p-4 text-sm leading-6 text-muted">
                  There are not enough approved reviews yet to identify clear customer patterns.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-line bg-white p-5">
              <div className="flex items-center gap-2">
                <BarChart3 size={19} className="text-trust-dark" />
                <h3 className="text-lg font-bold text-ink">{companyName} rating breakdown</h3>
              </div>
              <div className="mt-4 grid gap-3">
                {intelligence.starDistribution.map((item) => (
                  <div key={item.rating} className="grid grid-cols-[56px_1fr_44px] items-center gap-3 text-sm">
                    <span className="font-bold text-ink">{item.rating}-star</span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${item.percentage}%`, backgroundColor: getRatingColour(item.rating) }}
                      />
                    </span>
                    <span className="text-right font-semibold text-muted">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {intelligence.deliveryMentionCount >= 3 ? (
              <div className="rounded-xl border border-line bg-wash p-5">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-trust-dark" />
                  <h3 className="font-bold text-ink">{companyName} delivery reviews</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Delivery is mentioned in {pluralizeReviews(intelligence.deliveryMentionCount)} for {companyName}. Customer feedback may include comments about delivery timing, courier experience, tracking, or arrival condition.
                </p>
              </div>
            ) : null}

            {intelligence.qualityMentionCount >= 3 ? (
              <div className="rounded-xl border border-line bg-wash p-5">
                <div className="flex items-center gap-2">
                  <PackageCheck size={18} className="text-trust-dark" />
                  <h3 className="font-bold text-ink">{companyName} product quality reviews</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Product quality is mentioned in {pluralizeReviews(intelligence.qualityMentionCount)} for {companyName}. Customers may refer to materials, build quality, comfort, finish or durability.
                </p>
              </div>
            ) : null}

            {intelligence.customerServiceMentionCount >= 3 ? (
              <div className="rounded-xl border border-line bg-wash p-5">
                <div className="flex items-center gap-2">
                  <MessageCircleMore size={18} className="text-trust-dark" />
                  <h3 className="font-bold text-ink">{companyName} customer service reviews</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Customer service is mentioned in {pluralizeReviews(intelligence.customerServiceMentionCount)} for {companyName}. Reviews may refer to response times, support quality, email communication or issue resolution.
                </p>
              </div>
            ) : null}

            {intelligence.returnsMentionCount >= 3 ? (
              <div className="rounded-xl border border-line bg-wash p-5">
                <div className="flex items-center gap-2">
                  <RotateCcw size={18} className="text-trust-dark" />
                  <h3 className="font-bold text-ink">{companyName} returns and refunds reviews</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Returns or refunds are mentioned in {pluralizeReviews(intelligence.returnsMentionCount)} for {companyName}. Reviews may refer to returns, exchanges, cancellations, collections or refund handling.
                </p>
              </div>
            ) : null}

            {intelligence.complaintCount >= 3 ? (
              <div className="rounded-xl border border-line bg-wash p-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-trust-dark" />
                  <h3 className="font-bold text-ink">{companyName} complaints</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Some approved reviews mention issues such as delivery delays, product condition, returns or customer service. This section is based only on published customer reviews on Furniture Brand Reviews.
                </p>
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
