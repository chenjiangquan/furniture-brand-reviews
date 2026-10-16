"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export type SearchCompany = {
  id: string;
  name: string;
  slug: string;
  category?: string | null;
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<SearchCompany[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setMatches([]);
      setIsSearching(false);
      setSearchFailed(false);
      return;
    }

    setMatches([]);
    setIsSearching(true);
    setSearchFailed(false);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/companies/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: "no-store"
        });
        if (!response.ok) throw new Error("Company search failed");
        const result = (await response.json()) as { companies: SearchCompany[] };
        setMatches(result.companies);
        setSearchFailed(false);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setMatches([]);
          setSearchFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

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
      {query.trim() && !isSearching && matches.length === 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-line bg-white shadow-card">
          <div className="grid gap-3 px-5 py-5 text-left">
            <div>
              <p className="font-bold text-ink">
                {searchFailed ? "Search is temporarily unavailable" : `“${query.trim()}” isn’t listed yet`}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {searchFailed
                  ? "Please try again in a moment."
                  : `Add a review for ${query.trim()} and help other furniture shoppers compare brands before they buy.`}
              </p>
            </div>
            {!searchFailed && (
              <Link
                href={`/write-review?brand=${encodeURIComponent(query.trim())}`}
                className="inline-flex w-fit rounded-full bg-trust px-4 py-2 text-sm font-bold text-white hover:bg-trust-dark"
              >
                Write the first review
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
