import type { Metadata } from "next";
import { moderateReview } from "@/lib/actions";
import { getPendingReviews } from "@/lib/data";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Admin Review Approval",
  "Approve, reject and verify pending reviews."
);

export default async function AdminReviewsPage({
  searchParams
}: {
  searchParams: { password?: string; error?: string };
}) {
  const password = searchParams.password ?? "";
  const reviews = password ? await getPendingReviews(password) : [];
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
                        <a key={`${imageUrl}-${index}`} href={imageUrl} target="_blank" rel="noreferrer">
                          <img
                            src={imageUrl}
                            alt={`Review photo ${index + 1}`}
                            className="h-12 w-12 rounded-lg border border-line object-cover"
                            loading="lazy"
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
    </div>
  );
}
