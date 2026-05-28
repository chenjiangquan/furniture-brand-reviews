import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "How it works",
  description:
    "See how Furniture Brand Reviews collects moderated customer reviews for furniture companies and publishes approved furniture brand reviews.",
  path: "/how-it-works"
});

export default function HowItWorksPage() {
  return (
    <InfoPage
      title="How Furniture Brand Reviews works"
      subtitle="A simple review process designed to help shoppers compare furniture companies with more confidence."
      sections={[
        {
          title: "The review process",
          bullets: [
            "Customers write reviews about real furniture shopping experiences.",
            "Reviews are moderated before they appear publicly.",
            "Approved reviews are published on brand profile pages.",
            "Brands may respond to reviews in future platform tools."
          ]
        },
        {
          title: "Why moderation matters",
          body: (
            <p>
              Moderation helps reduce fake ratings, spam, personal attacks and content that does not help shoppers compare
              furniture brands responsibly.
            </p>
          )
        }
      ]}
    />
  );
}
