import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Home office furniture",
  description:
    "Browse home office furniture brand reviews and customer reviews for desks, office chairs and furniture companies worldwide.",
  path: "/home-office-furniture"
});

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
