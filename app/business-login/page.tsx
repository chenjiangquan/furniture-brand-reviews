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
      subtitle="Business tools are coming soon for furniture companies listed on Furniture Brand Reviews."
      sections={[
        {
          title: "Coming soon",
          body: (
            <p>
              We are preparing business tools for profile management, review responses and customer feedback insights.
              There is no public business login yet.
            </p>
          ),
          cta: { label: "Contact us", href: "/contact" }
        }
      ]}
    />
  );
}
