"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Company } from "@/lib/types";

export function SearchBar({ companies }: { companies: Company[] }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return companies
      .filter((company) => `${company.name} ${company.category}`.toLowerCase().includes(trimmed))
      .slice(0, 5);
  }, [companies, query]);

  return (
    <div className="relative z-30 mx-auto max-w-2xl">
      <label className="flex min-h-16 items-center gap-3 rounded-full border border-line bg-white px-5 shadow-card">
        <Search className="shrink-0 text-trust" size={22} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a furniture brand"
          className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
        />
      </label>
      {matches.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          {matches.map((company) => (
            <Link
              key={company.id}
              href={`/review/${company.slug}`}
              className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 last:border-b-0 hover:bg-wash"
            >
              <span className="font-semibold text-ink">{company.name}</span>
              <span className="text-sm text-muted">{company.category}</span>
            </Link>
          ))}
        </div>
      )}
      {query.trim() && matches.length === 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-line bg-white shadow-card">
          <div className="grid gap-3 px-5 py-5 text-left">
            <div>
              <p className="font-bold text-ink">No reviews for “{query.trim()}” yet</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Be the first to review {query.trim()} and help other furniture shoppers compare brands before they buy.
              </p>
            </div>
            <Link
              href={`/write-review?brand=${encodeURIComponent(query.trim())}`}
              className="inline-flex w-fit rounded-full bg-trust px-4 py-2 text-sm font-bold text-white hover:bg-trust-dark"
            >
              Write the first review
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
