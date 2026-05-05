import type { Metadata } from "next";
import { AdminImportForm } from "@/components/AdminImportForm";

export const metadata: Metadata = {
  title: "Admin CSV Import",
  description: "Import furniture brand profiles and reviews."
};

export default function AdminImportPage({ searchParams }: { searchParams: { password?: string } }) {
  const password = searchParams.password ?? "";
  const isAllowed = Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);

  if (!isAllowed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Admin CSV import</h1>
        <form className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Admin password</span>
            <input name="password" type="password" className="rounded-xl border border-line px-4 py-3" />
          </label>
          <button className="rounded-full bg-ink px-5 py-3 font-bold text-white">Open import tool</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Admin CSV import</h1>
        <p className="mt-3 leading-7 text-muted">
          Upload CSV files to create or update brand profiles and import reviews. Reviews are matched to companies by
          <span className="font-semibold text-ink"> company_slug</span>.
        </p>
      </div>
      <div className="mt-8">
        <AdminImportForm initialPassword={password} />
      </div>
    </div>
  );
}
