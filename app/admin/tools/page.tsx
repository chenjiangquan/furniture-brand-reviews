import type { Metadata } from "next";
import Link from "next/link";
import { AdminTools } from "@/components/AdminTools";
import { getCompanies } from "@/lib/data";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Admin Tools",
  "Manage furniture brand profiles and review imports."
);

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
            <input
              name="password"
              type="password"
              className="rounded-xl border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-trust focus:ring-4 focus:ring-[#A855F7]/15"
            />
          </label>
          <button className="rounded-full bg-trust px-5 py-3 font-bold text-white transition hover:bg-trust-dark">
            Open admin tools
          </button>
        </form>
      </div>
    );
  }

  const companies = await getCompanies();

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-6 py-10">
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
      <div>
        <AdminTools password={password} companies={companies} />
      </div>
    </div>
  );
}
