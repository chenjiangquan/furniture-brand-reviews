import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description:
    "Read the terms and conditions for using Furniture Brand Reviews, submitting customer reviews and browsing furniture company ratings."
};

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms and conditions"
      subtitle="These terms explain the basic rules for using Furniture Brand Reviews and submitting furniture brand reviews."
      sections={[
        {
          title: "Using the platform",
          body: (
            <p>
              Furniture Brand Reviews provides customer-submitted reviews and brand information to help shoppers compare
              furniture companies. Content is provided for general information and should be considered alongside a
              company&apos;s own policies and current customer feedback.
            </p>
          )
        },
        {
          title: "Submitting reviews",
          bullets: [
            "Reviews must be honest and based on a genuine experience.",
            "Submitted reviews may be moderated, rejected or removed if they break our rules.",
            "You are responsible for the content you submit."
          ]
        },
        {
          title: "Changes and availability",
          body: <p>We may update the platform, policies or these terms as Furniture Brand Reviews develops.</p>
        }
      ]}
    />
  );
}
