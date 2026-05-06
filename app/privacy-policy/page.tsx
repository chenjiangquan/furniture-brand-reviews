import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "Read the Furniture Brand Reviews privacy policy for customer reviews, personal data, moderation and furniture company review submissions."
};

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      title="Privacy policy"
      subtitle="This privacy policy explains how Furniture Brand Reviews handles personal information connected with reviews and platform enquiries."
      sections={[
        {
          title: "Information we collect",
          body: (
            <p>
              We may collect review content, reviewer name, email address, optional order details, moderation records and
              messages sent to Furniture Brand Reviews.
            </p>
          )
        },
        {
          title: "How we use information",
          bullets: [
            "To moderate customer reviews before publishing.",
            "To prevent spam, fake reviews, abuse and platform misuse.",
            "To respond to support requests, business claims and legal requests.",
            "To improve furniture brand reviews and customer review features."
          ]
        },
        {
          title: "Privacy rights",
          body: (
            <p>
              Users in the UK and other GDPR contexts may ask to access, correct or delete personal data where applicable.
              Contact support@furniturebrandreviews.com with privacy requests.
            </p>
          )
        }
      ]}
    />
  );
}
