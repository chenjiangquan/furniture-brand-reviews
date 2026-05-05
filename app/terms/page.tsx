import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using Furniture Brand Reviews."
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Terms</h1>
      <p className="mt-5 text-lg leading-8 text-muted">By using Furniture Brand Reviews, you agree to submit honest content and accept that reviews may be moderated, edited for safety concerns or rejected.</p>
    </div>
  );
}
