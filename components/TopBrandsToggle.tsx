"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { RatingStars } from "@/components/RatingStars";
import type { Company } from "@/lib/types";

type Mode = "best" | "worst";

function sortCompanies(companies: Company[], mode: Mode) {
  return [...companies]
    .filter((company) => Number(company.review_count || 0) >= 10 && Number(company.average_rating || 0) > 0)
    .sort((first, second) => {
      const ratingSort =
        mode === "best"
          ? Number(second.average_rating || 0) - Number(first.average_rating || 0)
          : Number(first.average_rating || 0) - Number(second.average_rating || 0);
      return ratingSort || Number(second.review_count || 0) - Number(first.review_count || 0);
    })
    .slice(0, 10);
}

export function TopBrandsToggle({ companies }: { companies: Company[] }) {
  const [mode, setMode] = useState<Mode>("best");
  const visibleCompanies = useMemo(() => sortCompanies(companies, mode), [companies, mode]);

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-ink">
          {mode === "best" ? "Top 10 best furniture brands" : "Top 10 lowest rated furniture brands"}
        </h2>
        <div className="inline-flex w-fit rounded-full border border-line bg-white p-1 shadow-sm">
          {[
            { value: "best" as const, label: "Best brands" },
            { value: "worst" as const, label: "Worst brands" }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setMode(tab.value)}
              className={`rounded-full px-4 py-2 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-purple-300 ${
                mode === tab.value ? "bg-trust text-white" : "text-muted hover:bg-wash hover:text-trust-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {visibleCompanies.length > 0 ? (
        <>
        <div className="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-3 lg:hidden">
          {visibleCompanies.map((company, index) => (
            <Link
              key={company.id}
              href={`/review/${company.slug}`}
              className="flex min-h-[190px] min-w-[270px] snap-start flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-wash text-sm font-bold text-trust-dark ring-1 ring-line">
                    #{index + 1}
                  </span>
                  <CompanyLogo
                    name={company.name}
                    logoUrl={company.logo_url ?? company.cover_image_url ?? company.og_image_url ?? company.website_screenshot_url}
                    size="sm"
                  />
                </div>
                <h3 className="mt-4 line-clamp-2 text-base font-bold leading-snug text-ink">{company.name}</h3>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
                  Website <ExternalLink size={13} />
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <RatingStars rating={company.average_rating} size="small" />
                <span className="text-sm font-bold text-ink">{company.average_rating.toFixed(1)}</span>
                <span className="text-sm text-muted">({company.review_count})</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 hidden gap-3 lg:grid">
          {visibleCompanies.map((company, index) => (
            <article key={company.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-4 md:items-center">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-wash text-sm font-bold text-trust-dark ring-1 ring-line">
                    #{index + 1}
                  </span>
                  <CompanyLogo
                    name={company.name}
                    logoUrl={company.logo_url ?? company.cover_image_url ?? company.og_image_url ?? company.website_screenshot_url}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-ink">{company.name}</h3>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-muted hover:text-trust-dark"
                    >
                      Website <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <RatingStars rating={company.average_rating} size="small" />
                    <span className="font-bold text-ink">{company.average_rating.toFixed(1)}</span>
                    <span className="text-sm text-muted">· {company.review_count} reviews</span>
                  </div>
                  <Link
                    href={`/review/${company.slug}`}
                    className="inline-flex justify-center rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-trust-dark"
                  >
                    Read reviews
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
          <p className="font-bold text-ink">Not enough reviewed brands yet.</p>
        </div>
      )}
    </section>
  );
}
