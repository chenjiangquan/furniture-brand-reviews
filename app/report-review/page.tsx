import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Report a review",
  description:
    "Report suspicious customer reviews, privacy issues or abusive content on Furniture Brand Reviews for moderation."
};

export default function ReportReviewPage() {
  return (
    <InfoPage
      title="Report a review"
      subtitle="Tell us if a furniture brand review appears suspicious, fake, offensive or includes private information."
      sections={[
        {
          title: "What you can report",
          bullets: [
            "Reviews that appear fake or unrelated to a real customer experience.",
            "Abusive, discriminatory or threatening content.",
            "Private information, legal concerns or content that may identify someone unfairly."
          ]
        },
        {
          title: "Contact moderation",
          body: (
            <p>
              Send the review link, brand name and reason for reporting to{" "}
              <a className="font-semibold text-trust-dark" href="mailto:support@furniturebrandreviews.com">support@furniturebrandreviews.com</a>.
            </p>
          ),
          cta: { label: "Contact us", href: "/contact" }
        }
      ]}
    />
  );
}
