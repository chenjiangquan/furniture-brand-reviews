import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Help centre",
  description:
    "Find help for writing customer reviews, pending review moderation, reporting reviews and browsing furniture brand reviews.",
  path: "/help-centre"
});

export default function HelpCentrePage() {
  return (
    <InfoPage
      title="Help centre"
      subtitle="Quick answers for shoppers, reviewers and furniture companies using Furniture Brand Reviews."
      sections={[
        {
          title: "How to write a review",
          body: <p>Choose a brand, select a rating, describe your experience and submit the review for moderation.</p>
        },
        {
          title: "Why is my review pending?",
          body: <p>New reviews are checked before publishing to reduce spam, fake reviews and unsafe content.</p>
        },
        {
          title: "Can I edit a review?",
          body: <p>Editing tools are planned. For now, contact support with the review details and the change request.</p>
        },
        {
          title: "How do I report a review?",
          body: <p>Use the report review page or email support with the review link and reason for reporting.</p>
        },
        {
          title: "How do brands appear on the site?",
          body: <p>Brands may be listed from platform data, admin imports or approved first reviews from customers.</p>
        }
      ]}
    />
  );
}
