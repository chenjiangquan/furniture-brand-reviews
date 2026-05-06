import type { Metadata } from "next";
import Link from "next/link";
import { AdminTools } from "@/components/AdminTools";
import { getCompanies } from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin Tools",
  description: "Manage furniture brand profiles and review imports."
};

export default async function AdminToolsPage({ searchParams }: { searchParams: { password?: string } }) {
  const password = searchParams.password ?? "";
  const isAllowed = Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);

  if (!isAllowed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-10">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Admin tools</h1>
        <p className="mt-3 leading-7 text-muted">Enter the admin password to manage brand profiles and review imports.</p>
        <form className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Admin password</span>
            <input name="password" type="password" className="rounded-xl border border-line px-4 py-3" />
          </label>
          <button className="rounded-full bg-ink px-5 py-3 font-bold text-white">Open admin tools</button>
        </form>
      </div>
    );
  }

  const companies = await getCompanies();

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Admin tools</h1>
        <p className="mt-3 leading-7 text-muted">
          Add brand profiles, upload company CSV files and import reviews for moderated publishing.
        </p>
        <Link
          href={`/admin/embed?password=${encodeURIComponent(password)}`}
          className="mt-5 inline-flex rounded-full border border-line px-5 py-3 text-sm font-bold text-ink hover:border-trust hover:text-trust-dark"
        >
          Embed Widget
        </Link>
      </div>
      <div className="mt-8">
        <AdminTools password={password} companies={companies} />
      </div>
    </div>
  );
}
