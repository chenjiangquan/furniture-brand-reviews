import { cache } from "react";
import { unstable_cache, unstable_noStore as noStore } from "next/cache";
import { getPlainTextFromMarkdown, getWordCount } from "@/lib/blog-quality";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";

export { getPlainTextFromMarkdown, getWordCount } from "@/lib/blog-quality";

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
  cover_image_alt?: string | null;
  category: string | null;
  status: BlogStatus;
  allow_index?: boolean | null;
  generated_by?: string | null;
  generation_topic?: string | null;
  generation_notes?: string | null;
  needs_review?: boolean | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogAutoDraftLog = {
  id: string;
  ran_at: string;
  status: "success" | "failed" | "skipped";
  topic_type: string | null;
  topic_title: string | null;
  slug: string | null;
  message: string | null;
};

export const blogIndexWordThreshold = 500;

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

export function getReadingTime(content: string | null | undefined) {
  const minutes = Math.max(1, Math.ceil(getWordCount(content) / 220));
  return `${minutes} min read`;
}

export function shouldIndexBlog(blog: Pick<BlogPost, "content" | "allow_index">) {
  return Boolean(blog.allow_index) || getWordCount(blog.content) >= blogIndexWordThreshold;
}

export function extractFaqFromMarkdown(content: string | null | undefined) {
  const lines = (content ?? "").split(/\r?\n/);
  const faqStartIndex = lines.findIndex((line) => /^#{2,3}\s+faqs?\s*$/i.test(line.trim()));
  if (faqStartIndex === -1) return [];

  const faqs: Array<{ question: string; answer: string }> = [];
  let currentQuestion = "";
  let currentAnswer: string[] = [];

  function flushFaq() {
    const answer = getPlainTextFromMarkdown(currentAnswer.join(" "));
    if (currentQuestion && answer) {
      faqs.push({
        question: currentQuestion,
        answer
      });
    }
    currentQuestion = "";
    currentAnswer = [];
  }

  for (const line of lines.slice(faqStartIndex + 1)) {
    const trimmed = line.trim();
    if (/^#{1,2}\s+/.test(trimmed) && !/^#{3,6}\s+/.test(trimmed)) break;

    const questionMatch = trimmed.match(/^#{3,6}\s+(.+)/);
    if (questionMatch) {
      flushFaq();
      currentQuestion = getPlainTextFromMarkdown(questionMatch[1]);
      continue;
    }

    if (currentQuestion && trimmed) currentAnswer.push(trimmed);
  }

  flushFaq();
  return faqs;
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

export const getIndexablePublishedBlogs = cache(async (): Promise<BlogPost[]> => {
  const blogs = await getPublishedBlogs();
  return blogs.filter((blog) => blog.slug && blog.content && shouldIndexBlog(blog));
});

async function fetchLatestBlogs(limit = 4): Promise<BlogPost[]> {
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
}

export const getLatestBlogs = cache(async (limit = 4): Promise<BlogPost[]> => {
  noStore();
  return fetchLatestBlogs(limit);
});

const getCachedHomepageLatestBlogs = unstable_cache(
  async () => fetchLatestBlogs(4),
  ["homepage-latest-blogs-v1"],
  { revalidate: 300 }
);

export const getHomepageLatestBlogs = cache(async (): Promise<BlogPost[]> => {
  return getCachedHomepageLatestBlogs();
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

export async function getAdminBlogAutoDraftLogs(password: string, limit = 20): Promise<BlogAutoDraftLog[]> {
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return [];

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_auto_draft_logs")
    .select("id, ran_at, status, topic_type, topic_title, slug, message")
    .order("ran_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Blog auto draft logs lookup skipped", error.message);
    return [];
  }

  return (data ?? []) as BlogAutoDraftLog[];
}
