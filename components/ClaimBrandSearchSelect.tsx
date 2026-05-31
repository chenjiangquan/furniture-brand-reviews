"use client";

import { useMemo, useState } from "react";

type ClaimBrandOption = {
  id: string;
  name: string;
  slug: string;
  website?: string | null;
};

export function ClaimBrandSearchSelect({ companies }: { companies: ClaimBrandOption[] }) {
  const [query, setQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return companies.slice(0, 20);

    return companies
      .filter((company) => {
        const searchable = `${company.name} ${company.slug} ${company.website ?? ""}`.toLowerCase();
        return searchable.includes(normalizedQuery);
      })
      .slice(0, 20);
  }, [companies, query]);

  return (
    <div className="relative grid gap-3">
      <input type="hidden" name="companyId" value={selectedCompanyId} />
      <label className="grid gap-2">
        <span className="text-sm font-bold text-ink">Existing brand profile</span>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedCompanyId("");
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search brand by name, slug or website..."
          className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </label>

      {isOpen ? <div className="max-h-72 overflow-y-auto rounded-xl border border-purple-100 bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => {
            setSelectedCompanyId("");
            setIsOpen(false);
            setQuery("");
          }}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${
            selectedCompanyId === "" ? "bg-purple-50 text-trust-dark" : "text-slate-700 hover:bg-wash"
          }`}
        >
          <span>Not listed or not sure</span>
        </button>

        {filteredCompanies.map((company) => (
          <button
            key={company.id}
            type="button"
            onClick={() => {
              setSelectedCompanyId(company.id);
              setQuery(company.name);
              setIsOpen(false);
            }}
            className={`mt-1 flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm ${
              selectedCompanyId === company.id ? "bg-purple-50 text-trust-dark" : "text-slate-700 hover:bg-wash"
            }`}
          >
            <span>
              <span className="block font-bold">{company.name}</span>
              <span className="block text-xs text-muted">{company.website || company.slug}</span>
            </span>
            {selectedCompanyId === company.id ? <span className="text-xs font-bold">Selected</span> : null}
          </button>
        ))}

        {filteredCompanies.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted">No matching brands found. Leave it as not listed and submit the brand name below.</p>
        ) : null}
      </div> : null}

      {selectedCompanyId ? (
        <p className="text-xs font-bold text-trust-dark">Selected brand profile: {companies.find((company) => company.id === selectedCompanyId)?.name}</p>
      ) : (
        <p className="text-xs text-muted">If your brand is not listed, leave this unselected and fill in the brand name and website below.</p>
      )}
    </div>
  );
}
