import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";

export type BlogStatus = "draft" | "published";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  cover_image_url: string | null;
  category: string | null;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function slugifyBlogTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function formatBlogDate(value: string | null) {
  if (!value) return "Not published";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export function generateExcerpt(content: string, title?: string) {
  const clean = content
    .replace(/[#*_>`~\-[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length > 0) {
    return clean.length > 160 ? `${clean.slice(0, 157).trim()}...` : clean;
  }

  return title ? `Read our latest furniture review guide: ${title}.` : "";
}

export const getPublishedBlogs = cache(async (): Promise<BlogPost[]> => {
  noStore();
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Published blogs lookup failed", error);
    return [];
  }

  return (data ?? []) as BlogPost[];
});

export const getLatestBlogs = cache(async (limit = 4): Promise<BlogPost[]> => {
  noStore();
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Latest blogs lookup failed", error);
    return [];
  }

  return (data ?? []) as BlogPost[];
});

export const getPublishedBlogBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  noStore();
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Published blog lookup failed", error);
    return null;
  }

  return (data as BlogPost | null) ?? null;
});

export async function getAdminBlogs(password: string): Promise<BlogPost[]> {
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return [];

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Admin blogs lookup failed", error);
    return [];
  }

  return (data ?? []) as BlogPost[];
}
