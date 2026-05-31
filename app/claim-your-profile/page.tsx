import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { ClaimBrandSearchSelect } from "@/components/ClaimBrandSearchSelect";
import { submitBusinessClaim } from "@/lib/actions";
import { getCompanies } from "@/lib/data";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Claim your profile",
  "Learn how furniture companies can claim a profile on Furniture Brand Reviews to manage brand information and customer reviews."
);

export default async function ClaimYourProfilePage({ searchParams }: { searchParams?: { submitted?: string; error?: string } }) {
  const companies = await getCompanies();

  return (
    <InfoPage
      title="Claim your profile"
      subtitle="Furniture companies will be able to claim profiles, improve brand information and respond to customer feedback."
      sections={[
        {
          title: "What claiming can help with",
          bullets: [
            "Add or improve company information on your brand profile.",
            "Respond to reviews and customer feedback.",
            "Build trust with furniture shoppers.",
            "Understand recurring customer themes about delivery, product quality and service."
          ]
        },
        {
          title: "Claim requests",
          body: (
            <div className="grid gap-5">
              {searchParams?.submitted ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800">
                  Claim request submitted. We will check it before enabling dashboard access.
                </div>
              ) : null}
              {searchParams?.error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                  Could not submit this claim. Please check the required fields and try again.
                </div>
              ) : null}
              <p>
                Submit a claim request for admin review. New claims are saved as pending and are not approved automatically.
                Approved claims can access the business dashboard using the contact email below.
              </p>
              <form action={submitBusinessClaim} className="grid gap-4">
                <ClaimBrandSearchSelect
                  companies={companies.map((company) => ({
                    id: company.id,
                    name: company.name,
                    slug: company.slug,
                    website: company.website
                  }))}
                />
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">Brand name</span>
                  <input name="brandName" required className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">Brand website</span>
                  <input
                    name="website"
                    required
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-ink">Your name</span>
                    <input name="contactName" required className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-ink">Business email</span>
                    <input type="email" name="contactEmail" required className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                  </label>
                </div>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">Message optional</span>
                  <textarea name="message" className="min-h-[120px] w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </label>
                <button className="w-fit rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">
                  Submit claim request
                </button>
              </form>
            </div>
          )
        }
      ]}
    />
  );
}
