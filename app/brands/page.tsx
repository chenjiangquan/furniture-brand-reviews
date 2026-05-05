import type { Metadata } from "next";
import { BrandGrid } from "@/components/BrandGrid";
import { getCompanies } from "@/lib/data";

export const metadata: Metadata = {
  title: "Furniture Brand Reviews",
  description: "Browse furniture brands worldwide by rating, category and review count."
};

export default async function BrandsPage() {
  const companies = await getCompanies();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Furniture Brand Reviews</h1>
      <BrandGrid companies={companies} />
    </div>
  );
}
