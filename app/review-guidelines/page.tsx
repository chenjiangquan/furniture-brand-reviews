import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Guidelines",
  description: "Guidelines for submitting fair and useful furniture brand reviews."
};

export default function ReviewGuidelinesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Review guidelines</h1>
      <div className="mt-6 grid gap-4 text-muted">
        <p>Reviews should describe a genuine customer experience and avoid personal details, abusive language or claims that cannot be checked.</p>
        <p>New reviews are held as pending until moderation is complete. Approved reviews appear publicly; rejected reviews do not.</p>
      </div>
    </div>
  );
}
