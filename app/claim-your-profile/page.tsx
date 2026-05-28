import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Claim your profile",
  "Learn how furniture companies can claim a profile on Furniture Brand Reviews to manage brand information and customer reviews."
);

export default function ClaimYourProfilePage() {
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
          body: <p>Business profile tools are being developed. Contact us to register interest in claiming your profile.</p>,
          cta: { label: "Contact us to claim your profile", href: "/contact" }
        }
      ]}
    />
  );
}
