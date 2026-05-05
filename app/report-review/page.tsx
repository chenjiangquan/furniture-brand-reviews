import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report a Review",
  description: "Report a furniture brand review for moderation."
};

export default function ReportReviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Report a review</h1>
      <p className="mt-5 text-lg leading-8 text-muted">If a review appears fake, abusive or includes private information, email report@furniturebrandreviews.co.uk with the review link and reason for reporting.</p>
    </div>
  );
}
