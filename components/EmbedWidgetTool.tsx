"use client";

import { useMemo, useState } from "react";
import type { Company } from "@/lib/types";

const widgetOrigin = "https://www.furniturebrandreviews.com";

export function EmbedWidgetTool({ companies }: { companies: Company[] }) {
  const [brandSlug, setBrandSlug] = useState(companies[0]?.slug ?? "");
  const [layout, setLayout] = useState("carousel");
  const [copied, setCopied] = useState(false);

  const embedCode = useMemo(
    () =>
      `<div class="fbr-widget" data-brand="${brandSlug}" data-layout="${layout}"></div>\n<script async src="${widgetOrigin}/widget.js"></script>`,
    [brandSlug, layout]
  );

  async function copyEmbedCode() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="grid gap-6 rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-semibold text-ink">Brand</span>
          <select
            value={brandSlug}
            onChange={(event) => setBrandSlug(event.target.value)}
            className="h-12 rounded-xl border border-line bg-white px-4 text-ink outline-none focus:border-trust"
          >
            {companies.map((company) => (
              <option key={company.id} value={company.slug}>
                {company.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="font-semibold text-ink">Layout</span>
          <select
            value={layout}
            onChange={(event) => setLayout(event.target.value)}
            className="h-12 rounded-xl border border-line bg-white px-4 text-ink outline-none focus:border-trust"
          >
            <option value="carousel">Carousel</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="font-semibold text-ink">Embed code</span>
        <textarea
          readOnly
          value={embedCode}
          rows={4}
          className="w-full rounded-xl border border-line bg-wash p-4 font-mono text-sm leading-6 text-ink outline-none"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copyEmbedCode}
          className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark"
        >
          {copied ? "Copied" : "Copy embed code"}
        </button>
        <p className="text-sm text-muted">Paste this code where you want the review widget to appear.</p>
      </div>

      <div className="rounded-xl border border-line bg-wash p-4">
        <p className="text-sm font-bold text-ink">Preview note</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          The widget loads approved public reviews from Furniture Brand Reviews and works on external websites through
          the public widget API.
        </p>
      </div>
    </div>
  );
}
