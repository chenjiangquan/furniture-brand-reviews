import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Content policy",
  description:
    "Read the Furniture Brand Reviews content policy for moderated customer reviews, furniture brand reviews and acceptable platform content.",
  path: "/content-policy"
});

export default function ContentPolicyPage() {
  return (
    <InfoPage
      title="Content policy"
      subtitle="This policy explains what content is allowed on Furniture Brand Reviews and how moderation protects useful customer reviews."
      sections={[
        {
          title: "Allowed content",
          bullets: [
            "Genuine customer experiences with furniture companies.",
            "Clear feedback about delivery, product quality, customer service and after-sales support.",
            "Balanced opinions that help other shoppers compare furniture brands."
          ]
        },
        {
          title: "Restricted content",
          bullets: [
            "Fake reviews, paid manipulation, spam or advertising.",
            "Abuse, threats, harassment or discriminatory content.",
            "Private information, legal threats or content that creates safety concerns.",
            "Reviews that are not related to a customer experience."
          ]
        },
        {
          title: "Moderation action",
          body: <p>We may reject, edit for safety reasons or remove content that does not follow this policy.</p>
        }
      ]}
    />
  );
}
