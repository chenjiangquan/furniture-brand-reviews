import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Bedroom furniture brands",
  description:
    "Compare bedroom furniture brand reviews, customer reviews and ratings for furniture companies selling beds, wardrobes and storage.",
  path: "/bedroom-furniture-brands"
});

export default function BedroomFurnitureBrandsPage() {
  return (
    <CategoryPage
      title="Bedroom Furniture Reviews"
      subtitle="Read customer experiences for bedroom furniture brands, from bed frames and wardrobes to delivery and after-sales support."
      path="/bedroom-furniture-brands"
      keywords={["bedroom", "bed", "wardrobe", "mattress", "storage"]}
      comparePoints={[
        "Delivery experience for beds, wardrobes and storage furniture.",
        "Product quality, finish and assembly instructions.",
        "Customer service when replacement parts or returns are needed.",
        "Value for money across bedroom furniture ranges."
      ]}
    />
  );
}
