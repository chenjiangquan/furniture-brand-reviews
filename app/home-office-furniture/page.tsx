import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Home office furniture",
  "Browse home office furniture brand reviews and customer reviews for desks, office chairs and furniture companies worldwide."
);

export default function HomeOfficeFurniturePage() {
  return (
    <CategoryPage
      title="Home Office Furniture Reviews"
      subtitle="Compare home office furniture brands by customer ratings, delivery feedback, desk quality and support experience."
      path="/home-office-furniture"
      keywords={["office", "desk", "chair", "home office"]}
      comparePoints={[
        "Desk and chair comfort for everyday work.",
        "Assembly experience, packaging and part quality.",
        "Delivery reliability and communication.",
        "Returns and customer support for home office furniture."
      ]}
    />
  );
}
