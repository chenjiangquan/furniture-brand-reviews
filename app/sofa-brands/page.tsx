import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Sofa brands",
  description:
    "Compare sofa brand reviews, customer reviews, delivery experiences and furniture companies selling sofas worldwide.",
  path: "/sofa-brands"
});

export default function SofaBrandsPage() {
  return (
    <CategoryPage
      title="Sofa Brands Reviews"
      subtitle="Compare customer reviews for sofa brands, including delivery, comfort, product quality and customer service."
      path="/sofa-brands"
      keywords={["sofa", "couch", "living room"]}
      comparePoints={[
        "Sofa delivery times and courier communication.",
        "Comfort, fabric quality and long-term durability.",
        "Customer service when orders are delayed or damaged.",
        "Returns, warranties and after-sales support."
      ]}
    />
  );
}
