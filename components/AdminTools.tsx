"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Download, Save, Upload } from "lucide-react";
import {
  importCompaniesFromAdmin,
  importReviewsFromAdmin,
  upsertCompanyFromAdmin,
  type ImportState
} from "@/lib/actions";
import { parseCsv } from "@/lib/csv";

const initialState: ImportState = {
  ok: false,
  message: "",
  successCount: 0,
  failureCount: 0,
  errors: []
};

const companiesTemplate = "name,slug,website,category,description,logo_url,favicon_url,og_image_url,cover_image_url\n";
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

export function AdminTools({ password }: { password: string }) {
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
