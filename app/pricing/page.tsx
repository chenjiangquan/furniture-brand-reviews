import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Pricing information for future Furniture Brand Reviews business tools for furniture companies and customer review management."
};

export default function PricingPage() {
  return (
    <InfoPage
      title="Pricing coming soon"
      subtitle="Business pricing has not launched yet. Core public review pages remain available for furniture shoppers."
      sections={[
        {
          title: "No paid plans yet",
          body: (
            <p>
              Furniture Brand Reviews is still developing business features. We are not showing pricing or selling paid
              review removal.
            </p>
          )
        },
        {
          title: "Future business features",
          bullets: ["Profile tools", "Review response tools", "Review analytics", "Category insights"]
        }
      ]}
    />
  );
}
