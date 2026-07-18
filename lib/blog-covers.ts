type BlogCoverInput = {
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  categorySlug?: string | null;
  comparisonSlug?: string | null;
  type?: string | null;
};

const coverBySlug: Record<string, string> = {
  "best-furniture-brands-based-on-customer-reviews": "/blog-covers/best-furniture-brands-based-on-customer-reviews.svg",
  "best-sofa-brands-in-the-uk-based-on-customer-feedback": "/blog-covers/best-sofa-brands-in-the-uk-based-on-customer-feedback.svg",
  "furniture-delivery-reviews-what-customers-commonly-mention": "/blog-covers/furniture-delivery-reviews-what-customers-commonly-mention.svg",
  "sofa-brand-reviews-delivery-quality-and-customer-service-compared": "/blog-covers/sofa-brand-reviews-delivery-quality-and-customer-service-compared.svg",
  "best-dining-table-brands-based-on-customer-ratings": "/blog-covers/best-dining-table-brands-based-on-customer-ratings.svg",
  "furniture-brand-complaints-what-buyers-should-check-before-ordering": "/blog-covers/furniture-brand-complaints-what-buyers-should-check-before-ordering.svg",
  "how-to-read-furniture-reviews-before-buying-online": "/blog-covers/how-to-read-furniture-reviews-before-buying-online.svg",
  "wayfair-vs-dunelm-furniture-reviews-compared": "/blog-covers/wayfair-vs-dunelm-furniture-reviews-compared.svg",
  "dfs-vs-sofology-sofa-reviews-compared": "/blog-covers/dfs-vs-sofology-sofa-reviews-compared.svg",
  "best-outdoor-furniture-brands-based-on-customer-reviews": "/blog-covers/best-outdoor-furniture-brands-based-on-customer-reviews.svg"
};

const defaultCover = coverBySlug["best-furniture-brands-based-on-customer-reviews"];

function normalize(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function getBlogCoverImageForBlog(input: BlogCoverInput) {
  const slug = normalize(input.slug).replace(/\s+/g, "-");
  if (slug && coverBySlug[slug]) return coverBySlug[slug];

  const text = normalize(`${input.title ?? ""} ${input.slug ?? ""} ${input.category ?? ""} ${input.categorySlug ?? ""} ${input.comparisonSlug ?? ""} ${input.type ?? ""}`);

  if (text.includes("dfs") && text.includes("sofology")) return coverBySlug["dfs-vs-sofology-sofa-reviews-compared"];
  if (text.includes("wayfair") && text.includes("dunelm")) return coverBySlug["wayfair-vs-dunelm-furniture-reviews-compared"];
  if (text.includes("delivery")) return coverBySlug["furniture-delivery-reviews-what-customers-commonly-mention"];
  if (text.includes("complaint") || text.includes("refund") || text.includes("return")) {
    return coverBySlug["furniture-brand-complaints-what-buyers-should-check-before-ordering"];
  }
  if (text.includes("dining") || text.includes("table")) return coverBySlug["best-dining-table-brands-based-on-customer-ratings"];
  if (text.includes("outdoor") || text.includes("garden") || text.includes("patio")) return coverBySlug["best-outdoor-furniture-brands-based-on-customer-reviews"];
  if (text.includes("sofa") || text.includes("couch")) return coverBySlug["best-sofa-brands-in-the-uk-based-on-customer-feedback"];
  if (text.includes("read furniture reviews") || text.includes("buying online")) return coverBySlug["how-to-read-furniture-reviews-before-buying-online"];

  return defaultCover;
}

export function getBlogCoverAlt(input: BlogCoverInput) {
  return input.title?.trim() || "Furniture Brand Reviews article cover";
}
