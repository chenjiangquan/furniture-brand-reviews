import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Dining table brands",
  description:
    "Browse dining table brand reviews and customer reviews for furniture companies selling dining room furniture worldwide.",
  path: "/dining-table-brands"
});

export default function DiningTableBrandsPage() {
  return (
    <CategoryPage
      title="Dining Table Brands Reviews"
      subtitle="Compare dining table brands by customer ratings, delivery feedback, product finish and service experience."
      path="/dining-table-brands"
      keywords={["dining", "table", "chairs"]}
      comparePoints={[
        "Table quality, finish and material expectations.",
        "Delivery reliability for large furniture items.",
        "Assembly, packaging and damage handling.",
        "Value for money across dining collections."
      ]}
    />
  );
}
