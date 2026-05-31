import { redirect } from "next/navigation";

export default function BusinessReviewsPage({ searchParams }: { searchParams?: { email?: string; company?: string } }) {
  const params = new URLSearchParams({
    ...(searchParams?.email ? { email: searchParams.email } : {}),
    ...(searchParams?.company ? { company: searchParams.company } : {})
  });

  redirect(`/business/dashboard?${params.toString()}#reviews`);
}
