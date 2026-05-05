import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Furniture Brand Reviews."
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Contact</h1>
      <p className="mt-5 text-lg leading-8 text-muted">For review questions, brand claims or corrections, email hello@furniturebrandreviews.co.uk.</p>
    </div>
  );
}
