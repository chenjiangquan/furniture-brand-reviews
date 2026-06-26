import { featuredComparisons } from "@/lib/comparison-config";
import { categoryConfigs } from "@/lib/seo-page-config";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { BlogPost } from "@/lib/blogs";
import type { Company, Review } from "@/lib/types";

type AutoDraftTopic = {
  type: "category-ranking" | "brand-insight" | "comparison" | "delivery-complaint" | "buying-guide";
  title: string;
  slug: string;
  category: string;
  description: string;
  brandSlugs: string[];
  comparisonSlug?: string;
  categorySlug?: string;
  rankingSlug?: string;
};

type GeneratedBlogDraft = {
  title: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  content: string;
  faq: Array<{ question: string; answer: string }>;
  relatedLinks: string[];
};

type AutoDraftResult =
  | {
      success: true;
      skipped?: false;
      title: string;
      slug: string;
      topicType: AutoDraftTopic["type"];
      adminUrl: string;
      blogId?: string;
      qualityWarnings: string[];
    }
  | {
      success: false;
      skipped?: boolean;
      error: string;
      topicType?: AutoDraftTopic["type"];
      slug?: string;
    };

const bannedClaims = ["best ever", "guaranteed", "100% trusted", "worst brand", "scam", "fake", "avoid this brand", "definitely bad"];
const model = process.env.BLOG_AUTO_DRAFT_MODEL || "gpt-4o-mini";

