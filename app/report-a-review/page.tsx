import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Report a Review",
  description:
    "Report suspicious, abusive, promotional or privacy-sensitive furniture reviews to Furniture Brand Reviews for manual moderation.",
  path: "/report-a-review"
});

export default function ReportAReviewPage() {
  return (
    <InfoPage
      title="Report a review"
      subtitle="Use this page to report a review that may break Furniture Brand Reviews content rules or require manual moderation."
      sections={[
        {
          title: "When to report a review",
          bullets: [
            "The review appears to be fake, promotional or not based on a genuine experience.",
            "The review includes personal information or privacy-sensitive details.",
            "The review contains abusive, discriminatory, threatening or illegal content.",
            "The review appears to be about a different furniture business."
          ]
        },
        {
          title: "How reports are handled",
          body: (
            <p>
              Reports are checked manually. Reporting a review does not automatically remove it, and approved reviews are only changed or removed when they break platform rules.
            </p>
          )
        },
        {
          title: "Send a report",
          body: (
            <p>
              Please include the review URL, brand name and reason for the report when contacting{" "}
              <a className="font-semibold text-trust-dark" href="mailto:support@furniturebrandreviews.com">support@furniturebrandreviews.com</a>.
            </p>
          ),
          cta: { label: "Contact moderation", href: "/contact" }
        }
      ]}
    />
  );
}
