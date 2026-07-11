import type { ReviewWithReply } from "@/lib/types";

export type ReviewTopicSentiment = {
  positive: number;
  mixed: number;
  negative: number;
};

export type ReviewTopicInsight = {
  label: string;
  count: number;
  sentiment: ReviewTopicSentiment;
};

export type ReviewIntelligence = {
  approvedReviewCount: number;
  analysisReviewCount: number;
  averageRating: number;
  starDistribution: Array<{ rating: 5 | 4 | 3 | 2 | 1; count: number; percentage: number }>;
  topTopics: ReviewTopicInsight[];
  deliveryMentionCount: number;
  qualityMentionCount: number;
  customerServiceMentionCount: number;
  returnsMentionCount: number;
  complaintCount: number;
  hasEnoughForPatterns: boolean;
  hasEnoughForTopics: boolean;
  hasEnoughForSummaries: boolean;
};

type TopicDefinition = {
  label: string;
  keywords: string[];
};

export const reviewTopicDefinitions: TopicDefinition[] = [
  {
    label: "Delivery",
    keywords: ["delivery", "delivered", "courier", "shipping", "arrived", "late", "delay", "delayed", "tracking", "driver", "missed delivery"]
  },
  {
    label: "Product quality",
    keywords: ["quality", "material", "fabric", "leather", "wood", "sturdy", "solid", "cheap", "damaged", "broken", "scratches", "finish"]
  },
  {
    label: "Customer service",
    keywords: ["customer service", "support", "response", "replied", "email", "phone", "helpful", "ignored", "no response"]
  },
  {
    label: "Returns & refunds",
    keywords: ["return", "refund", "exchange", "cancellation", "cancel", "money back", "collection"]
  },
  {
    label: "Assembly",
    keywords: ["assembly", "assemble", "assembled", "instructions", "screws", "parts", "missing parts"]
  },
  {
    label: "Packaging",
    keywords: ["packaging", "packed", "box", "parcel", "wrapped", "protection"]
  },
  {
    label: "Value for money",
    keywords: ["value", "price", "cost", "expensive", "cheap", "affordable", "money"]
  },
  {
    label: "Website ordering experience",
    keywords: ["website", "online", "order", "ordering", "checkout", "payment"]
  },
  {
    label: "Sofa comfort",
    keywords: ["sofa", "couch", "comfortable", "comfort", "cushion", "seat"]
  },
  {
    label: "Dining table quality",
    keywords: ["dining table", "table", "chairs", "dining", "surface"]
  },
  {
    label: "Bed / mattress comfort",
    keywords: ["bed", "mattress", "sleep", "bed frame", "comfortable"]
  },
  {
    label: "Outdoor furniture durability",
    keywords: ["outdoor", "garden", "patio", "rattan", "weather", "durable", "durability"]
  }
];

const deliveryKeywords = reviewTopicDefinitions[0].keywords;
const qualityKeywords = reviewTopicDefinitions[1].keywords;
const customerServiceKeywords = reviewTopicDefinitions[2].keywords;
const returnsKeywords = reviewTopicDefinitions[3].keywords;

const complaintKeywords = [
  "complaint",
  "poor",
  "bad",
  "damaged",
  "late",
  "delay",
  "delayed",
  "refund",
  "return",
  "broken",
  "missing",
  "disappointed",
  "issue",
  "problem",
  "unacceptable",
  "no response",
  "ignored"
];

function normalizeText(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function getReviewText(review: ReviewWithReply) {
  return normalizeText(`${review.title ?? ""} ${review.content ?? ""}`);
}

function hasKeyword(text: string, keyword: string) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return false;

  if (normalizedKeyword.includes(" ")) return text.includes(normalizedKeyword);

  const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escapedKeyword}\\b`, "i").test(text);
}

function reviewMentionsAny(review: ReviewWithReply, keywords: string[]) {
  const text = getReviewText(review);
  if (!text) return false;
  return keywords.some((keyword) => hasKeyword(text, keyword));
}

function getSentimentBucket(rating: number): keyof ReviewTopicSentiment {
  if (rating >= 4) return "positive";
  if (rating === 3) return "mixed";
  return "negative";
}

function countMentions(reviews: ReviewWithReply[], keywords: string[]) {
  return reviews.filter((review) => reviewMentionsAny(review, keywords)).length;
}

function isLikelyTestReview(review: ReviewWithReply) {
  const text = getReviewText(review);
  const reviewerName = normalizeText(review.reviewer_name);

  return (
    reviewerName === "test user" ||
    text.includes("test review from google sheets sync") ||
    text.includes("api import is working correctly")
  );
}

export function getReviewsForIntelligence(reviews: ReviewWithReply[]) {
  return reviews.filter((review) => review.status === "approved" && !isLikelyTestReview(review));
}

export function buildReviewIntelligence(reviews: ReviewWithReply[]): ReviewIntelligence {
  const approvedReviews = getReviewsForIntelligence(reviews);
  const approvedReviewCount = approvedReviews.length;
  const ratingTotal = approvedReviews.reduce((total, review) => total + Number(review.rating || 0), 0);
  const averageRating = approvedReviewCount ? Math.round((ratingTotal / approvedReviewCount) * 10) / 10 : 0;

  const starDistribution = ([5, 4, 3, 2, 1] as const).map((rating) => {
    const count = approvedReviews.filter((review) => Number(review.rating) === rating).length;
    return {
      rating,
      count,
      percentage: approvedReviewCount ? Math.round((count / approvedReviewCount) * 100) : 0
    };
  });

  const topTopics = reviewTopicDefinitions
    .map((topic) => {
      const sentiment: ReviewTopicSentiment = { positive: 0, mixed: 0, negative: 0 };
      const mentionedReviews = approvedReviews.filter((review) => reviewMentionsAny(review, topic.keywords));

      for (const review of mentionedReviews) {
        sentiment[getSentimentBucket(Number(review.rating))] += 1;
      }

      return {
        label: topic.label,
        count: mentionedReviews.length,
        sentiment
      };
    })
    .filter((topic) => topic.count > 0)
    .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label))
    .slice(0, 8);

  const complaintCount = approvedReviews.filter(
    (review) => Number(review.rating) <= 2 || reviewMentionsAny(review, complaintKeywords)
  ).length;

  return {
    approvedReviewCount,
    analysisReviewCount: approvedReviewCount,
    averageRating,
    starDistribution,
    topTopics,
    deliveryMentionCount: countMentions(approvedReviews, deliveryKeywords),
    qualityMentionCount: countMentions(approvedReviews, qualityKeywords),
    customerServiceMentionCount: countMentions(approvedReviews, customerServiceKeywords),
    returnsMentionCount: countMentions(approvedReviews, returnsKeywords),
    complaintCount,
    hasEnoughForPatterns: approvedReviewCount >= 3,
    hasEnoughForTopics: approvedReviewCount >= 5,
    hasEnoughForSummaries: approvedReviewCount >= 10
  };
}
