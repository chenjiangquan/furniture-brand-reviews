import type { Company } from "@/lib/types";

export type SeoCategoryConfig = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  keywords: string[];
  related: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export type RankingConfig = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  mode: "best" | "worst";
  keywords?: string[];
  relatedCategories: string[];
};

export const categoryConfigs: SeoCategoryConfig[] = [
  {
    slug: "sofa-brands",
    title: "Best Sofa Brands Reviewed | Customer Ratings & Delivery Feedback",
    description: "Compare sofa brands by customer reviews, average ratings, delivery experience, product quality and complaints.",
    h1: "Best Sofa Brands Reviewed by Customers",
    intro:
      "This category brings together sofa brands listed on Furniture Brand Reviews using public approved reviews, average ratings and customer feedback about delivery, comfort, product quality and service.",
    keywords: ["sofa", "couch", "living room"],
    related: ["sofa-bed-brands", "luxury-furniture-brands", "cheap-furniture-brands"],
    faqs: [
      {
        question: "How are sofa brands ranked on Furniture Brand Reviews?",
        answer: "Sofa brand rankings use approved customer reviews, average ratings and review volume. Pending and rejected reviews are not included."
      },
      {
        question: "What should I compare before choosing a sofa brand?",
        answer: "Shoppers often compare delivery reliability, comfort, fabric quality, returns, customer service and long-term durability."
      },
      {
        question: "Can companies pay to remove sofa reviews?",
        answer: "Companies cannot pay Furniture Brand Reviews to remove approved customer reviews."
      },
      {
        question: "Why do some sofa brands have fewer reviews?",
        answer: "Some brands are newer to the platform or have fewer approved reviews from customers. More feedback may appear over time."
      }
    ]
  },
  {
    slug: "sofa-bed-brands",
    title: "Best Sofa Bed Brands Reviewed | Customer Ratings & Delivery Feedback",
    description: "Compare sofa bed brands by customer reviews, average ratings, delivery experience, product quality and complaints.",
    h1: "Best Sofa Bed Brands Reviewed by Customers",
    intro:
      "This page helps shoppers compare sofa bed brands using public approved reviews, ratings and customer feedback about comfort, delivery, build quality and after-sales support.",
    keywords: ["sofa bed", "sofabed", "sofa", "bed"],
    related: ["sofa-brands", "bed-and-mattress-brands", "home-office-furniture-brands"],
    faqs: [
      {
        question: "What makes a good sofa bed brand?",
        answer: "Customers usually look for comfort as both a seat and bed, sturdy mechanisms, delivery reliability and clear returns policies."
      },
      {
        question: "Are sofa bed reviews moderated?",
        answer: "Reviews submitted to Furniture Brand Reviews are moderated before publishing."
      },
      {
        question: "Do sofa bed ratings include delivery feedback?",
        answer: "Ratings are customer submitted and may reflect delivery, product quality, service and the overall buying experience."
      },
      {
        question: "Should I read recent reviews before buying a sofa bed?",
        answer: "Yes. Recent reviews can show current delivery performance, customer service and product quality trends."
      }
    ]
  },
  {
    slug: "dining-table-brands",
    title: "Best Dining Table Brands Reviewed | Customer Ratings & Delivery Feedback",
    description: "Compare dining table brands by customer reviews, average ratings, delivery experience, product quality and complaints.",
    h1: "Best Dining Table Brands Reviewed by Customers",
    intro:
      "Compare dining table brands using approved reviews and ratings from Furniture Brand Reviews, including feedback on delivery, packaging, finish, assembly and service.",
    keywords: ["dining", "table", "chairs"],
    related: ["luxury-furniture-brands", "cheap-furniture-brands", "uk-furniture-brands"],
    faqs: [
      {
        question: "How should I compare dining table brands?",
        answer: "Consider product finish, material quality, delivery handling, packaging, assembly and how brands respond to damage or missing parts."
      },
      {
        question: "Are dining table brand scores based on approved reviews?",
        answer: "Yes. Category scores are based on currently approved reviews shown publicly on Furniture Brand Reviews."
      },
      {
        question: "Why is delivery important for dining furniture?",
        answer: "Dining tables are often bulky and can be vulnerable to delivery damage, so customer delivery feedback is useful before buying."
      },
      {
        question: "Can I review a dining table brand?",
        answer: "Yes. Customers can submit a review, which is checked before it is published."
      }
    ]
  },
  {
    slug: "bedroom-furniture-brands",
    title: "Best Bedroom Furniture Brands Reviewed | Customer Ratings & Delivery Feedback",
    description: "Compare bedroom furniture brands by customer reviews, average ratings, delivery experience, product quality and complaints.",
    h1: "Best Bedroom Furniture Brands Reviewed by Customers",
    intro:
      "This category summarises bedroom furniture brands using approved customer reviews about beds, wardrobes, storage, delivery, assembly and after-sales support.",
    keywords: ["bedroom", "wardrobe", "storage", "dresser", "chest"],
    related: ["bed-and-mattress-brands", "cheap-furniture-brands", "luxury-furniture-brands"],
    faqs: [
      {
        question: "What bedroom furniture feedback should shoppers check?",
        answer: "Useful feedback includes delivery reliability, assembly, product finish, missing parts, returns and customer service."
      },
      {
        question: "Are wardrobes and storage brands included?",
        answer: "Yes, brands can appear here when their profile or reviews relate to bedroom furniture, wardrobes, beds or storage."
      },
      {
        question: "Do bedroom furniture scores include rejected reviews?",
        answer: "No. Public category scores only use approved reviews."
      },
      {
        question: "How often do category rankings change?",
        answer: "Rankings can change as new approved reviews are published and brand review counts grow."
      }
    ]
  },
  {
    slug: "bed-and-mattress-brands",
    title: "Best Bed and Mattress Brands Reviewed | Customer Ratings & Delivery Feedback",
    description: "Compare bed and mattress brands by customer reviews, average ratings, delivery experience, product quality and complaints.",
    h1: "Best Bed and Mattress Brands Reviewed by Customers",
    intro:
      "Compare bed and mattress brands using public approved reviews, with attention to delivery, comfort, returns, quality and service feedback.",
    keywords: ["bed", "mattress", "bed frame", "sleep"],
    related: ["bedroom-furniture-brands", "sofa-bed-brands", "uk-furniture-brands"],
    faqs: [
      {
        question: "What should I look for in bed and mattress reviews?",
        answer: "Look for comfort, delivery timing, returns, warranty handling, product quality and whether customers mention long-term support."
      },
      {
        question: "Are mattress reviews verified?",
        answer: "Reviews are moderated before publishing, and individual reviews are only marked verified when the database marks them as verified."
      },
      {
        question: "Why can mattress ratings vary so much?",
        answer: "Comfort is personal, so shoppers should read the written feedback as well as the average score."
      },
      {
        question: "Can brands remove low bed or mattress ratings?",
        answer: "Companies cannot pay to remove approved reviews from Furniture Brand Reviews."
      }
    ]
  },
  {
    slug: "outdoor-furniture-brands",
    title: "Best Outdoor Furniture Brands Reviewed | Customer Ratings & Delivery Feedback",
    description: "Compare outdoor furniture brands by customer reviews, average ratings, delivery experience, product quality and complaints.",
    h1: "Best Outdoor Furniture Brands Reviewed by Customers",
    intro:
      "This category compares outdoor furniture brands using approved customer reviews about garden sets, weather resistance, packaging, delivery and support.",
    keywords: ["outdoor", "garden", "patio", "rattan"],
    related: ["dining-table-brands", "cheap-furniture-brands", "luxury-furniture-brands"],
    faqs: [
      {
        question: "What matters most in outdoor furniture reviews?",
        answer: "Customers often mention durability, weather resistance, delivery, packaging, replacement parts and seasonal availability."
      },
      {
        question: "Are outdoor furniture rankings based on approved reviews?",
        answer: "Yes. The category uses approved reviews and public brand ratings."
      },
      {
        question: "Should I compare delivery reviews for garden furniture?",
        answer: "Yes. Outdoor furniture can be bulky, so delivery communication and packaging feedback are especially useful."
      },
      {
        question: "Can I report an outdoor furniture review?",
        answer: "Yes. Reviews that appear suspicious or break platform guidelines can be reported for moderation."
      }
    ]
  },
  {
    slug: "home-office-furniture-brands",
    title: "Best Home Office Furniture Brands Reviewed | Customer Ratings & Delivery Feedback",
    description: "Compare home office furniture brands by customer reviews, average ratings, delivery experience, product quality and complaints.",
    h1: "Best Home Office Furniture Brands Reviewed by Customers",
    intro:
      "Compare desks, office chairs and home office furniture brands using approved reviews about comfort, assembly, delivery, service and value.",
    keywords: ["office", "desk", "chair", "home office"],
    related: ["bedroom-furniture-brands", "cheap-furniture-brands", "luxury-furniture-brands"],
    faqs: [
      {
        question: "What should I compare in home office furniture reviews?",
        answer: "Check comfort, stability, assembly instructions, delivery reliability, returns and customer support."
      },
      {
        question: "Do home office rankings include pending reviews?",
        answer: "No. Pending reviews are not used in public category rankings."
      },
      {
        question: "Are office chair and desk brands both included?",
        answer: "Yes, if the brand profile or customer feedback relates to desks, office chairs or home office furniture."
      },
      {
        question: "Why is review count shown alongside rating?",
        answer: "Review count helps shoppers understand how much approved feedback sits behind an average rating."
      }
    ]
  },
  {
    slug: "luxury-furniture-brands",
    title: "Best Luxury Furniture Brands Reviewed | Customer Ratings & Delivery Feedback",
    description: "Compare luxury furniture brands by customer reviews, average ratings, delivery experience, product quality and complaints.",
    h1: "Best Luxury Furniture Brands Reviewed by Customers",
    intro:
      "This page compares luxury and premium furniture brands using approved reviews, ratings and customer feedback about service, quality and delivery.",
    keywords: ["luxury", "premium", "designer", "high-end", "made"],
    related: ["sofa-brands", "dining-table-brands", "bedroom-furniture-brands"],
    faqs: [
      {
        question: "How should I evaluate luxury furniture brands?",
        answer: "Look beyond price and compare product finish, delivery handling, communication, after-sales service and recent customer experiences."
      },
      {
        question: "Do higher prices guarantee better reviews?",
        answer: "No. Ratings are based on customer feedback, and premium brands can still receive mixed reviews."
      },
      {
        question: "Are luxury furniture reviews moderated?",
        answer: "Yes. Reviews are checked before publishing."
      },
      {
        question: "Why might a luxury brand have fewer reviews?",
        answer: "Premium brands may have lower order volumes or fewer customers submitting reviews on the platform."
      }
    ]
  },
  {
    slug: "cheap-furniture-brands",
    title: "Best Cheap Furniture Brands Reviewed | Customer Ratings & Delivery Feedback",
    description: "Compare affordable furniture brands by customer reviews, average ratings, delivery experience, product quality and complaints.",
    h1: "Best Cheap Furniture Brands Reviewed by Customers",
    intro:
      "Compare affordable furniture brands using approved customer reviews about value, product quality, delivery, returns and customer service.",
    keywords: ["cheap", "affordable", "budget", "value", "discount"],
    related: ["sofa-brands", "bedroom-furniture-brands", "home-office-furniture-brands"],
    faqs: [
      {
        question: "Can affordable furniture brands still have good ratings?",
        answer: "Yes. Customers may rate affordable brands highly when delivery, value, quality and service meet expectations."
      },
      {
        question: "What risks should I check with cheap furniture brands?",
        answer: "Read reviews for delivery delays, damaged items, returns, assembly issues and whether product quality matches expectations."
      },
      {
        question: "Are cheap furniture reviews based on approved feedback?",
        answer: "Yes. The public scores use approved reviews only."
      },
      {
        question: "Should I rely only on the average rating?",
        answer: "No. The written reviews give more context about value, quality and service."
      }
    ]
  },
  {
    slug: "uk-furniture-brands",
    title: "Best UK Furniture Brands Reviewed | Customer Ratings & Delivery Feedback",
    description: "Compare UK furniture brands by customer reviews, average ratings, delivery experience, product quality and complaints.",
    h1: "Best UK Furniture Brands Reviewed by Customers",
    intro:
      "This category highlights UK furniture brands and UK-facing furniture retailers using public approved reviews, customer ratings and delivery feedback.",
    keywords: ["uk", "british", "co.uk", "united kingdom"],
    related: ["sofa-brands", "dining-table-brands", "bedroom-furniture-brands"],
    faqs: [
      {
        question: "How are UK furniture brands selected for this category?",
        answer: "Brands may appear when their profile, website or customer feedback indicates a UK furniture focus."
      },
      {
        question: "Are UK furniture brand ratings based on approved reviews?",
        answer: "Yes. Pending and rejected reviews are not included in public ratings."
      },
      {
        question: "What should UK shoppers compare before buying furniture?",
        answer: "Delivery times, product quality, returns, customer service and recent customer feedback are all useful comparison points."
      },
      {
        question: "Can I write a review for a UK furniture brand?",
        answer: "Yes. You can submit a review and it will be checked before publishing."
      }
    ]
  }
];

