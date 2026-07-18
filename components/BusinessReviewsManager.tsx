"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Flag, MessageSquareReply, X } from "lucide-react";
import { addBusinessReplyInline, flagBusinessReviewInline, saveBusinessAutoReplySettings, verifyBusinessReviewInline } from "@/lib/actions";
import type { ReviewWithReply } from "@/lib/types";
import { Rating } from "@/components/Rating";

const REVIEWS_PER_PAGE = 10;

const flagReasons = [
  "Harmful or illegal",
  "Personal information",
  "Advertising or promotional",
  "About a different business",
  "Not based on a genuine experience",
  "None of the flagging reasons apply"
];

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function SubmitFlagButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="mt-5 w-full rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Submitting flag..." : "Submit flag"}
    </button>
  );
}

function SubmitReplyButton({ hasExistingReply }: { hasExistingReply: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="inline-flex w-fit items-center gap-2 rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      <MessageSquareReply size={16} />
      {pending ? "Saving reply..." : hasExistingReply ? "Save reply" : "Publish reply"}
    </button>
  );
}

function SubmitAutoReplyButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="w-fit rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving auto reply..." : "Save auto reply settings"}
    </button>
  );
}

function AutoReplySettingsForm({
  email,
  businessToken,
  companyId,
  companySlug,
  enabled,
  template
}: {
  email: string;
  businessToken: string;
  companyId: string;
  companySlug: string;
  enabled: boolean;
  template: string;
}) {
  const [state, action] = useFormState(saveBusinessAutoReplySettings, { ok: false, message: "" });

  return (
    <form action={action} className="mt-5 rounded-2xl border border-purple-100 bg-purple-50/50 p-5">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="businessToken" value={businessToken} />
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="companySlug" value={companySlug} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-bold text-ink">Auto reply to future reviews</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            When this is on, each newly approved review without an existing reply will receive this public reply automatically. Existing reviews will not be backfilled.
          </p>
        </div>
        <label className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-bold text-ink">
          <input
            type="checkbox"
            name="autoReplyEnabled"
            defaultChecked={enabled}
            className="h-4 w-4 rounded border-purple-200 text-trust focus:ring-purple-300"
          />
          Auto reply on
        </label>
      </div>
      <label className="mt-4 grid gap-2">
        <span className="text-sm font-bold text-ink">Reply template</span>
        <textarea
          name="autoReplyTemplate"
          defaultValue={template}
          placeholder={"Thank you for your review, {reviewerName}.\n\nWe appreciate you taking the time to share your experience with {brandName}.\n\nKind regards,\n{brandName}"}
          className="min-h-[140px] w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </label>
      <p className="mt-2 text-xs font-semibold text-muted">
        Supported variables: {"{brandName}"}, {"{reviewerName}"}, {"{rating}"}, {"{reviewTitle}"}.
      </p>
      {state.message ? (
        <div className={`mt-4 rounded-xl border p-4 text-sm font-bold ${state.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      ) : null}
      <div className="mt-4">
        <SubmitAutoReplyButton />
      </div>
    </form>
  );
}

function SubmitVerifyButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full border border-green-200 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <CheckCircle2 size={14} />
      {pending ? "Saving..." : "Mark verified"}
    </button>
  );
}

function BusinessVerifyForm({
  email,
  businessToken,
  companyId,
  companySlug,
  reviewId
}: {
  email: string;
  businessToken: string;
  companyId: string;
  companySlug: string;
  reviewId: string;
}) {
  const [verifyState, verifyAction] = useFormState(verifyBusinessReviewInline, { ok: false, message: "" });

  return (
    <form action={verifyAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="businessToken" value={businessToken} />
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="companySlug" value={companySlug} />
      <input type="hidden" name="reviewId" value={reviewId} />
      {verifyState.message ? (
        <span className={`text-xs font-bold ${verifyState.ok ? "text-green-700" : "text-red-600"}`}>
          {verifyState.message}
        </span>
      ) : null}
      {!verifyState.ok ? <SubmitVerifyButton /> : null}
    </form>
  );
}

function BusinessReplyForm({
  email,
  businessToken,
  companyId,
  companySlug,
  reviewId,
  existingReply
}: {
  email: string;
  businessToken: string;
  companyId: string;
  companySlug: string;
  reviewId: string;
  existingReply?: string;
}) {
  const [replyState, replyAction] = useFormState(addBusinessReplyInline, { ok: false, message: "" });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 grid gap-3">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
      >
        <MessageSquareReply size={16} />
        Reply
      </button>
      {replyState.message ? (
        <div className={`rounded-xl border p-4 text-sm font-bold ${replyState.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {replyState.message}
        </div>
      ) : null}
      {isOpen && !replyState.ok ? (
        <form action={replyAction} className="grid gap-3">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="businessToken" value={businessToken} />
          <input type="hidden" name="companyId" value={companyId} />
          <input type="hidden" name="companySlug" value={companySlug} />
          <input type="hidden" name="reviewId" value={reviewId} />
          <textarea
            name="reply"
            required
            minLength={10}
            defaultValue={existingReply ?? ""}
            placeholder="Write a helpful, professional public reply..."
            className="min-h-[240px] w-full rounded-xl border border-purple-100 px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <SubmitReplyButton hasExistingReply={Boolean(existingReply)} />
        </form>
      ) : null}
    </div>
  );
}

function FlagReviewForm({
  email,
  businessToken,
  companyId,
  companySlug,
  review,
  reason,
  onReasonChange
}: {
  email: string;
  businessToken: string;
  companyId: string;
  companySlug: string;
  review: ReviewWithReply;
  reason: string;
  onReasonChange: (reason: string) => void;
}) {
  const [flagState, flagAction] = useFormState(flagBusinessReviewInline, { ok: false, message: "" });

  return (
    <form action={flagAction} className="p-5">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="businessToken" value={businessToken} />
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="companySlug" value={companySlug} />
      <input type="hidden" name="reviewId" value={review.id} />
      <input type="hidden" name="reason" value={reason} />
      {flagState.message ? (
        <div className={`mb-4 rounded-xl border p-4 text-sm font-bold ${flagState.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {flagState.message}
        </div>
      ) : null}
      <p className="font-bold text-ink">Why are you flagging this review?</p>
      <div className="mt-4 grid divide-y divide-line rounded-2xl border border-line">
        {flagReasons.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onReasonChange(item)}
            className={`flex items-center justify-between px-4 py-4 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-300 ${
              reason === item ? "bg-purple-50 text-trust-dark" : "text-slate-700 hover:bg-wash"
            }`}
          >
            {item}
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </div>
      <label className="mt-4 grid gap-2">
        <span className="text-sm font-bold text-ink">Optional details</span>
        <textarea
          name="details"
          placeholder="Add helpful context for the admin reviewer..."
          className="min-h-[96px] w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </label>
      <SubmitFlagButton />
    </form>
  );
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 5) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  }

  if (currentPage >= totalPages - 4) {
    return [1, "ellipsis-start", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages];
}

export function BusinessReviewsManager({
  reviews,
  email,
  businessToken,
  companyId,
  companySlug,
  autoReplyEnabled = false,
  autoReplyTemplate = ""
}: {
  reviews: ReviewWithReply[];
  email: string;
  businessToken: string;
  companyId: string;
  companySlug: string;
  autoReplyEnabled?: boolean;
  autoReplyTemplate?: string;
}) {
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [flaggedReview, setFlaggedReview] = useState<ReviewWithReply | null>(null);
  const [flagReason, setFlagReason] = useState(flagReasons[0]);

  const filteredReviews = useMemo(() => {
    if (ratingFilter === "all") return reviews;
    const rating = Number(ratingFilter);
    return reviews.filter((review) => review.rating === rating);
  }, [ratingFilter, reviews]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const visibleReviews = filteredReviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [ratingFilter]);

  return (
    <section id="reviews" className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">Reviews</h2>
          <p className="mt-1 text-sm text-muted">Reply to approved reviews, filter by rating, and flag reviews for admin moderation.</p>
        </div>
        <a href={`/review/${companySlug}`} className="rounded-full bg-trust px-4 py-2 text-sm font-bold text-white hover:bg-trust-dark">
          Read all reviews
        </a>
      </div>

      <AutoReplySettingsForm
        email={email}
        businessToken={businessToken}
        companyId={companyId}
        companySlug={companySlug}
        enabled={autoReplyEnabled}
        template={autoReplyTemplate}
      />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {["all", "5", "4", "3", "2", "1"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRatingFilter(option)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${
              ratingFilter === option ? "bg-trust text-white" : "border border-purple-100 text-slate-700 hover:bg-purple-50"
            }`}
          >
            {option === "all" ? "All ratings" : `${option} stars`}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm font-semibold text-muted">
        Showing {visibleReviews.length ? (page - 1) * REVIEWS_PER_PAGE + 1 : 0}-{Math.min(page * REVIEWS_PER_PAGE, filteredReviews.length)} of {filteredReviews.length} reviews
      </p>

      <div className="mt-6 grid gap-4">
        {visibleReviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-purple-100 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Rating value={review.rating} size="small" />
                <h3 className="mt-3 text-lg font-bold text-ink">{review.title}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {review.is_verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    <CheckCircle2 size={14} />
                    Verified
                  </span>
                ) : (
                  <BusinessVerifyForm email={email} businessToken={businessToken} companyId={companyId} companySlug={companySlug} reviewId={review.id} />
                )}
                {review.company_replies?.length ? (
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-trust-dark">Replied</span>
                ) : (
                  <span className="rounded-full bg-wash px-3 py-1 text-xs font-bold text-muted">Needs reply</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFlaggedReview(review);
                    setFlagReason(flagReasons[0]);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-purple-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-purple-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                >
                  <Flag size={14} />
                  Flag this review
                </button>
              </div>
            </div>
            <p className="mt-3 w-full whitespace-pre-line leading-7 text-muted">{review.content}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted">
              {review.reviewer_name} · {formatDate(review.created_at)}
            </p>

            {review.company_replies?.[0] ? (
              <div className="mt-4 rounded-xl bg-purple-50 p-4 text-sm leading-6 text-slate-700">
                <p className="font-bold text-trust-dark">Your reply</p>
                <p className="mt-1 whitespace-pre-line">{review.company_replies[0].reply}</p>
              </div>
            ) : null}

            <BusinessReplyForm email={email} businessToken={businessToken} companyId={companyId} companySlug={companySlug} reviewId={review.id} existingReply={review.company_replies?.[0]?.reply} />
          </article>
        ))}

        {!filteredReviews.length ? (
          <p className="rounded-xl bg-wash p-5 text-muted">
            {reviews.length ? "No reviews match this rating filter." : "No approved reviews yet."}
          </p>
        ) : null}
      </div>

      {filteredReviews.length > REVIEWS_PER_PAGE ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-full border border-purple-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {getPaginationItems(page, totalPages).map((item) =>
              typeof item === "number" ? (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  className={`h-10 min-w-10 rounded-full px-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${
                    page === item ? "bg-trust text-white" : "border border-purple-200 text-slate-700 hover:bg-purple-50"
                  }`}
                  aria-current={page === item ? "page" : undefined}
                >
                  {item}
                </button>
              ) : (
                <span key={item} className="px-1 text-sm font-bold text-muted">
                  ...
                </span>
              )
            )}
          </div>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-full border border-purple-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}

      {flaggedReview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="text-2xl font-bold text-ink">Flag this review</h3>
              <button
                type="button"
                onClick={() => setFlaggedReview(null)}
                className="rounded-full border border-purple-200 p-2 text-trust-dark hover:bg-purple-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                <X size={20} />
              </button>
            </div>
            <FlagReviewForm
              key={flaggedReview.id}
              email={email}
              businessToken={businessToken}
              companyId={companyId}
              companySlug={companySlug}
              review={flaggedReview}
              reason={flagReason}
              onReasonChange={setFlagReason}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
