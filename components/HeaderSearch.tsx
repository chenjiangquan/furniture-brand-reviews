"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import type { Company } from "@/lib/types";

function getDomain(website: string) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

export function HeaderSearch({ companies }: { companies: Company[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isBrandProfilePage, setIsBrandProfilePage] = useState(false);

  useEffect(() => {
    function syncPathname() {
      setIsBrandProfilePage(/^\/review\/[^/]+$/.test(window.location.pathname));
    }

    syncPathname();
    window.addEventListener("popstate", syncPathname);

    return () => window.removeEventListener("popstate", syncPathname);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const matches = useMemo(() => {
    const needle = debouncedQuery.toLowerCase();
    if (!needle) return [];

    return companies
      .filter((company) => `${company.name} ${company.category} ${company.website}`.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [companies, debouncedQuery]);

  useEffect(() => {
    setActiveIndex(0);
    setIsOpen(Boolean(debouncedQuery));
  }, [debouncedQuery]);

  if (!isBrandProfilePage) return null;

  function goToCompany(company?: Company) {
    if (!company) return;
    setIsOpen(false);
    setQuery("");
    window.location.href = `/review/${company.slug}`;
  }

  return (
    <div ref={rootRef} className="relative order-last w-full lg:order-none lg:mx-8 lg:max-w-[520px] lg:flex-1">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              return;
            }

            if (!isOpen || matches.length === 0) return;

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((current) => (current + 1) % matches.length);
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) => (current - 1 + matches.length) % matches.length);
            }

            if (event.key === "Enter") {
              event.preventDefault();
              goToCompany(matches[activeIndex]);
            }
          }}
          placeholder="Search for another company..."
          className="h-12 w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-trust focus:ring-4 focus:ring-[#A855F7]/15"
        />
      </label>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          {matches.length > 0 ? (
            matches.map((company, index) => (
              <button
                key={company.id}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => goToCompany(company)}
                className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-b-0 ${
                  activeIndex === index ? "bg-wash" : "bg-white hover:bg-wash"
                }`}
              >
                <CompanyLogo name={company.name} logoUrl={company.logo_url ?? company.cover_image_url ?? company.og_image_url ?? company.website_screenshot_url} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">{company.name}</span>
                  <span className="block truncate text-xs text-muted">{getDomain(company.website)}</span>
                </span>
                <span className="shrink-0 text-right text-xs font-semibold text-muted">
                  <span className="block text-ink">{company.average_rating.toFixed(1)}</span>
                  <span>{company.review_count} reviews</span>
                </span>
              </button>
            ))
          ) : (
            <div className="px-5 py-4 text-sm font-semibold text-muted">No companies found</div>
          )}
        </div>
      )}
    </div>
  );
}
