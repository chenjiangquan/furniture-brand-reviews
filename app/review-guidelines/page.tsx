import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Review guidelines",
  description:
    "Read the Furniture Brand Reviews guidelines for fair customer reviews, moderated furniture brand reviews and responsible feedback about furniture companies."
};

export default function ReviewGuidelinesPage() {
  return (
    <InfoPage
      title="Review guidelines"
      subtitle="Our guidelines help keep furniture brand reviews fair, useful and based on genuine customer experiences."
      sections={[
        {
          title: "What reviews should include",
          bullets: [
            "Only submit reviews based on a real customer experience.",
            "Describe delivery, product quality, customer service, returns or after-sales support clearly.",
            "Keep your review honest, specific and useful for other furniture shoppers."
          ]
        },
        {
          title: "What is not allowed",
          bullets: [
            "False reviews, fake ratings or reviews written on behalf of someone else.",
            "Advertising, promotional content or spam.",
            "Abuse, harassment, hate speech or personal attacks.",
            "Private information such as addresses, phone numbers, payment details or staff personal data."
          ]
        },
        {
          title: "Moderation",
          body: (
            <p>
              Furniture Brand Reviews may review, reject or remove content that breaks these rules or creates safety,
              privacy or trust concerns.
            </p>
          )
        }
      ]}
    />
  );
}
