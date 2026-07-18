import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { sendBusinessReviewInvitation, updateBusinessPassword, updateBusinessProfile } from "@/lib/actions";
import { getBusinessCompanyByToken, getBusinessReviews } from "@/lib/business";
import { createNoIndexMetadata, siteUrl } from "@/lib/seo";
import { Rating } from "@/components/Rating";
import { BusinessReviewsManager } from "@/components/BusinessReviewsManager";

export const metadata: Metadata = createNoIndexMetadata(
  "Business dashboard",
  "Manage claimed brand profiles, review replies and customer review invitation links on Furniture Brand Reviews."
);

function dashboardUrl(email: string, token: string, company?: string) {
  const params = new URLSearchParams({ email, token, ...(company ? { company } : {}) });
  return `/business/dashboard?${params.toString()}`;
}

export default async function BusinessDashboardPage({
  searchParams
}: {
  searchParams?: { email?: string; token?: string; company?: string; success?: string; error?: string };
}) {
  const email = String(searchParams?.email ?? "").trim().toLowerCase();
  const businessToken = String(searchParams?.token ?? "").trim();

  if (!email || !businessToken) {
    return (
      <main className="mx-auto max-w-[960px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-purple-100 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-ink">Business dashboard</h1>
          <p className="mt-3 text-muted">Use a secure login link from your approved business email to access claimed brand tools.</p>
          <Link href="/business/login" className="mt-6 inline-flex rounded-full bg-trust px-5 py-3 font-bold text-white hover:bg-trust-dark">
            Business login
          </Link>
        </div>
      </main>
    );
  }

  const { companies, company } = await getBusinessCompanyByToken(email, businessToken, searchParams?.company);
  const reviews = company ? await getBusinessReviews(company.id) : [];
  const unansweredCount = reviews.filter((review) => !review.company_replies?.length).length;
  const reviewPageUrl = company ? `${siteUrl}/review/${company.slug}` : "";
  const writeReviewUrl = company ? `${siteUrl}/review/${company.slug}/write` : "";
  const carouselWidgetCode = company
    ? `<div class="fbr-widget" data-brand="${company.slug}" data-layout="carousel"></div>\n<script async src="${siteUrl}/widget.js"></script>`
    : "";
  const microWidgetCode = company
    ? `<div class="fbr-widget" data-brand="${company.slug}" data-layout="micro"></div>\n<script async src="${siteUrl}/widget.js"></script>`
    : "";

  if (!company) {
    return (
      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-purple-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-trust-dark">Business dashboard</p>
          <h1 className="mt-3 text-3xl font-bold text-ink">No approved brand claim found</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            We could not find an approved brand claim for <strong>{email}</strong>. Submit a claim request or ask an admin to approve the claim before using business tools.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/claim-your-profile" className="rounded-full bg-trust px-5 py-3 font-bold text-white hover:bg-trust-dark">
              Claim your profile
            </Link>
            <Link href={`/business/login?email=${encodeURIComponent(email)}`} className="rounded-full border border-purple-200 px-5 py-3 font-bold text-trust-dark hover:bg-purple-50">
              Request a new login link
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-wash">
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-purple-100 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-trust-dark">Claimed business tools</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">{company.name}</h1>
            <p className="mt-2 text-sm text-muted">Logged in as {email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {companies.length > 1 ? (
              <details className="relative">
                <summary className="cursor-pointer rounded-full border border-purple-200 bg-white px-4 py-3 text-sm font-bold text-ink hover:bg-purple-50">
                  Switch brand
                </summary>
                <div className="absolute right-0 z-10 mt-2 grid min-w-64 gap-1 rounded-2xl border border-purple-100 bg-white p-2 shadow-lg">
                {companies.map((item) => (
                  <Link
                    key={item.id}
                    href={dashboardUrl(email, businessToken, item.slug)}
                    className={`rounded-xl px-3 py-2 text-sm font-bold ${item.slug === company.slug ? "bg-purple-50 text-trust-dark" : "text-slate-700 hover:bg-wash"}`}
                  >
                    {item.name}
                  </Link>
                ))}
                </div>
              </details>
            ) : null}
            <Link href={`/review/${company.slug}`} className="inline-flex items-center gap-2 rounded-full border border-purple-200 px-5 py-3 text-sm font-bold text-trust-dark hover:bg-purple-50">
              View public profile <ExternalLink size={16} />
            </Link>
          </div>
        </div>

        {searchParams?.success ? <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800">{searchParams.success}</div> : null}
        {searchParams?.error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">{searchParams.error}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-purple-100 bg-white p-4 shadow-sm lg:sticky lg:top-6">
            <nav className="grid gap-2 text-sm font-bold">
              {["Overview", "Reviews", "Profile", "Password", "Invite customers", "Widgets"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-xl px-4 py-3 text-slate-700 hover:bg-purple-50 hover:text-trust-dark">
                  {item}
                </a>
              ))}
            </nav>
          </aside>

          <div className="grid gap-6">
            <section id="overview" className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-ink">Overview</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-wash p-5">
                  <p className="text-sm font-bold text-muted">Average rating</p>
                  <div className="mt-3">
                    <Rating value={Number(company.average_rating || 0)} size="medium" />
                  </div>
                </div>
                <div className="rounded-2xl bg-wash p-5">
                  <p className="text-sm font-bold text-muted">Published reviews</p>
                  <p className="mt-3 text-3xl font-bold text-ink">{company.review_count}</p>
                </div>
                <div className="rounded-2xl bg-wash p-5">
                  <p className="text-sm font-bold text-muted">Reviews without replies</p>
                  <p className="mt-3 text-3xl font-bold text-ink">{unansweredCount}</p>
                </div>
              </div>
            </section>

            <BusinessReviewsManager
              reviews={reviews}
              email={email}
              companyId={company.id}
              companySlug={company.slug}
              businessToken={businessToken}
              autoReplyEnabled={Boolean(company.auto_reply_enabled)}
              autoReplyTemplate={company.auto_reply_template ?? ""}
            />

            <section id="profile" className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-ink">Profile details</h2>
              <form action={updateBusinessProfile} className="mt-5 grid gap-4">
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="businessToken" value={businessToken} />
                <input type="hidden" name="companyId" value={company.id} />
                <input type="hidden" name="companySlug" value={company.slug} />
                <input type="hidden" name="existingLogoUrl" value={company.logo_url ?? ""} />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-ink">Website</span>
                    <input name="website" required defaultValue={company.website} className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-ink">Category</span>
                    <input name="category" required defaultValue={company.category} className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                  </label>
                </div>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">Description</span>
                  <textarea name="description" defaultValue={company.description ?? ""} className="min-h-[120px] w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </label>
                <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)] md:items-center">
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-purple-100 bg-wash">
                    {company.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={company.logo_url} alt={`${company.name} logo`} className="h-full w-full object-contain p-3" />
                    ) : (
                      <span className="text-3xl font-bold text-trust-dark">{company.name.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-ink">Upload logo</span>
                    <input
                      name="logoFile"
                      type="file"
                      accept="image/*"
                      className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-trust-dark focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    <span className="text-xs font-semibold text-muted">Image files only. Maximum 1MB. The cover image uses the same uploaded logo image.</span>
                  </label>
                </div>
                <button className="w-fit rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">Save profile</button>
              </form>
            </section>

            <section id="password" className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-ink">Password</h2>
              <p className="mt-2 text-muted">Update the password used with your approved business email.</p>
              <form action={updateBusinessPassword} className="mt-5 grid gap-4 md:max-w-xl">
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="businessToken" value={businessToken} />
                <input type="hidden" name="companyId" value={company.id} />
                <input type="hidden" name="companySlug" value={company.slug} />
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">New password</span>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={10}
                    placeholder="At least 10 characters"
                    className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">Confirm new password</span>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={10}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </label>
                <button className="w-fit rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">Save password</button>
              </form>
            </section>

            <section id="invite-customers" className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-ink">Invite customers</h2>
              <p className="mt-2 text-muted">
                Send a verified review invitation to a recent customer, or copy the neutral public invitation text below.
              </p>
              <div className="mt-5 grid gap-5">
                <form action={sendBusinessReviewInvitation} className="grid gap-4 rounded-2xl border border-purple-100 bg-wash p-4">
                  <input type="hidden" name="email" value={email} />
                  <input type="hidden" name="businessToken" value={businessToken} />
                  <input type="hidden" name="companyId" value={company.id} />
                  <input type="hidden" name="companySlug" value={company.slug} />
                  <input type="hidden" name="brandName" value={company.name} />
                  <div>
                    <h3 className="font-bold text-ink">Send verified invitation</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Reviews submitted through this secure link are still moderated before publication, but can be labelled as verified after approval.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-ink">Customer name optional</span>
                      <input name="customerName" placeholder="Jane Smith" className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-ink">Customer email</span>
                      <input name="customerEmail" type="email" required placeholder="customer@example.com" className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                    </label>
                  </div>
                  <button className="w-fit rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">
                    Send verified invitation
                  </button>
                </form>

                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-ink">Public write review link</span>
                    <input readOnly value={writeReviewUrl} className="w-full rounded-xl border border-purple-100 bg-wash px-4 py-3 text-sm text-muted" />
                  </label>
                  <textarea
                    readOnly
                    value={`Hi, thank you for choosing ${company.name}.\n\nIf you have a moment, we would appreciate your honest feedback on Furniture Brand Reviews:\n${writeReviewUrl}\n\nYour review helps other furniture buyers make more informed decisions.`}
                    className="min-h-[180px] w-full rounded-xl border border-purple-100 bg-wash px-4 py-3 text-sm leading-6 text-muted"
                  />
                </div>
              </div>
            </section>

            <section id="widgets" className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-ink">Embed widgets</h2>
              <p className="mt-2 text-muted">Copy these snippets into your website to show Furniture Brand Reviews ratings and reviews.</p>
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">Carousel widget</span>
                  <textarea readOnly value={carouselWidgetCode} className="min-h-[92px] w-full rounded-xl border border-purple-100 bg-wash px-4 py-3 font-mono text-xs text-muted" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">Micro widget</span>
                  <textarea readOnly value={microWidgetCode} className="min-h-[92px] w-full rounded-xl border border-purple-100 bg-wash px-4 py-3 font-mono text-xs text-muted" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">Public review page</span>
                  <input readOnly value={reviewPageUrl} className="w-full rounded-xl border border-purple-100 bg-wash px-4 py-3 text-sm text-muted" />
                </label>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
