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
      className="inline-flex items-center justify-center gap-2 rounded-full bg-trust px-5 py-3 font-bold text-white hover:bg-trust-dark disabled:opacity-70"
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
    <div className="overflow-x-auto rounded-2xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-ink">Preview</h3>
        <p className="text-sm font-semibold text-muted">{rows.length} rows ready to import</p>
      </div>
      <table className="mt-4 w-full min-w-[860px] text-left text-sm">
        <thead className="bg-wash text-ink">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((row, index) => (
            <tr key={index} className="border-t border-line">
              {headers.map((header) => (
                <td key={`${index}-${header}`} className="max-w-64 truncate px-3 py-2 text-muted">
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

type ScreenshotState = {
  loading: Record<string, boolean>;
  errors: Record<string, string>;
  success: Record<string, string>;
  bulkMessage: string;
  bulkProgress: string;
};

const screenshotPageSize = 5;
const screenshotRequestTimeoutMs = 30_000;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function ScreenshotManager({ password, companies }: { password: string; companies: Company[] }) {
  const [companyRows, setCompanyRows] = useState(companies);
  const [state, setState] = useState<ScreenshotState>({ loading: {}, errors: {}, success: {}, bulkMessage: "", bulkProgress: "" });
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredCompanies = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return companyRows;

    return companyRows.filter((company) =>
      `${company.name} ${company.slug} ${company.website}`.toLowerCase().includes(needle)
    );
  }, [companyRows, query]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / screenshotPageSize));
  const currentPage = Math.min(page, totalPages);
  const pageCompanies = filteredCompanies.slice((currentPage - 1) * screenshotPageSize, currentPage * screenshotPageSize);

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

  async function generateScreenshot(company: Company) {
    setState((current) => ({
      ...current,
      loading: { ...current.loading, [company.id]: true },
      errors: { ...current.errors, [company.id]: "" },
      success: { ...current.success, [company.id]: "" }
    }));

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), screenshotRequestTimeoutMs);

    try {
      const response = await fetch("/api/admin/generate-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id, password }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(await readErrorResponse(response));
      }

      const result = (await response.json()) as { success?: boolean; website_screenshot_url?: string; error?: string };

      if (!response.ok || !result.success || !result.website_screenshot_url) {
        throw new Error(result.error || "Screenshot generation failed");
      }

      setCompanyRows((rows) =>
        rows.map((row) => (row.id === company.id ? { ...row, website_screenshot_url: result.website_screenshot_url ?? null } : row))
      );
      setState((current) => ({
        ...current,
        success: { ...current.success, [company.id]: "Screenshot generated" }
      }));
      return { ok: true };
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "Screenshot generation timed out. Please try again or check the website URL."
          : error instanceof Error
            ? error.message
            : "Screenshot generation failed";
      setState((current) => ({
        ...current,
        errors: { ...current.errors, [company.id]: `Failed to generate screenshot for ${company.name}: ${message}` }
      }));
      return { ok: false };
    } finally {
      window.clearTimeout(timeout);
      setState((current) => ({
        ...current,
        loading: { ...current.loading, [company.id]: false }
      }));
    }
  }

  async function generateMissingScreenshots() {
    const targets = filteredCompanies
      .filter((company) => company.website && !company.website_screenshot_url)
      .sort((first, second) => Number(Boolean(first.logo_url)) - Number(Boolean(second.logo_url)))
      .slice(0, 5);

    setIsBulkLoading(true);
    setState((current) => ({ ...current, bulkMessage: "", bulkProgress: `Generating 0 / ${targets.length}` }));

    let successCount = 0;
    let failureCount = 0;

    for (let index = 0; index < targets.length; index += 1) {
      const company = targets[index];
      setState((current) => ({ ...current, bulkProgress: `Generating ${index + 1} / ${targets.length}` }));
      const result = await generateScreenshot(company);
      if (result.ok) successCount += 1;
      else failureCount += 1;
      await sleep(800);
    }

    setState((current) => ({
      ...current,
      bulkProgress: "",
      bulkMessage: `Finished. ${successCount} succeeded, ${failureCount} failed.`
    }));
    setIsBulkLoading(false);
  }

  const missingCount = filteredCompanies.filter((company) => company.website && !company.website_screenshot_url).length;
  const visibleErrors = Object.values(state.errors).filter(Boolean);
  const visibleSuccess = Object.values(state.success).filter(Boolean);

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Website screenshots</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Generate brand website screenshots once, store them in Supabase Storage, and reuse the permanent URL on public pages.
          </p>
        </div>
        <button
          type="button"
          onClick={generateMissingScreenshots}
          disabled={isBulkLoading || missingCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark disabled:opacity-60"
        >
          <ImageIcon size={16} />
          {isBulkLoading ? "Generating..." : "Generate missing screenshots"}
        </button>
      </div>

      <label className="mt-5 block">
        <span className="sr-only">Search brand, slug or website</span>
        <input
          value={query}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search brand, slug or website..."
          className="w-full rounded-xl border border-line px-4 py-3 text-sm text-ink outline-none transition focus:border-trust focus:ring-4 focus:ring-[#A855F7]/15 md:max-w-xl"
        />
      </label>

      {state.bulkProgress && <p className="mt-4 rounded-xl bg-wash p-3 text-sm font-semibold text-trust-dark">{state.bulkProgress}</p>}
      {state.bulkMessage && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">{state.bulkMessage}</p>}
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

      <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-wash text-ink">
            <tr>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageCompanies.map((company) => (
              <tr key={company.id} className="border-t border-line align-middle">
                <td className="px-4 py-3">
                  <p className="font-bold text-ink">{company.name}</p>
                  <p className="text-xs text-muted">{company.slug}</p>
                </td>
                <td className="max-w-[260px] truncate px-4 py-3 text-muted">{company.website}</td>
                <td className="px-4 py-3">
                  {company.website_screenshot_url ? (
                    <img
                      src={company.website_screenshot_url}
                      alt={`${company.name} website screenshot`}
                      className="h-16 w-28 rounded-lg border border-line object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm text-muted">No screenshot</span>
                  )}
                  {state.success[company.id] && <p className="mt-1 text-xs font-semibold text-trust-dark">{state.success[company.id]}</p>}
                  {state.errors[company.id] && <p className="mt-1 text-xs font-semibold text-red-600">{state.errors[company.id]}</p>}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => generateScreenshot(company)}
                    disabled={Boolean(state.loading[company.id]) || !company.website}
                    className="inline-flex rounded-full border border-line px-4 py-2 text-xs font-bold text-ink hover:border-trust hover:text-trust-dark disabled:opacity-60"
                  >
                    {state.loading[company.id] ? "Generating..." : company.website_screenshot_url ? "Regenerate screenshot" : "Generate screenshot"}
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
            className="rounded-full border border-line px-4 py-2 font-bold text-ink hover:border-trust hover:text-trust-dark disabled:opacity-50"
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
            className="rounded-full border border-line px-4 py-2 font-bold text-ink hover:border-trust hover:text-trust-dark disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function ManualBrandForm({ password }: { password: string }) {
  const [state, action] = useFormState(upsertCompanyFromAdmin, initialState);

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold text-ink">Add or update brand</h2>
      <form action={action} className="mt-5 grid gap-4">
        <input type="hidden" name="password" value={password} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Brand name</span>
            <input name="name" required className="rounded-xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Slug</span>
            <input name="slug" required className="rounded-xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Website</span>
            <input name="website" required type="url" className="rounded-xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Category</span>
            <input name="category" required className="rounded-xl border border-line px-4 py-3" />
          </label>
        </div>
        <label className="grid gap-2">
          <span className="font-semibold text-ink">Description</span>
          <textarea name="description" rows={4} className="rounded-xl border border-line px-4 py-3" />
        </label>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Logo URL optional</span>
            <input name="logo_url" type="url" className="rounded-xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Favicon URL optional</span>
            <input name="favicon_url" type="url" className="rounded-xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">OG Image URL optional</span>
            <input name="og_image_url" type="url" className="rounded-xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Cover Image URL optional</span>
            <input name="cover_image_url" type="url" className="rounded-xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Website Screenshot URL optional</span>
            <input name="website_screenshot_url" type="url" className="rounded-xl border border-line px-4 py-3" />
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
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(filename, template)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-ink hover:border-trust hover:text-trust-dark"
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
          <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="rounded-xl border border-line px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="font-semibold text-ink">CSV content</span>
          <textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            rows={8}
            className="rounded-xl border border-line px-4 py-3 font-mono text-sm"
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
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => downloadCsv("companies-template.csv", companiesTemplate)}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-trust-dark"
        >
          <Download size={16} />
          Download companies CSV template
        </button>
        <button
          type="button"
          onClick={() => downloadCsv("reviews-template.csv", reviewsTemplate)}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-trust-dark"
        >
          <Download size={16} />
          Download reviews CSV template
        </button>
      </div>

      <ManualBrandForm password={password} />

      <ScreenshotManager password={password} companies={companies} />

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
