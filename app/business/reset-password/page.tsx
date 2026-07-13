import type { Metadata } from "next";
import Link from "next/link";
import { requestBusinessPasswordReset, resetBusinessPassword } from "@/lib/actions";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Reset business password",
  "Set or reset a Furniture Brand Reviews business dashboard password."
);

export default function BusinessResetPasswordPage({
  searchParams
}: {
  searchParams?: { email?: string; token?: string; sent?: string; error?: string };
}) {
  const email = String(searchParams?.email ?? "").trim().toLowerCase();
  const token = String(searchParams?.token ?? "").trim();
  const error = searchParams?.error === "no-approved-claim"
    ? "No approved business claim was found for this email."
    : searchParams?.error === "email-not-sent"
      ? "We could not send the password reset email. Check email settings and try again."
      : searchParams?.error === "invalid-email"
        ? "Enter a valid business email address."
        : searchParams?.error === "invalid-token"
          ? "This password reset link is invalid or expired."
          : searchParams?.error === "password-mismatch"
            ? "Passwords do not match."
            : searchParams?.error
              ? decodeURIComponent(searchParams.error)
              : "";

  return (
    <main className="bg-wash">
      <section className="mx-auto grid min-h-[70vh] max-w-[840px] place-items-center px-4 py-16 sm:px-6 lg:px-10">
        <div className="w-full rounded-2xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-trust-dark">Business dashboard</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink">Set your business password</h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Use the approved business email from your claim. We will send a secure link so you can set or reset the password.
          </p>

          {searchParams?.sent ? (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800">
              Password reset link sent. Open the link from your email to continue.
            </div>
          ) : null}
          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : null}

          {token ? (
            <form action={resetBusinessPassword} className="mt-8 grid gap-4">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="token" value={token} />
              <label className="grid gap-2">
                <span className="text-sm font-bold text-ink">Business email</span>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full rounded-xl border border-purple-100 bg-wash px-4 py-3 text-sm text-muted"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-ink">New password</span>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={10}
                  placeholder="At least 10 characters"
                  className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-ink">Confirm password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={10}
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </label>
              <button className="rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">
                Save password
              </button>
            </form>
          ) : (
            <form action={requestBusinessPasswordReset} className="mt-8 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-ink">Business email</span>
                <input
                  type="email"
                  name="email"
                  defaultValue={email}
                  required
                  placeholder="you@brand.com"
                  className="w-full rounded-xl border border-purple-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </label>
              <button className="rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">
                Send password reset link
              </button>
            </form>
          )}

          <div className="mt-6 rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm leading-6 text-muted">
            Already have a password?{" "}
            <Link href={`/business/login${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="font-bold text-trust-dark underline underline-offset-4">
              Log in here
            </Link>
            .
          </div>
        </div>
      </section>
    </main>
  );
}
