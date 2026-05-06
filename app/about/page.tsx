import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Learn about Furniture Brand Reviews, an independent review platform for furniture brand reviews, customer reviews and furniture companies worldwide."
};

export default function AboutPage() {
  return (
    <InfoPage
      title="About Furniture Brand Reviews"
      subtitle="Furniture Brand Reviews is an independent review platform helping shoppers compare furniture brands worldwide through moderated customer reviews."
      sections={[
        {
          title: "Independent furniture brand reviews",
          body: (
            <>
              <p>
                Furniture Brand Reviews helps people compare furniture companies using real customer feedback about
                delivery experiences, product quality, value for money and customer service.
              </p>
              <p>
                We are built for furniture brands worldwide, from sofa and bedroom furniture companies to home office,
                dining and interior brands.
              </p>
            </>
          )
        },
        {
          title: "Moderated reviews",
          body: (
            <p>
              Reviews are moderated before publishing so the platform can reduce spam, fake ratings and abusive content.
              Companies cannot pay to remove reviews from Furniture Brand Reviews.
            </p>
          )
        }
      ]}
    />
  );
}
