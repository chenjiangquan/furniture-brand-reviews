import type { Metadata } from "next";
import Image from "next/image";
import { moderateReview, moderateReviewFlag } from "@/lib/actions";
import { getPendingReviewFlags, getPendingReviews } from "@/lib/data";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Admin Review Approval",
  "Approve, reject and verify pending reviews."
);

export default async function AdminReviewsPage({
  searchParams
}: {
  searchParams: { password?: string; error?: string; success?: string };
}) {
  const password = searchParams.password ?? "";
  const reviews = password ? await getPendingReviews(password) : [];
  const flags = password ? await getPendingReviewFlags(password) : [];
  const errorMessage = searchParams.error && searchParams.error !== "1" ? searchParams.error : null;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Pending reviews</h1>
      <form className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 sm:flex-row">
        <input
          name="password"
          type="password"
          defaultValue={password}
          placeholder="Admin password"
          className="min-h-12 flex-1 rounded-xl border border-line px-4"
        />
        <button className="rounded-full bg-ink px-5 py-3 font-bold text-white">View reviews</button>
      </form>
      {searchParams.error === "1" && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Invalid admin password.</p>}
      {errorMessage && (
        <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          Supabase error: {errorMessage}
        </p>
      )}
      {searchParams.success ? (
        <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-800">{searchParams.success}</p>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-wash text-ink">
            <tr>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Experience details</th>
              <th className="px-4 py-3">Photos</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} className="border-t border-line">
                <td className="px-4 py-3">{review.companies?.name ?? review.pending_brand_name ?? review.company_id}</td>
                <td className="px-4 py-3">{review.rating}</td>
                <td className="px-4 py-3 font-semibold">{review.title}</td>
                <td className="px-4 py-3">
                  <dl className="grid gap-1 text-xs text-muted">
                    <div><dt className="inline font-bold text-ink">Product:</dt> <dd className="inline">{review.product_type || "Not provided"}</dd></div>
                    <div><dt className="inline font-bold text-ink">Order month:</dt> <dd className="inline">{review.order_month || "Not provided"}</dd></div>
                    <div><dt className="inline font-bold text-ink">Delivery:</dt> <dd className="inline">{review.delivery_experience || "Not provided"}</dd></div>
                    <div><dt className="inline font-bold text-ink">Service:</dt> <dd className="inline">{review.customer_service_experience || "Not provided"}</dd></div>
                    <div><dt className="inline font-bold text-ink">Buy again:</dt> <dd className="inline">{review.would_buy_again || "Not provided"}</dd></div>
                  </dl>
                </td>
                <td className="px-4 py-3">
                  {review.review_image_urls && review.review_image_urls.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {review.review_image_urls.slice(0, 4).map((imageUrl, index) => (
                        <a
                          key={`${imageUrl}-${index}`}
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="relative block h-12 w-12 overflow-hidden rounded-lg border border-line"
                        >
                          <Image
                            src={imageUrl}
                            alt={`Review photo ${index + 1}`}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">No photos</span>
                  )}
                </td>
                <td className="px-4 py-3">{review.reviewer_email}</td>
                <td className="px-4 py-3">{new Intl.DateTimeFormat("en-GB").format(new Date(review.created_at))}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {["approve", "reject", "delete", "spam", "verify"].map((actionName) => (
                      <form key={actionName} action={moderateReview}>
                        <input type="hidden" name="password" value={password} />
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="action" value={actionName} />
                        <button className="rounded-full border border-line px-3 py-2 font-semibold capitalize hover:border-trust hover:text-trust-dark">
                          {actionName === "verify" ? "Mark as verified" : actionName === "spam" ? "Mark as spam" : actionName}
                        </button>
                      </form>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {password && reviews.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted">
                  No pending reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-10">
        <h2 className="text-3xl font-bold tracking-tight text-ink">Flagged reviews</h2>
        <p className="mt-2 text-sm text-muted">Business users can flag published reviews here for admin moderation.</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-wash text-ink">
              <tr>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3">Reported by</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag.id} className="border-t border-line align-top">
                  <td className="px-4 py-3">
                    {flag.companies?.slug ? (
                      <a className="font-semibold text-trust-dark underline" href={`/review/${flag.companies.slug}`} target="_blank" rel="noreferrer">
                        {flag.companies.name}
                      </a>
                    ) : (
                      flag.company_id
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{flag.reason}</p>
                    {flag.details ? <p className="mt-2 max-w-sm text-xs leading-5 text-muted">{flag.details}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-lg">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted">{flag.reviews?.rating ?? "?"} stars · {flag.reviews?.reviewer_name ?? "Unknown"}</p>
                      <p className="mt-1 font-semibold text-ink">{flag.reviews?.title ?? "Review not found"}</p>
                      <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted">{flag.reviews?.content ?? "This review may have been deleted."}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{flag.reported_by_email}</td>
                  <td className="px-4 py-3">{new Intl.DateTimeFormat("en-GB").format(new Date(flag.created_at))}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {[
                        ["dismissed", "Dismiss flag"],
                        ["remove_review", "Remove review"]
                      ].map(([actionName, label]) => (
                        <form key={actionName} action={moderateReviewFlag}>
                          <input type="hidden" name="password" value={password} />
                          <input type="hidden" name="flagId" value={flag.id} />
                          <input type="hidden" name="action" value={actionName} />
                          <button className={`rounded-full border px-3 py-2 font-semibold ${actionName === "remove_review" ? "border-red-200 text-red-700 hover:bg-red-50" : "border-line hover:border-trust hover:text-trust-dark"}`}>
                            {label}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {password && flags.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    No flagged reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