export const rankingConfigs: RankingConfig[] = [
  {
    slug: "best-furniture-brands",
    title: "Best Furniture Brands Based on Customer Reviews",
    description: "Compare the best rated furniture brands based on customer reviews, average ratings, delivery feedback and product quality.",
    h1: "Best Furniture Brands Based on Customer Reviews",
    intro: "A current ranking of higher rated furniture brands on Furniture Brand Reviews, based on approved customer reviews.",
    mode: "best",
    relatedCategories: ["sofa-brands", "bedroom-furniture-brands", "dining-table-brands"]
  },
  {
    slug: "worst-furniture-brands",
    title: "Lowest Rated Furniture Brands Based on Customer Reviews",
    description: "Compare furniture brands with lower customer ratings based on current approved reviews, delivery feedback and service experiences.",
    h1: "Lowest Rated Furniture Brands Based on Current Approved Reviews",
    intro:
      "A neutral list of brands with lower customer ratings on Furniture Brand Reviews. Ratings can change as new approved reviews are published.",
    mode: "worst",
    relatedCategories: ["cheap-furniture-brands", "uk-furniture-brands", "sofa-brands"]
  },
  {
    slug: "best-sofa-brands",
    title: "Best Sofa Brands Based on Customer Reviews",
    description: "Compare the best rated sofa brands based on customer reviews, average ratings, delivery feedback and product quality.",
    h1: "Best Sofa Brands Based on Customer Reviews",
    intro: "Compare highly rated sofa brands using approved reviews and customer feedback about comfort, delivery and service.",
    mode: "best",
    keywords: ["sofa", "couch", "living room"],
    relatedCategories: ["sofa-brands", "sofa-bed-brands", "luxury-furniture-brands"]
  },
  {
    slug: "best-bedroom-furniture-brands",
    title: "Best Bedroom Furniture Brands Based on Customer Reviews",
    description: "Compare the best rated bedroom furniture brands based on customer reviews, average ratings, delivery feedback and product quality.",
    h1: "Best Bedroom Furniture Brands Based on Customer Reviews",
    intro: "Compare highly rated bedroom furniture brands using approved reviews about beds, wardrobes, storage, delivery and service.",
    mode: "best",
    keywords: ["bedroom", "wardrobe", "storage", "bed"],
    relatedCategories: ["bedroom-furniture-brands", "bed-and-mattress-brands", "cheap-furniture-brands"]
  },
  {
    slug: "best-dining-table-brands",
    title: "Best Dining Table Brands Based on Customer Reviews",
    description: "Compare the best rated dining table brands based on customer reviews, average ratings, delivery feedback and product quality.",
    h1: "Best Dining Table Brands Based on Customer Reviews",
    intro: "Compare highly rated dining table brands using approved reviews about product finish, delivery, packaging and service.",
    mode: "best",
    keywords: ["dining", "table", "chairs"],
    relatedCategories: ["dining-table-brands", "luxury-furniture-brands", "uk-furniture-brands"]
  },
  {
    slug: "best-outdoor-furniture-brands",
    title: "Best Outdoor Furniture Brands Based on Customer Reviews",
    description: "Compare the best rated outdoor furniture brands based on customer reviews, average ratings, delivery feedback and product quality.",
    h1: "Best Outdoor Furniture Brands Based on Customer Reviews",
    intro: "Compare highly rated outdoor furniture brands using approved reviews about garden furniture, delivery, packaging and support.",
    mode: "best",
    keywords: ["outdoor", "garden", "patio", "rattan"],
    relatedCategories: ["outdoor-furniture-brands", "dining-table-brands", "cheap-furniture-brands"]
  },
  {
    slug: "best-furniture-brands-uk",
    title: "Best UK Furniture Brands Based on Customer Reviews",
    description: "Compare the best rated UK furniture brands based on customer reviews, average ratings, delivery feedback and product quality.",
    h1: "Best UK Furniture Brands Based on Customer Reviews",
    intro: "Compare highly rated UK furniture brands and UK-facing retailers using approved customer reviews and public ratings.",
    mode: "best",
    keywords: ["uk", "british", "co.uk", "united kingdom"],
    relatedCategories: ["uk-furniture-brands", "sofa-brands", "bedroom-furniture-brands"]
  }
];

