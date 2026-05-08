"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Download, Image as ImageIcon, Save, Upload } from "lucide-react";
import {
  importCompaniesFromAdmin,
  importReviewsFromAdmin,
  upsertCompanyFromAdmin,
  type ImportState
} from "@/lib/actions";
import { parseCsv } from "@/lib/csv";
import type { Company } from "@/lib/types";

const initialState: ImportState = {
  ok: false,
  message: "",
  successCount: 0,
  failureCount: 0,
  errors: []
};

const companiesTemplate = "name,slug,website,category,description,logo_url,favicon_url,og_image_url,cover_image_url,website_screenshot_url\n";
const reviewsTemplate =
  "company_slug,rating,title,content,reviewer_name,reviewer_email,order_number,proof_image_url,is_verified,status,created_at\n";
const cardClass = "rounded-2xl border border-purple-100 bg-white p-6 shadow-sm";
const inputClass =
  "w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-200";
const textareaClass =
  "min-h-[120px] w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-200";
const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-purple-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50";

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ResultBox({ state }: { state: ImportState }) {
  if (!state.message) return null;

  return (
    <div className={`rounded-2xl border p-4 ${state.ok ? "border-line bg-wash text-trust-dark" : "border-red-200 bg-red-50 text-red-700"}`}>
      <p className="font-bold">{state.message}</p>
      {state.errors.length > 0 && (
        <ul className="mt-3 grid gap-2 text-sm">
          {state.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SubmitButton({ label, pendingLabel, icon }: { label: string; pendingLabel: string; icon: "save" | "upload" }) {
  const { pending } = useFormStatus();
  const Icon = icon === "save" ? Save : Upload;

  return (
    <button
      type="submit"
      disabled={pending}
      className={primaryButtonClass}
    >
      <Icon size={17} />
      {pending ? pendingLabel : label}
    </button>
  );
}

function PreviewTable({ rows }: { rows: Record<string, string>[] }) {
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-ink">Preview</h3>
        <p className="text-sm font-semibold text-muted">{rows.length} rows ready to import</p>
      </div>
      <table className="mt-4 w-full min-w-[860px] border-collapse text-sm">
        <thead className="bg-purple-50">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={`${index}-${header}`} className="max-w-64 truncate border-t border-purple-100 px-4 py-3 text-slate-600">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 10 && <p className="mt-3 text-sm text-muted">Showing first 10 rows only.</p>}
    </div>
  );
}

type BrandImageState = {
  loading: Record<string, boolean>;
  errors: Record<string, string>;
  success: Record<string, string>;
};

const brandImagePageSize = 5;
const brandImageUploadTimeoutMs = 60_000;
const maxBrandImageSize = 5 * 1024 * 1024;

function getCompanyImageUrl(company: Company) {
  return company.logo_url ?? company.cover_image_url ?? company.og_image_url ?? company.website_screenshot_url ?? null;
}

function BrandImageManager({ password, companies }: { password: string; companies: Company[] }) {
  const [companyRows, setCompanyRows] = useState(companies);
  const [state, setState] = useState<BrandImageState>({ loading: {}, errors: {}, success: {} });
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredCompanies = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return companyRows;

    return companyRows.filter((company) =>
      `${company.name} ${company.slug} ${company.website}`.toLowerCase().includes(needle)
    );
  }, [companyRows, query]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / brandImagePageSize));
  const currentPage = Math.min(page, totalPages);
  const pageCompanies = filteredCompanies.slice((currentPage - 1) * brandImagePageSize, currentPage * brandImagePageSize);

  function handleSearchChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  async function readErrorResponse(response: Response) {
    const text = await response.text();
    if (!text) return `Request failed with status ${response.status}`;

    try {
      const json = JSON.parse(text) as { error?: string };
      return json.error || text;
    } catch {
      return text;
    }
  }

  function handleFileChange(companyId: string, file?: File) {
    setState((current) => ({
      ...current,
      errors: { ...current.errors, [companyId]: "" },
      success: { ...current.success, [companyId]: "" }
    }));
    setSelectedFiles((current) => ({ ...current, [companyId]: file ?? null }));
  }

  async function uploadBrandImage(company: Company) {
    const file = selectedFiles[company.id];
    if (!file) {
      setState((current) => ({
        ...current,
        errors: { ...current.errors, [company.id]: `Please choose an image for ${company.name}.` }
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setState((current) => ({
        ...current,
        errors: { ...current.errors, [company.id]: `Failed to upload image for ${company.name}: only image files are allowed.` }
      }));
      return;
    }

    if (file.size > maxBrandImageSize) {
      setState((current) => ({
        ...current,
        errors: { ...current.errors, [company.id]: `Failed to upload image for ${company.name}: image must be 5MB or smaller.` }
      }));
      return;
    }

    setState((current) => ({
      ...current,
      loading: { ...current.loading, [company.id]: true },
      errors: { ...current.errors, [company.id]: "" },
      success: { ...current.success, [company.id]: "" }
    }));

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), brandImageUploadTimeoutMs);

    try {
      const formData = new FormData();
      formData.append("companyId", company.id);
      formData.append("password", password);
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-brand-image", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(await readErrorResponse(response));
      }

      const result = (await response.json()) as { success?: boolean; logo_url?: string; error?: string };

      if (!response.ok || !result.success || !result.logo_url) {
        throw new Error(result.error || "Brand image upload failed");
      }

      setCompanyRows((rows) => rows.map((row) => (row.id === company.id ? { ...row, logo_url: result.logo_url ?? null } : row)));
      setSelectedFiles((current) => ({ ...current, [company.id]: null }));
      setState((current) => ({
        ...current,
        success: { ...current.success, [company.id]: "Logo uploaded" }
      }));
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "Image upload timed out. Please try again."
          : error instanceof Error
            ? error.message
            : "Brand image upload failed";
      setState((current) => ({
        ...current,
        errors: { ...current.errors, [company.id]: `Failed to upload image for ${company.name}: ${message}` }
      }));
    } finally {
      window.clearTimeout(timeout);
      setState((current) => ({
        ...current,
        loading: { ...current.loading, [company.id]: false }
      }));
    }
  }

  const visibleErrors = Object.values(state.errors).filter(Boolean);
  const visibleSuccess = Object.values(state.success).filter(Boolean);

  return (
    <section className={cardClass}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Brand images</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Upload brand logos or profile images once, store them in Supabase Storage, and reuse the permanent URL on public pages.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-slate-700">
          <ImageIcon size={16} />
          Manual upload
        </div>
      </div>

      <label className="mt-5 block">
        <span className="sr-only">Search brand, slug or website</span>
        <input
          value={query}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search brand, slug or website..."
          className={`${inputClass} md:max-w-xl`}
        />
      </label>

      {visibleErrors.length > 0 && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
          {visibleErrors.slice(-3).map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}
      {visibleSuccess.length > 0 && (
        <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
          {visibleSuccess.slice(-3).map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead className="bg-purple-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">Website</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">Current logo</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">Upload brand image</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageCompanies.map((company) => (
              <tr key={company.id} className="align-middle transition hover:bg-wash/50">
                <td className="border-t border-purple-100 px-4 py-3">
                  <p className="font-bold text-ink">{company.name}</p>
                  <p className="text-xs text-muted">{company.slug}</p>
                </td>
                <td className="max-w-[260px] truncate border-t border-purple-100 px-4 py-3 text-muted">{company.website}</td>
                <td className="border-t border-purple-100 px-4 py-3">
                  {getCompanyImageUrl(company) ? (
                    <img
                      src={getCompanyImageUrl(company) ?? ""}
                      alt={`${company.name} brand image`}
                      className="h-16 w-28 rounded-lg border border-line object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm text-muted">No image</span>
                  )}
                  {state.success[company.id] && <p className="mt-1 text-xs font-semibold text-trust-dark">{state.success[company.id]}</p>}
                  {state.errors[company.id] && <p className="mt-1 text-xs font-semibold text-red-600">{state.errors[company.id]}</p>}
                </td>
                <td className="border-t border-purple-100 px-4 py-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleFileChange(company.id, event.target.files?.[0])}
                    className="block w-full max-w-[260px] rounded-xl border border-purple-100 bg-white px-3 py-2 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-purple-100"
                  />
                </td>
                <td className="border-t border-purple-100 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => uploadBrandImage(company)}
                    disabled={Boolean(state.loading[company.id]) || !selectedFiles[company.id]}
                    className={secondaryButtonClass}
                  >
                    {state.loading[company.id] ? "Uploading..." : "Upload logo"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="font-semibold text-muted">{filteredCompanies.length} brands</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={currentPage === 1}
            className={secondaryButtonClass}
          >
            Previous
          </button>
          <span className="font-semibold text-muted">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={currentPage === totalPages}
            className={secondaryButtonClass}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function ManualBrandForm({ password, companies }: { password: string; companies: Company[] }) {
  const [state, action] = useFormState(upsertCompanyFromAdmin, initialState);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const selectedCompany = useMemo(
    () => companies.find((company) => company.slug === selectedSlug) ?? null,
    [companies, selectedSlug]
  );
  const filteredBrandOptions = useMemo(() => {
    const needle = brandSearch.trim().toLowerCase();
    if (!needle) return companies;

    return companies.filter((company) =>
      `${company.name} ${company.slug} ${company.website}`.toLowerCase().includes(needle)
    );
  }, [brandSearch, companies]);

  return (
    <section className={cardClass}>
      <h2 className="text-2xl font-bold text-ink">Add or update brand</h2>
      <label className="mt-5 grid gap-2">
        <span className="font-semibold text-ink">Edit existing brand</span>
        <input
          value={brandSearch}
          onChange={(event) => setBrandSearch(event.target.value)}
          placeholder="Search brand by name, slug or website..."
          className={inputClass}
        />
        <select
          value={selectedSlug}
          onChange={(event) => setSelectedSlug(event.target.value)}
          className={inputClass}
        >
          <option value="">Create a new brand</option>
          {selectedCompany && !filteredBrandOptions.some((company) => company.slug === selectedCompany.slug) && (
            <option value={selectedCompany.slug}>
              {selectedCompany.name} ({selectedCompany.slug})
            </option>
          )}
          {filteredBrandOptions.map((company) => (
            <option key={company.id} value={company.slug}>
              {company.name} ({company.slug})
            </option>
          ))}
        </select>
        {brandSearch.trim() && filteredBrandOptions.length === 0 && (
          <p className="text-sm font-semibold text-muted">No matching brands found.</p>
        )}
      </label>
      <form key={selectedCompany?.id ?? "new-brand"} action={action} className="mt-5 grid gap-4">
        <input type="hidden" name="password" value={password} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Brand name</span>
            <input name="name" required defaultValue={selectedCompany?.name ?? ""} className={inputClass} />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Slug</span>
            <input name="slug" required defaultValue={selectedCompany?.slug ?? ""} className={inputClass} />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Website</span>
            <input name="website" required type="url" defaultValue={selectedCompany?.website ?? ""} className={inputClass} />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Category</span>
            <input name="category" required defaultValue={selectedCompany?.category ?? ""} className={inputClass} />
          </label>
        </div>
        <label className="grid gap-2">
          <span className="font-semibold text-ink">Description</span>
          <textarea name="description" rows={4} defaultValue={selectedCompany?.description ?? ""} className={textareaClass} />
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="is_claimed"
            defaultChecked={Boolean(selectedCompany?.is_claimed)}
            className="h-4 w-4 rounded border-purple-200 text-purple-700 focus:ring-2 focus:ring-purple-200"
          />
          Claimed business
        </label>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Logo URL optional</span>
            <input name="logo_url" type="url" defaultValue={selectedCompany?.logo_url ?? ""} className={inputClass} />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Favicon URL optional</span>
            <input name="favicon_url" type="url" defaultValue={selectedCompany?.favicon_url ?? ""} className={inputClass} />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">OG Image URL optional</span>
            <input name="og_image_url" type="url" defaultValue={selectedCompany?.og_image_url ?? ""} className={inputClass} />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Cover Image URL optional</span>
            <input name="cover_image_url" type="url" defaultValue={selectedCompany?.cover_image_url ?? ""} className={inputClass} />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Website Screenshot URL optional</span>
            <input name="website_screenshot_url" type="url" defaultValue={selectedCompany?.website_screenshot_url ?? ""} className={inputClass} />
          </label>
        </div>
        <div>
          <SubmitButton label="Save brand" pendingLabel="Saving..." icon="save" />
        </div>
      </form>
      <div className="mt-4">
        <ResultBox state={state} />
      </div>
    </section>
  );
}

function CsvImportSection({
  title,
  description,
  password,
  template,
  filename,
  action
}: {
  title: string;
  description: string;
  password: string;
  template: string;
  filename: string;
  action: typeof importCompaniesFromAdmin;
}) {
  const [state, formAction] = useFormState(action, initialState);
  const [csvText, setCsvText] = useState("");
  const rows = useMemo(() => parseCsv(csvText), [csvText]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCsvText(await file.text());
  }

  return (
    <section className={cardClass}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(filename, template)}
          className={secondaryButtonClass}
        >
          <Download size={16} />
          Download template
        </button>
      </div>

      <form action={formAction} className="mt-5 grid gap-4">
        <input type="hidden" name="password" value={password} />
        <input type="hidden" name="csvText" value={csvText} />
        <label className="grid gap-2">
          <span className="font-semibold text-ink">Upload CSV</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full max-w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-purple-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-purple-100"
          />
        </label>
        <label className="grid gap-2">
          <span className="font-semibold text-ink">CSV content</span>
          <textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            rows={8}
            className={`${textareaClass} font-mono`}
            placeholder={template.trim()}
          />
        </label>
        <PreviewTable rows={rows} />
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton label="Confirm Import" pendingLabel="Importing..." icon="upload" />
          <span className="text-sm font-semibold text-muted">{rows.length} rows in preview</span>
        </div>
      </form>

      <div className="mt-4">
        <ResultBox state={state} />
      </div>
    </section>
  );
}

export function AdminTools({ password, companies }: { password: string; companies: Company[] }) {
  return (
    <div className="space-y-8 text-ink">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => downloadCsv("companies-template.csv", companiesTemplate)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-trust-dark"
        >
          <Download size={16} />
          Download companies CSV template
        </button>
        <button
          type="button"
          onClick={() => downloadCsv("reviews-template.csv", reviewsTemplate)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-trust-dark"
        >
          <Download size={16} />
          Download reviews CSV template
        </button>
      </div>

      <ManualBrandForm password={password} companies={companies} />

      <BrandImageManager password={password} companies={companies} />

      <CsvImportSection
        title="Import brand profiles CSV"
        description="Upsert companies by slug. Existing slugs are updated instead of duplicated."
        password={password}
        template={companiesTemplate}
        filename="companies-template.csv"
        action={importCompaniesFromAdmin}
      />

      <CsvImportSection
        title="Import reviews CSV"
        description="Reviews are matched to companies by company_slug. Approved reviews appear publicly after import."
        password={password}
        template={reviewsTemplate}
        filename="reviews-template.csv"
        action={importReviewsFromAdmin}
      />
    </div>
  );
}
