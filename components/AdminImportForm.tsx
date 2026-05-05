"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Upload } from "lucide-react";
import { importCsv, type ImportState } from "@/lib/actions";
import { parseCsv } from "@/lib/csv";

const initialState: ImportState = {
  ok: false,
  message: "",
  successCount: 0,
  failureCount: 0,
  errors: []
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-trust px-5 py-3 font-bold text-white hover:bg-trust-dark disabled:opacity-70"
    >
      <Upload size={17} />
      {pending ? "Importing..." : "Import CSV"}
    </button>
  );
}

export function AdminImportForm({ initialPassword = "" }: { initialPassword?: string }) {
  const [state, action] = useFormState(importCsv, initialState);
  const [csvText, setCsvText] = useState("");
  const [importType, setImportType] = useState("companies");
  const previewRows = useMemo(() => parseCsv(csvText).slice(0, 8), [csvText]);
  const headers = previewRows[0] ? Object.keys(previewRows[0]) : [];

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCsvText(await file.text());
  }

  return (
    <div className="grid gap-6">
      <form action={action} className="grid gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Admin password</span>
            <input name="password" type="password" required defaultValue={initialPassword} className="rounded-xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Import type</span>
            <select
              name="importType"
              value={importType}
              onChange={(event) => setImportType(event.target.value)}
              className="rounded-xl border border-line px-4 py-3"
            >
              <option value="companies">Companies</option>
              <option value="reviews">Reviews</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Default review status</span>
            <select name="defaultStatus" disabled={importType !== "reviews"} className="rounded-xl border border-line px-4 py-3 disabled:bg-wash">
              <option value="pending">pending</option>
              <option value="approved">approved</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="font-semibold text-ink">Upload CSV</span>
          <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="rounded-xl border border-line px-4 py-3" />
        </label>

        <label className="grid gap-2">
          <span className="font-semibold text-ink">CSV content</span>
          <textarea
            name="csvText"
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            rows={9}
            required
            className="rounded-xl border border-line px-4 py-3 font-mono text-sm"
            placeholder={
              importType === "companies"
                ? "name,slug,website,category,description,logo_url,favicon_url,og_image_url,cover_image_url"
                : "company_slug,rating,title,content,reviewer_name,reviewer_email,order_number,is_verified,status,created_at"
            }
          />
        </label>

        <SubmitButton />
      </form>

      {previewRows.length > 0 && (
        <section className="overflow-x-auto rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-ink">Preview</h2>
          <table className="mt-4 w-full min-w-[760px] text-left text-sm">
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
              {previewRows.map((row, index) => (
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
        </section>
      )}

      {state.message && (
        <section className={`rounded-2xl border p-5 ${state.ok ? "border-line bg-wash text-trust-dark" : "border-red-200 bg-red-50 text-red-700"}`}>
          <p className="font-bold">{state.message}</p>
          {state.errors.length > 0 && (
            <ul className="mt-3 grid gap-2 text-sm">
              {state.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