function normalise(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return normalise(value)
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function wordCount(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#*_>`~\-[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function getH2Count(markdown: string) {
  return (markdown.match(/^##\s+/gm) ?? []).length;
}

function getFaqCount(markdown: string, faq: GeneratedBlogDraft["faq"]) {
  return Math.max(faq.length, (markdown.match(/^###\s+/gm) ?? []).length);
}

function getValidInternalLinkCount(markdown: string, links: string[]) {
  const markdownLinks = Array.from(markdown.matchAll(/\]\((\/[^)]+)\)/g)).map((match) => match[1]);
  return new Set([...markdownLinks, ...links].filter((href) => href.startsWith("/") && !href.startsWith("/admin") && !href.startsWith("/api"))).size;
}

function isRecent(value: string | null | undefined, days: number) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}

function isDuplicateTopic(topic: AutoDraftTopic, blogs: BlogPost[]) {
  const titleText = normalise(topic.title);
  const slug = topic.slug;

  if (blogs.some((blog) => blog.slug === slug || normalise(blog.title) === titleText)) {
    return true;
  }

  if (topic.brandSlugs.length > 0) {
    const recentBrandBlog = blogs.some((blog) => {
      if (!isRecent(blog.created_at, 30)) return false;
      const text = normalise(`${blog.title} ${blog.slug} ${blog.category ?? ""} ${blog.excerpt ?? ""} ${blog.content ?? ""}`);
      return topic.brandSlugs.some((brandSlug) => text.includes(brandSlug.replace(/-/g, " ")));
    });
    if (recentBrandBlog) return true;
  }

  if (topic.comparisonSlug) {
    const comparisonSlug = topic.comparisonSlug;
    const recentComparisonBlog = blogs.some(
      (blog) => isRecent(blog.created_at, 30) && normalise(`${blog.title} ${blog.slug} ${blog.content ?? ""}`).includes(comparisonSlug.replace(/-/g, " "))
    );
    if (recentComparisonBlog) return true;
  }

  if (topic.categorySlug) {
    const categorySlug = topic.categorySlug;
    const recentCategoryBlog = blogs.some(
      (blog) => isRecent(blog.created_at, 14) && normalise(`${blog.title} ${blog.slug} ${blog.category ?? ""} ${blog.content ?? ""}`).includes(categorySlug.replace(/-/g, " "))
    );
    if (recentCategoryBlog) return true;
  }

  return false;
}

function getRankingSlugForCategory(categorySlug: string) {
  const rankingByCategory: Record<string, string> = {
    "sofa-brands": "best-sofa-brands",
    "dining-table-brands": "best-dining-table-brands",
    "bedroom-furniture-brands": "best-bedroom-furniture-brands",
    "outdoor-furniture-brands": "best-outdoor-furniture-brands",
    "uk-furniture-brands": "best-furniture-brands-uk"
  };

  return rankingByCategory[categorySlug] ?? "best-furniture-brands";
}

function buildTopics(companies: Company[], reviews: Review[]) {
  const reviewedCompanies = companies
    .filter((company) => company.status !== "draft" && company.slug && Number(company.review_count || 0) >= 3)
    .sort((first, second) => Number(second.review_count || 0) - Number(first.review_count || 0));
  const brandInsightCompanies = reviewedCompanies.filter((company) => Number(company.review_count || 0) >= 10).slice(0, 20);

  const categoryTopics = categoryConfigs.slice(0, 8).map((category) => ({
    type: "category-ranking" as const,
    title: `Best ${category.h1.replace(/^Best\s+/i, "").replace(/\s+Reviewed by Customers$/i, "")} Based on Customer Reviews`,
    slug: slugify(`Best ${category.h1.replace(/^Best\s+/i, "").replace(/\s+Reviewed by Customers$/i, "")} Based on Customer Reviews`),
    category: category.h1.replace(" Reviewed by Customers", ""),
    description: category.description,
    brandSlugs: [],
    categorySlug: category.slug,
    rankingSlug: getRankingSlugForCategory(category.slug)
  }));

  const brandTopics = brandInsightCompanies.map((company) => ({
    type: "brand-insight" as const,
    title: `${company.name} Reviews: What Customers Commonly Mention`,
    slug: slugify(`${company.name} Reviews What Customers Commonly Mention`),
    category: "Brand reviews",
    description: `Use approved customer reviews for ${company.name} to summarise common delivery, product quality and service themes without making unsupported claims.`,
    brandSlugs: [company.slug],
    categorySlug: categoryConfigs.find((category) => category.keywords.some((keyword) => normalise(`${company.name} ${company.category} ${company.description ?? ""}`).includes(keyword)))?.slug,
    rankingSlug: "best-furniture-brands"
  }));

  const comparisonTopics = featuredComparisons
    .map((comparison) => {
      const brandA = companies.find((company) => company.slug === comparison.brandASlug);
      const brandB = companies.find((company) => company.slug === comparison.brandBSlug);
      if (!brandA || !brandB) return null;
      if (Number(brandA.review_count || 0) < 3 && Number(brandB.review_count || 0) < 3) return null;
      return {
        type: "comparison" as const,
        title: `${brandA.name} vs ${brandB.name}: Customer Reviews Compared`,
        slug: slugify(`${brandA.name} vs ${brandB.name} Customer Reviews Compared`),
        category: "Brand comparisons",
        description: `Compare ${brandA.name} and ${brandB.name} using approved customer reviews, ratings, delivery feedback and complaint signals.`,
        brandSlugs: [brandA.slug, brandB.slug],
        comparisonSlug: comparison.slug,
        rankingSlug: "best-furniture-brands"
      };
    })
    .filter(Boolean) as AutoDraftTopic[];

  const intentTopics: AutoDraftTopic[] = [
    {
      type: "delivery-complaint",
      title: "Furniture Delivery Reviews: What Buyers Should Check Before Ordering",
      slug: "furniture-delivery-reviews-what-buyers-should-check",
      category: "Delivery reviews",
      description: "Explain how buyers can read approved furniture delivery reviews before ordering, including timing, courier communication and damaged arrivals.",
      brandSlugs: reviewedCompanies.slice(0, 3).map((company) => company.slug),
      rankingSlug: "best-furniture-brands"
    },
    {
      type: "delivery-complaint",
      title: "Common Furniture Brand Complaints and How to Read Them",
      slug: "common-furniture-brand-complaints-how-to-read-them",
      category: "Complaints",
      description: "Explain how to interpret complaint-related language in approved furniture reviews without overstating conclusions.",
      brandSlugs: reviewedCompanies.slice(0, 3).map((company) => company.slug),
      rankingSlug: "best-furniture-brands"
    },
    {
      type: "buying-guide",
      title: "How to Read Furniture Reviews Before Buying Online",
      slug: "how-to-read-furniture-reviews-before-buying-online",
      category: "Review guides",
      description: "Guide buyers through reading customer ratings, review count, delivery feedback and complaint themes before buying furniture online.",
      brandSlugs: reviewedCompanies.slice(0, 3).map((company) => company.slug),
      rankingSlug: "best-furniture-brands"
    }
  ];

  return [...categoryTopics, ...brandTopics, ...comparisonTopics, ...intentTopics];
}

function buildContext(topic: AutoDraftTopic, companies: Company[], reviews: Review[]) {
  const selectedBrands = companies.filter((company) => topic.brandSlugs.includes(company.slug));
  const fallbackBrands = companies
    .filter((company) => company.status !== "draft" && company.slug && Number(company.review_count || 0) > 0)
    .sort((first, second) => Number(second.review_count || 0) - Number(first.review_count || 0))
    .slice(0, 5);
  const relatedBrands = selectedBrands.length >= 3 ? selectedBrands : [...selectedBrands, ...fallbackBrands].filter((brand, index, list) => list.findIndex((item) => item.slug === brand.slug) === index).slice(0, 5);
  const relatedCategory = topic.categorySlug ?? categoryConfigs[0].slug;
  const relatedRanking = topic.rankingSlug ?? "best-furniture-brands";
  const relatedComparison = topic.comparisonSlug;
  const reviewSamples = reviews
    .filter((review) => review.status === "approved" && review.company_id && relatedBrands.some((brand) => brand.id === review.company_id))
    .slice(0, 12)
    .map((review) => ({
      rating: review.rating,
      title: review.title,
      content: review.content.slice(0, 260)
    }));

  return {
    topic,
    relatedBrands: relatedBrands.map((company) => ({
      name: company.name,
      slug: company.slug,
      category: company.category,
      averageRating: company.average_rating,
      reviewCount: company.review_count,
      url: `/review/${company.slug}`
    })),
    categoryLinks: [`/category/${relatedCategory}`],
    rankingLinks: [`/${relatedRanking}`],
    comparisonLinks: relatedComparison ? [`/compare/${relatedComparison}`] : [],
    reviewSamples
  };
}

async function callOpenAI(context: ReturnType<typeof buildContext>): Promise<GeneratedBlogDraft> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write neutral SEO drafts for Furniture Brand Reviews, a review platform. Use only provided approved-review data. Do not invent facts. Do not use absolute claims, defamatory wording, or advertising language. Return valid JSON only."
        },
        {
          role: "user",
          content: JSON.stringify({
            instructions: {
              outputShape: {
                title: "string",
                slug: "string",
                seoTitle: "string",
                metaDescription: "100-160 characters",
                excerpt: "string",
                category: "string",
                content: "Markdown article, 900-1400 words, H1-free, 4-6 H2 sections, FAQ section with H3 questions, neutral tone",
                faq: [{ question: "string", answer: "string" }],
                relatedLinks: ["internal URLs only"]
              },
              requiredSections: [
                "Intro",
                "What the current approved reviews can and cannot tell shoppers",
                "Delivery feedback",
                "Product quality and value",
                "Customer service, returns or complaints where relevant",
                "How to compare brands using approved reviews",
                "FAQ"
              ],
              requiredLinks: [
                "at least 3 /review/ links where available",
                "at least 1 /category/ link",
                "at least 1 ranking link",
                "comparison link if supplied"
              ],
              bannedClaims,
              cta: ["Browse all furniture brands", "Write a furniture review"]
            },
            context
          })
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${text.slice(0, 300)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI returned an empty response");
  }

  const parsed = JSON.parse(content) as GeneratedBlogDraft;
  return {
    ...parsed,
    slug: slugify(parsed.slug || parsed.title)
  };
}

function validateDraft(draft: GeneratedBlogDraft) {
  const warnings: string[] = [];
  const content = draft.content ?? "";
  const metaLength = draft.metaDescription?.length ?? 0;

  if (!draft.title?.trim()) warnings.push("Title is missing.");
  if (!draft.slug?.trim()) warnings.push("Slug is missing.");
  if (metaLength < 100 || metaLength > 160) warnings.push("Meta description should be 100-160 characters.");
  if (wordCount(content) < 800) warnings.push("Content is under 800 words.");
  if (getH2Count(content) < 4) warnings.push("Content has fewer than 4 H2 sections.");
  if (getFaqCount(content, draft.faq ?? []) < 4) warnings.push("Content has fewer than 4 FAQ items.");
  if (getValidInternalLinkCount(content, draft.relatedLinks ?? []) < 5) warnings.push("Content has fewer than 5 valid internal links.");

  const plainText = normalise(`${draft.title} ${draft.metaDescription} ${draft.excerpt} ${content}`);
  for (const claim of bannedClaims) {
    if (plainText.includes(claim)) warnings.push(`Banned claim found: ${claim}`);
  }

  return warnings;
}

async function logAutoDraft(status: "success" | "failed" | "skipped", topic: AutoDraftTopic | null, slug: string | null, message: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await supabase
    .from("blog_auto_draft_logs")
    .insert({
      status,
      topic_type: topic?.type ?? null,
      topic_title: topic?.title ?? null,
      slug,
      message
    })
    .then(({ error }) => {
      if (error) console.warn("Blog auto draft log skipped:", error.message);
    });
}

async function insertDraft(draft: GeneratedBlogDraft, topic: AutoDraftTopic, qualityWarnings: string[]) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase admin client is not configured");

  const payload = {
    title: draft.title.trim(),
    slug: draft.slug.trim(),
    excerpt: draft.excerpt?.trim() || draft.metaDescription,
    seo_title: draft.seoTitle?.trim() || `${draft.title.trim()} | Furniture Brand Reviews`,
    seo_description: draft.metaDescription.trim(),
    category: draft.category?.trim() || topic.category,
    content: draft.content.trim(),
    status: "draft",
    allow_index: false,
    cover_image_alt: draft.title.trim(),
    generated_by: "blog-auto-draft",
    generation_topic: topic.type,
    generation_notes: qualityWarnings.length ? qualityWarnings.join("\n") : "Auto-generated draft. Needs editorial review before publishing.",
    needs_review: true,
    updated_at: new Date().toISOString()
  };

  const result = await supabase.from("blogs").insert(payload).select("id, slug").single();

  if (!result.error) return result.data as { id: string; slug: string };

  if (!/generated_by|generation_topic|generation_notes|needs_review/i.test(result.error.message)) {
    throw new Error(`Blog draft insert failed: ${result.error.message}`);
  }

  const fallbackPayload = {
    title: payload.title,
    slug: payload.slug,
    excerpt: payload.excerpt,
    seo_title: payload.seo_title,
    seo_description: payload.seo_description,
    category: payload.category,
    content: payload.content,
    status: payload.status,
    allow_index: payload.allow_index,
    cover_image_alt: payload.cover_image_alt,
    updated_at: payload.updated_at
  };

  const fallback = await supabase.from("blogs").insert(fallbackPayload).select("id, slug").single();
  if (fallback.error) throw new Error(`Blog draft insert failed: ${fallback.error.message}`);
  return fallback.data as { id: string; slug: string };
}

export async function runBlogAutoDraft(): Promise<AutoDraftResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { success: false, error: "Supabase admin client is not configured" };
  }

  try {
    const [companiesResult, reviewsResult, blogsResult] = await Promise.all([
      supabase.from("companies").select("*").neq("status", "draft"),
      supabase
        .from("reviews")
        .select("id, company_id, rating, title, content, reviewer_name, reviewer_email, order_number, proof_image_url, review_image_urls, status, is_verified, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(300),
      supabase.from("blogs").select("*").order("created_at", { ascending: false }).limit(200)
    ]);

    if (companiesResult.error) throw new Error(`Company lookup failed: ${companiesResult.error.message}`);
    if (reviewsResult.error) throw new Error(`Review lookup failed: ${reviewsResult.error.message}`);
    if (blogsResult.error) throw new Error(`Blog lookup failed: ${blogsResult.error.message}`);

    const companies = (companiesResult.data ?? []) as Company[];
    const reviews = (reviewsResult.data ?? []) as Review[];
    const blogs = (blogsResult.data ?? []) as BlogPost[];
    const topics = buildTopics(companies, reviews);
    const topic = topics.find((item) => !isDuplicateTopic(item, blogs));

    if (!topic) {
      const error = "No suitable topic found";
      await logAutoDraft("skipped", null, null, error);
      return { success: false, skipped: true, error };
    }

    const context = buildContext(topic, companies, reviews);
    const draft = await callOpenAI(context);
    draft.slug = slugify(draft.slug || topic.slug);

    if (blogs.some((blog) => blog.slug === draft.slug)) {
      const error = `Duplicate generated slug: ${draft.slug}`;
      await logAutoDraft("skipped", topic, draft.slug, error);
      return { success: false, skipped: true, error, topicType: topic.type, slug: draft.slug };
    }

    const qualityWarnings = validateDraft(draft);
    const blockingWarnings = qualityWarnings.filter((warning) =>
      /missing|under 800|fewer than 4 H2|fewer than 4 FAQ|Banned claim/i.test(warning)
    );

    if (blockingWarnings.length > 0) {
      const error = `Draft failed quality checks: ${blockingWarnings.join("; ")}`;
      await logAutoDraft("failed", topic, draft.slug, error);
      return { success: false, error, topicType: topic.type, slug: draft.slug };
    }

    const inserted = await insertDraft(draft, topic, qualityWarnings);
    await logAutoDraft("success", topic, inserted.slug, "Draft created successfully");

    return {
      success: true,
      title: draft.title,
      slug: inserted.slug,
      blogId: inserted.id,
      topicType: topic.type,
      adminUrl: `/admin/blog?password=ADMIN_PASSWORD`,
      qualityWarnings
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown blog auto draft error";
    await logAutoDraft("failed", null, null, message);
    return { success: false, error: message };
  }
}
