import type { Metadata } from "next";
import { bulkRejectBusinessClaims, moderateBusinessClaim } from "@/lib/actions";
import { getAdminBusinessClaims } from "@/lib/business";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Admin Business Claims",
  "Approve or reject business profile claim requests."
);

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function AdminBusinessClaimsPage({
  searchParams
}: {
  searchParams: { password?: string; error?: string; success?: string };
}) {
  const password = searchParams.password ?? "";
  const claims = password ? await getAdminBusinessClaims(password) : [];
  const errorMessage = searchParams.error && searchParams.error !== "1" ? searchParams.error : null;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-trust-dark">Admin</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Business claim requests</h1>
          <p className="mt-2 text-muted">Approve claimed business access and send login details to the business contact.</p>
        </div>
        <a href={`/admin/reviews?password=${encodeURIComponent(password)}`} className="rounded-full border border-purple-200 px-5 py-3 text-sm font-bold text-trust-dark hover:bg-purple-50">
          Review approvals
        </a>
      </div>

      <form className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 sm:flex-row">
        <input
          name="password"
          type="password"
          defaultValue={password}
          placeholder="Admin password"
          className="min-h-12 flex-1 rounded-xl border border-line px-4"
        />
        <button className="rounded-full bg-ink px-5 py-3 font-bold text-white">View claims</button>
      </form>

      {searchParams.error === "1" && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Invalid admin password.</p>}
      {errorMessage && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Error: {errorMessage}</p>}
      {searchParams.success && <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">{searchParams.success}</p>}

      {password && claims.length > 0 ? (
        <form id="bulk-reject-claims" action={bulkRejectBusinessClaims} className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
          <input type="hidden" name="password" value={password} />
          <p className="text-sm font-semibold text-muted">Select claim requests below, then reject and remove them in one action.</p>
          <button className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
            Reject selected
          </button>
        </form>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
          <thead className="bg-wash text-ink">
            <tr>
              <th className="px-4 py-3">Select</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Matched profile</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="border-t border-line align-top">
                <td className="px-4 py-3">
                  <input
                    form="bulk-reject-claims"
                    type="checkbox"
                    name="claimIds"
                    value={claim.id}
                    className="h-4 w-4 rounded border-purple-200 text-trust focus:ring-purple-300"
                    aria-label={`Select claim request for ${claim.brand_name}`}
                  />
                </td>
                <td className="px-4 py-3 font-semibold text-ink">{claim.brand_name}</td>
                <td className="px-4 py-3">
                  {claim.companies ? (
                    <div>
                      <p className="font-semibold text-ink">{claim.companies.name}</p>
                      <p className="text-xs text-muted">{claim.companies.website}</p>
                    </div>
                  ) : (
                    <span className="text-red-700">No company_id matched</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{claim.contact_name}</p>
                  <p className="text-muted">{claim.contact_email}</p>
                </td>
                <td className="max-w-md whitespace-pre-wrap px-4 py-3 text-muted">{claim.message || "No message"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${claim.status === "approved" ? "bg-green-50 text-green-700" : claim.status === "rejected" ? "bg-red-50 text-red-700" : "bg-purple-50 text-trust-dark"}`}>
                    {claim.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(claim.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={moderateBusinessClaim}>
                      <input type="hidden" name="password" value={password} />
                      <input type="hidden" name="claimId" value={claim.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button
                        disabled={claim.status === "approved"}
                        className="rounded-full border border-green-200 px-3 py-2 font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={moderateBusinessClaim}>
                      <input type="hidden" name="password" value={password} />
                      <input type="hidden" name="claimId" value={claim.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button
                        disabled={claim.status === "rejected"}
                        className="rounded-full border border-red-200 px-3 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                  {!claim.company_id ? (
                    <p className="mt-2 text-xs text-trust-dark">Approving will create a new company profile, mark it claimed, and send dashboard login details.</p>
                  ) : null}
                </td>
              </tr>
            ))}
            {password && claims.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted">
                  No business claim requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
