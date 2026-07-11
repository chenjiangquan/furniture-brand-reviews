import { redirect } from "next/navigation";

export default function BusinessWidgetsPage({ searchParams }: { searchParams?: { email?: string; token?: string; company?: string } }) {
  const params = new URLSearchParams({
    ...(searchParams?.email ? { email: searchParams.email } : {}),
    ...(searchParams?.token ? { token: searchParams.token } : {}),
    ...(searchParams?.company ? { company: searchParams.company } : {})
  });

  redirect(`/business/dashboard?${params.toString()}#widgets`);
}
