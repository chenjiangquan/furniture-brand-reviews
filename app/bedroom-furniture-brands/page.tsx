import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Bedroom furniture brands",
  description:
    "Compare bedroom furniture brand reviews, customer reviews and ratings for furniture companies selling beds, wardrobes and storage."
};

export default function BedroomFurnitureBrandsPage() {
  return (
    <CategoryPage
      title="Bedroom Furniture Reviews"
      subtitle="Read customer experiences for bedroom furniture brands, from bed frames and wardrobes to delivery and after-sales support."
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
