import type { Metadata } from "next";
import { ReviewForm } from "@/components/ReviewForm";

export const metadata: Metadata = {
  title: "Write a Furniture Brand Review",
  description: "Submit a furniture brand review for moderation before publishing."
};

export default function WriteFirstReviewPage({ searchParams }: { searchParams: { brand?: string } }) {
  const brandName = (searchParams.brand ?? "").trim();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-10">
      <h1 className="text-4xl font-bold tracking-tight text-ink">
        {brandName ? `Write the first review for ${brandName}` : "Write a furniture brand review"}
      </h1>
      <p className="mt-3 leading-7 text-muted">
        Reviews are checked before publishing. If this brand is not listed yet, your pending review will help create the brand profile after admin approval.
      </p>
      <div className="mt-8">
        <ReviewForm brandName={brandName} />
      </div>
    </div>
  );
}
