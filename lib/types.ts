export type ReviewStatus = "pending" | "approved" | "rejected";

export type Company = {
  id: string;
  name: string;
  slug: string;
  status?: "published" | "draft" | null;
  is_claimed?: boolean | null;
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
};

export type Review = {
  id: string;
  company_id: string | null;
  pending_brand_name: string | null;
  pending_brand_slug: string | null;
  rating: number;
  title: string;
  content: string;
  reviewer_name: string;
  reviewer_email: string;
  order_number: string | null;
  proof_image_url: string | null;
  review_image_urls: string[] | null;
  status: ReviewStatus;
  is_verified: boolean;
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
