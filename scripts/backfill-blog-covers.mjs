import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const coverBySlug = {
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

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function normalize(value) {
  return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function getBlogCoverImageForBlog(input) {
  const slug = normalize(input.slug).replace(/\s+/g, "-");
  if (slug && coverBySlug[slug]) return coverBySlug[slug];

  const text = normalize(
    `${input.title ?? ""} ${input.slug ?? ""} ${input.category ?? ""} ${input.categorySlug ?? ""} ${input.comparisonSlug ?? ""} ${input.type ?? ""}`
  );

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

function getBlogCoverAlt(input) {
  return input.title?.trim() || "Furniture Brand Reviews article cover";
}

loadEnvFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isDryRun = process.env.DRY_RUN === "1";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const { data: blogs, error } = await supabase
  .from("blogs")
  .select("id, title, slug, category, cover_image_url, cover_image_alt")
  .order("updated_at", { ascending: false });

if (error) {
  console.error(`Blog lookup failed: ${error.message}`);
  process.exit(1);
}

const updates = (blogs ?? [])
  .map((blog) => ({
    blog,
    coverImageUrl: blog.cover_image_url || getBlogCoverImageForBlog(blog),
    coverImageAlt: blog.cover_image_alt || getBlogCoverAlt(blog)
  }))
  .filter(({ blog, coverImageUrl, coverImageAlt }) => blog.cover_image_url !== coverImageUrl || blog.cover_image_alt !== coverImageAlt);

console.log(`${isDryRun ? "Would update" : "Updating"} ${updates.length} blog cover records.`);

let updated = 0;
for (const { blog, coverImageUrl, coverImageAlt } of updates) {
  console.log(`- ${blog.slug}: ${coverImageUrl}`);
  if (isDryRun) continue;

  const { error: updateError } = await supabase
    .from("blogs")
    .update({
      cover_image_url: coverImageUrl,
      cover_image_alt: coverImageAlt,
      updated_at: new Date().toISOString()
    })
    .eq("id", blog.id);

  if (updateError) {
    console.error(`Failed to update ${blog.slug}: ${updateError.message}`);
    process.exitCode = 1;
    continue;
  }

  updated += 1;
}

if (!isDryRun) console.log(`Updated ${updated} blog cover records.`);
