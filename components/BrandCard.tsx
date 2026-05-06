import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Rating } from "@/components/Rating";
import type { Company } from "@/lib/types";

export function BrandCard({ company }: { company: Company }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CompanyLogo name={company.name} logoUrl={company.logo_url ?? company.website_screenshot_url ?? company.cover_image_url ?? company.og_image_url} size="sm" />
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
        <div className="max-w-full shrink-0">
          <Rating value={company.average_rating} />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-muted">{company.category}</p>
      <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{company.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-sm text-muted">{company.review_count} reviews</span>
        <Link
          href={`/review/${company.slug}`}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-trust-dark"
        >
          Read reviews
        </Link>
      </div>
    </article>
  );
}
