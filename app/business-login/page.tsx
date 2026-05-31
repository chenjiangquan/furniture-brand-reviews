import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Business login",
  "Business login information for furniture companies using Furniture Brand Reviews customer reviews and brand tools."
);

export default function BusinessLoginPage() {
  return (
    <InfoPage
      title="Business login"
      subtitle="Claimed furniture brands can now access a simple business dashboard for profile details, review replies and review invitation links."
      sections={[
        {
          title: "Business dashboard MVP",
          body: (
            <p>
              Use the email from your approved claim request to access the business dashboard. You can manage profile information,
              reply to approved reviews, copy review invitation links and get widget embed codes.
            </p>
          ),
          cta: { label: "Business login", href: "/business/login" }
        }
      ]}
    />
  );
}
