import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Reviewer rules",
  description:
    "Read reviewer rules for submitting fair customer reviews and useful furniture brand reviews on Furniture Brand Reviews.",
  path: "/reviewer-rules"
});

export default function ReviewerRulesPage() {
  return (
    <InfoPage
      title="Reviewer rules"
      subtitle="These rules help keep customer reviews fair, useful and based on real furniture shopping experiences."
      sections={[
        {
          title: "Rules for reviewers",
          bullets: [
            "Use your real experience with the furniture company.",
            "Avoid false claims, exaggeration or content you cannot support.",
            "Do not post private information about yourself, staff or other customers.",
            "Do not submit paid or incentivised fake reviews.",
            "We may request verification when a review needs additional checks."
          ]
        },
        {
          title: "Helpful reviews",
          body: (
            <p>
              Useful reviews explain what happened, when it happened and how the brand handled delivery, product quality,
              customer service or after-sales support.
            </p>
          )
        }
      ]}
    />
  );
}