export function getCategoryConfig(slug: string) {
  return categoryConfigs.find((category) => category.slug === slug) ?? null;
}

export function getRankingConfig(slug: string) {
  return rankingConfigs.find((ranking) => ranking.slug === slug) ?? null;
}

export function isPublicCompany(company: Company) {
  return company.status !== "draft" && Boolean(company.slug);
}

export function companyMatchesKeywords(company: Company, keywords?: string[]) {
  if (!keywords?.length) return true;

  const haystack = `${company.name} ${company.slug} ${company.website} ${company.category} ${company.description ?? ""}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

export function getCategoryCompanies(companies: Company[], category: SeoCategoryConfig) {
  return companies.filter((company) => isPublicCompany(company) && companyMatchesKeywords(company, category.keywords));
}

export function getRankingCompanies(companies: Company[], config: RankingConfig, minimumReviewCount = 5) {
  return companies
    .filter(
      (company) =>
        isPublicCompany(company) &&
        companyMatchesKeywords(company, config.keywords) &&
        Number(company.review_count || 0) >= minimumReviewCount &&
        Number(company.average_rating || 0) > 0
    )
    .sort((first, second) => {
      const ratingSort =
        config.mode === "best"
          ? Number(second.average_rating || 0) - Number(first.average_rating || 0)
          : Number(first.average_rating || 0) - Number(second.average_rating || 0);

      return ratingSort || Number(second.review_count || 0) - Number(first.review_count || 0);
    })
    .slice(0, 10);
}
