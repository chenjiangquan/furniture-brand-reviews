import type { Metadata } from "next";
import { EmbedWidgetTool } from "@/components/EmbedWidgetTool";
import { getCompanies } from "@/lib/data";

export const metadata: Metadata = {
  title: "Embed Widget",
  description: "Generate Furniture Brand Reviews widget embed code for brand profiles."
};

export default async function AdminEmbedPage({ searchParams }: { searchParams: { password?: string } }) {
  const password = searchParams.password ?? "";
  const isAllowed = Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);

  if (!isAllowed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-10">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Embed Widget</h1>
        <p className="mt-3 leading-7 text-muted">Enter the admin password to generate brand widget embed codes.</p>
        <form className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Admin password</span>
            <input name="password" type="password" className="rounded-xl border border-line px-4 py-3" />
          </label>
          <button className="rounded-full bg-ink px-5 py-3 font-bold text-white">Open embed tool</button>
        </form>
      </div>
    );
  }

  const companies = await getCompanies();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-10">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Embed Widget</h1>
        <p className="mt-3 leading-7 text-muted">
          Generate a lightweight review carousel widget that businesses can embed on external websites.
        </p>
      </div>
      <div className="mt-8">
        <EmbedWidgetTool companies={companies} />
      </div>
    </div>
  );
}
