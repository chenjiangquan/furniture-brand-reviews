import type { Metadata } from "next";
import Link from "next/link";
import { requestBusinessLoginLink } from "@/lib/actions";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Business login",
  "Log in to Furniture Brand Reviews business tools to manage brand information, review replies and review invitations."
);

export default function BusinessLoginPage({ searchParams }: { searchParams?: { email?: string; sent?: string; error?: string } }) {
  const errorMessage =
    searchParams?.error === "no-approved-claim"
      ? "No approved business claim was found for this email."
      : searchParams?.error === "email-not-sent"
        ? "We could not send the login link. Check email settings and try again."
        : searchParams?.error === "invalid-email"
          ? "Enter a valid business email address."
          : "";

  return (
    <main className="bg-wash">
      <section className="mx-auto grid min-h-[70vh] max-w-[960px] place-items-center px-4 py-16 sm:px-6 lg:px-10">
        <div className="w-full rounded-2xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-trust-dark">Business dashboard</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink">Log in to manage your brand profile</h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Enter the email address used for your approved brand claim. This MVP dashboard lets claimed furniture brands manage profile details, reply to reviews and copy review invitation links.
          </p>

          {searchParams?.sent ? (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800">
              Secure login link sent. Open the link from your email to access the business dashboard.
            </div>
          ) : null}
          {errorMessage ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={requestBusinessLoginLink} className="mt-8 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-ink">Business email</span>
              <input
                type="email"
                name="email"
                defaultValue={searchParams?.email ?? ""}
                required
                placeholder="you@brand.com"
                className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </label>
            <button className="rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">
              Send secure login link
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm leading-6 text-muted">
            No approved claim yet?{" "}
            <Link href="/claim-your-profile" className="font-bold text-trust-dark underline underline-offset-4">
              Claim your profile
            </Link>{" "}
            first, then return here once it has been approved.
          </div>
        </div>
      </section>
    </main>
  );
}
