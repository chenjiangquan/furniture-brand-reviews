import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Furniture Brand Reviews."
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Privacy policy</h1>
      <p className="mt-5 text-lg leading-8 text-muted">We collect review details to moderate submissions, prevent abuse and publish approved customer feedback. Contact details are used for moderation and are not shown publicly.</p>
    </div>
  );
}
