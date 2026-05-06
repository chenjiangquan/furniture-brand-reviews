import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Trust and safety",
  description:
    "Learn about Furniture Brand Reviews trust and safety principles for moderated furniture brand reviews and customer reviews."
};

export default function TrustAndSafetyPage() {
  return (
    <InfoPage
      title="Trust and safety"
      subtitle="Our trust principles are designed to protect useful customer reviews and reduce manipulation."
      sections={[
        {
          title: "Platform principles",
          bullets: [
            "Reviews are moderated before publishing.",
            "Fraud prevention and spam checks help protect the platform.",
            "Companies cannot pay to remove reviews.",
            "Fake review manipulation is not allowed.",
            "Review rules and moderation decisions are designed to be transparent and consistent."
          ]
        },
        {
          title: "Independent review moderation",
          body: (
            <p>
              Furniture Brand Reviews aims to help shoppers compare furniture companies using moderated customer
              experiences rather than paid placement or fake ratings.
            </p>
          )
        }
      ]}
    />
  );
}
