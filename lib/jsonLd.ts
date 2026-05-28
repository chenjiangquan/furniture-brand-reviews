import { absoluteUrl, defaultShareImage, siteName, siteUrl } from "@/lib/seo";
import type { Company, ReviewWithReply } from "@/lib/types";

type BreadcrumbItem = {
  name: string;
  url: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type ItemListItem = {
  name: string;
  url: string;
  position: number;
  ratingValue?: number;
  reviewCount?: number;
};

function compactObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => {
      if (entryValue === undefined || entryValue === null) return false;
      if (Array.isArray(entryValue) && entryValue.length === 0) return false;
      if (entryValue === "") return false;
      return true;
    })
  );
}

function getAbsoluteImageUrl(imagePath = defaultShareImage) {
  return imagePath.startsWith("http") ? imagePath : absoluteUrl(imagePath);
}

export function buildWebsiteSchema() {
  return {
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/brands?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function buildPlatformOrganizationSchema() {
  return {
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: getAbsoluteImageUrl("/logo.png")
  };
}

export function buildAggregateRatingSchema(ratingValue?: number | null, reviewCount?: number | null) {
  const rating = Number(ratingValue ?? 0);
  const count = Number(reviewCount ?? 0);

  if (!count || !rating) return null;

  return {
    "@type": "AggregateRating",
    ratingValue: rating.toFixed(1),
    reviewCount: count,
    bestRating: 5,
    worstRating: 1
  };
}

export function buildBrandOrganizationSchema(company: Company) {
  const aggregateRating = buildAggregateRatingSchema(company.average_rating, company.review_count);
  const sameAs = company.website ? [company.website] : [];

  return compactObject({
    "@type": "Organization",
    name: company.name,
    url: company.website || undefined,
    sameAs,
    aggregateRating: aggregateRating ?? undefined
  });
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function buildFaqSchema(faqs: FaqItem[]) {
  if (!faqs.length) return null;

  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function buildReviewItemListSchema(company: Company, reviews: ReviewWithReply[], pageUrl: string) {
  if (!reviews.length) return null;

  const itemReviewed = compactObject({
    "@type": "Organization",
    name: company.name,
    url: company.website || undefined
  });

  return {
    "@type": "ItemList",
    itemListElement: reviews.slice(0, 10).map((review, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: compactObject({
        "@type": "Review",
        name: review.title || "Customer review",
        reviewBody: review.content,
        datePublished: review.created_at,
        author: {
          "@type": "Person",
          name: review.reviewer_name || "Anonymous customer"
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1
        },
        itemReviewed,
        url: `${pageUrl}#review-${review.id}`
      })
    }))
  };
}

export function buildCollectionPageSchema(title: string, description: string, path: string) {
  return {
    "@type": "CollectionPage",
    name: title,
    description,
    url: absoluteUrl(path)
  };
}

export function buildItemListSchema(items: ItemListItem[]) {
  if (!items.length) return null;

  return {
    "@type": "ItemList",
    itemListElement: items.map((item) => {
      const aggregateRating = buildAggregateRatingSchema(item.ratingValue, item.reviewCount);

      return {
        "@type": "ListItem",
        position: item.position,
        item: compactObject({
          "@type": "Organization",
          name: item.name,
          url: item.url,
          aggregateRating: aggregateRating ?? undefined
        })
      };
    })
  };
}

export function buildGraph(items: Array<Record<string, unknown> | null | undefined>) {
  return {
    "@context": "https://schema.org",
    "@graph": items.filter(Boolean)
  };
}
