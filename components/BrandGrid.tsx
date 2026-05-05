"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BrandCard } from "@/components/BrandCard";
import type { Company } from "@/lib/types";

export function BrandGrid({ companies }: { companies: Company[] }) {
  const [query, setQuery] = useState("");
  const filteredCompanies = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return companies;
    return companies.filter((company) =>
      `${company.name} ${company.category} ${company.website}`.toLowerCase().includes(trimmed)
    );
  }, [companies, query]);

  return (
    <>
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-sm">
        <Search size={20} className="text-trust" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search or filter furniture brands"
          className="w-full outline-none placeholder:text-muted"
        />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <BrandCard key={company.id} company={company} />
        ))}
        {filteredCompanies.length === 0 && (
          <p className="rounded-2xl border border-line p-5 text-muted md:col-span-2 lg:col-span-3">
            No furniture brands match your search.
          </p>
        )}
      </div>
    </>
  );
}
