import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Outdoor furniture",
  description:
    "Compare outdoor furniture brand reviews, customer reviews and furniture company ratings for garden furniture and outdoor living products."
};

export default function OutdoorFurniturePage() {
  return (
    <CategoryPage
      title="Outdoor Furniture Reviews"
      subtitle="Compare customer reviews for outdoor furniture brands, including garden sets, weather resistance, delivery and service."
      keywords={["outdoor", "garden", "patio"]}
      comparePoints={[
        "Garden furniture durability and weather resistance.",
        "Delivery and packaging for bulky outdoor items.",
        "Customer support for missing parts or damaged products.",
        "Seasonal availability, returns and warranties."
      ]}
    />
  );
}
