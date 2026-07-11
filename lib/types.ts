export type ReviewStatus = "pending" | "approved" | "rejected";

export type Company = {
  id: string;
  name: string;
  slug: string;
  status?: "published" | "draft" | null;
  is_claimed?: boolean | null;
  auto_reply_enabled?: boolean | null;
  auto_reply_template?: string | null;
  website: string;
  category: string;
  description: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  og_image_url?: string | null;
  cover_image_url?: string | null;
  website_screenshot_url?: string | null;
  average_rating: number;
  review_count: number;
  created_at?: string;
  updated_at?: string | null;
  last_review_at?: string | null;
};

export type Review = {
  id: string;
  company_id: string | null;
  pending_brand_name: string | null;
  pending_brand_slug: string | null;
  pending_brand_website?: string | null;
  rating: number;
  title: string;
  content: string;
  reviewer_name: string;
  reviewer_email: string;
  order_number: string | null;
  product_type?: string | null;
  order_month?: string | null;
  delivery_experience?: string | null;
  customer_service_experience?: string | null;
  would_buy_again?: string | null;
  proof_image_url: string | null;
  review_image_urls: string[] | null;
  status: ReviewStatus;
  is_verified: boolean;
  useful_count?: number | null;
  created_at: string;
  companies?: Pick<Company, "name" | "slug"> | null;
};

export type CompanyReply = {
  id: string;
  review_id: string;
  company_id: string;
  reply: string;
  created_at: string;
};

export type ReviewWithReply = Review & {
  company_replies?: CompanyReply[];
};

export type ReviewFlagStatus = "pending" | "reviewed" | "dismissed";

export type ReviewFlag = {
  id: string;
  review_id: string;
  company_id: string;
  reason: string;
  details: string | null;
  reported_by_email: string;
  status: ReviewFlagStatus;
  created_at: string;
  reviewed_at?: string | null;
  reviews?: Pick<Review, "id" | "rating" | "title" | "content" | "reviewer_name" | "reviewer_email" | "created_at"> | null;
  companies?: Pick<Company, "name" | "slug"> | null;
};
