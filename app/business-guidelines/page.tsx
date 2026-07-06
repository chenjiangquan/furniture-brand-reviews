import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Business Guidelines",
  description:
    "Read Furniture Brand Reviews business guidelines for claimed profiles, review replies, customer invitations and fair review platform conduct.",
  path: "/business-guidelines"
});

export default function BusinessGuidelinesPage() {
  return (
    <InfoPage
      title="Business guidelines"
      subtitle="Guidelines for furniture companies using Furniture Brand Reviews to claim profiles, invite honest feedback and respond to customer reviews."
      sections={[
        {
          title: "Inviting customer reviews",
          bullets: [
            "Businesses may invite customers to leave honest feedback after a genuine purchase or service experience.",
            "Invitations must not ask only satisfied customers to review.",
            "Businesses must not offer rewards, discounts or incentives in exchange for positive reviews.",
            "Incentivised reviews must be clearly disclosed."
          ]
        },
        {
          title: "Responding to reviews",
          bullets: [
            "Business replies should be professional, relevant and focused on the customer experience.",
            "Replies must not include private customer information.",
            "Businesses can flag reviews for moderation, but companies cannot pay to remove approved reviews."
          ]
        },
        {
          title: "Claimed profiles",
          bullets: [
            "A claimed profile means a business contact has been approved for dashboard access.",
            "Claimed status does not mean Furniture Brand Reviews endorses the company.",
            "All public ratings and review counts are based on approved reviews, not paid placement."
          ],
          cta: { label: "Claim your profile", href: "/claim-your-profile" }
        }
      ]}
    />
  );
}
