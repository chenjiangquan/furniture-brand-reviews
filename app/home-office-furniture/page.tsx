import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Home office furniture",
  description:
    "Browse home office furniture brand reviews and customer reviews for desks, office chairs and furniture companies worldwide."
};

export default function HomeOfficeFurniturePage() {
  return (
    <CategoryPage
      title="Home Office Furniture Reviews"
      subtitle="Compare home office furniture brands by customer ratings, delivery feedback, desk quality and support experience."
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
