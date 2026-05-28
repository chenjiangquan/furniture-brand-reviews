import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Outdoor furniture",
  description:
    "Compare outdoor furniture brand reviews, customer reviews and furniture company ratings for garden furniture and outdoor living products.",
  path: "/outdoor-furniture"
});

export default function OutdoorFurniturePage() {
  return (
    <CategoryPage
      title="Outdoor Furniture Reviews"
      subtitle="Compare customer reviews for outdoor furniture brands, including garden sets, weather resistance, delivery and service."
      path="/outdoor-furniture"
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
