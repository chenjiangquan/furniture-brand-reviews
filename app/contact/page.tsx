import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Contact",
  description:
    "Contact Furniture Brand Reviews for customer reviews, furniture brand reviews, business claims, review issues and legal requests.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact Furniture Brand Reviews"
      subtitle="Get in touch about review questions, business claims, legal requests or platform feedback."
      sections={[
        {
          title: "Contact email",
          body: (
            <p>
              Email <a className="font-semibold text-trust-dark" href="mailto:support@furniturebrandreviews.com">support@furniturebrandreviews.com</a>{" "}
              for general enquiries, review issues, business claims and legal requests.
            </p>
          )
        },
        {
          title: "What to include",
          bullets: [
            "For review issues, include the brand name and review page link if available.",
            "For business claims, use an email address connected to the furniture company where possible.",
            "For legal requests, include enough detail for the request to be reviewed properly."
          ]
        }
      ]}
    />
  );
}
