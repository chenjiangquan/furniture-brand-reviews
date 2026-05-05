import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/ReviewForm";
import { getCompanyBySlug } from "@/lib/data";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug);
  return {
    title: company ? `Write a Review for ${company.name}` : "Write a Review",
    description: "Submit a furniture brand review for moderation."
  };
}

export default async function WriteReviewPage({ params }: Props) {
  const company = await getCompanyBySlug(params.slug);
  if (!company) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Write a review for {company.name}</h1>
      <p className="mt-3 text-muted">Reviews are checked before publishing. Please share a fair, honest account of your experience.</p>
      <div className="mt-8">
        <ReviewForm slug={company.slug} />
      </div>
    </div>
  );
}
