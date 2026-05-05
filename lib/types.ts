export type ReviewStatus = "pending" | "approved" | "rejected";

export type Company = {
  id: string;
  name: string;
  slug: string;
  website: string;
  category: string;
  description: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  og_image_url?: string | null;
  average_rating: number;
  review_count: number;
  created_at?: string;
};

export type Review = {
  id: string;
  company_id: string;
  rating: number;
  title: string;
  content: string;
  reviewer_name: string;
  reviewer_email: string;
  order_number: string | null;
  proof_image_url: string | null;
  status: ReviewStatus;
  is_verified: boolean;
  created_at: string;
  companies?: Pick<Company, "name" | "slug">;
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
