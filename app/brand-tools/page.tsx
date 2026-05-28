import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { BusinessReviewInviteTool } from "@/components/BusinessReviewInviteTool";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Brand tools",
  "Explore planned Furniture Brand Reviews tools for furniture companies, review analytics, profile management and customer review responses."
);

export default function BrandToolsPage() {
  return (
    <>
      <InfoPage
        title="Brand tools"
        subtitle="Furniture Brand Reviews is developing simple tools to help furniture companies understand and respond to customer feedback."
        sections={[
          {
            title: "Planned tools",
            bullets: [
              "Review analytics for customer feedback themes.",
              "Profile management for brand information and imagery.",
              "Response tools for customer reviews.",
              "Category insights for furniture and home brands."
            ]
          }
        ]}
      />
      <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-10">
        <BusinessReviewInviteTool />
      </section>
    </>
  );
}
