"use server";

import { revalidatePath } from "next/cache";
import { getBlogCoverAlt, getBlogCoverImageForBlog } from "@/lib/blog-covers";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateExcerpt, slugifyBlogTitle, type BlogStatus } from "@/lib/blogs";

export type BlogActionState = {
  ok: boolean;
  message: string;
};

const initialErrorState: BlogActionState = { ok: false, message: "Something went wrong." };

function validateAdminPassword(password: string) {
  return Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getBlogStatus(formData: FormData): BlogStatus {
  const intent = readString(formData, "intent");
  const status = readString(formData, "status");

  if (intent === "publish") return "published";
  if (intent === "unpublish" || intent === "draft") return "draft";
  return status === "published" ? "published" : "draft";
}

function getSeoDescription(formData: FormData) {
  const seoDescription = readString(formData, "seo_description");
  if (seoDescription) return seoDescription;

  const excerpt = getFinalExcerpt(formData);
  return excerpt ? excerpt.slice(0, 160) : null;
}

function getFinalExcerpt(formData: FormData) {
  const excerpt = readString(formData, "excerpt");
  if (excerpt) return excerpt;

  return generateExcerpt(readString(formData, "content"), readString(formData, "title")) || null;
}

const optionalBlogColumns = [
  "seo_title",
  "seo_description",
  "cover_image_url",
  "cover_image_alt",
  "category",
  "allow_index",
  "needs_review",
  "published_at",
  "updated_at"
] as const;

function isOptionalBlogColumn(column: string): column is (typeof optionalBlogColumns)[number] {
  return optionalBlogColumns.includes(column as (typeof optionalBlogColumns)[number]);
}

function getMissingColumn(message: string) {
  return message.match(/Could not find the '([^']+)' column/i)?.[1] ?? null;
}

async function saveBlogPayload(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  payload: Record<string, string | boolean | null>,
  id: string
) {
  const savePayload = { ...payload };

  for (let attempt = 0; attempt <= optionalBlogColumns.length; attempt += 1) {
    const result = id ? await supabase.from("blogs").update(savePayload).eq("id", id) : await supabase.from("blogs").insert(savePayload);
    if (!result.error) return null;

    const missingColumn = getMissingColumn(result.error.message);
    if (!missingColumn || !isOptionalBlogColumn(missingColumn)) return result.error;

    delete savePayload[missingColumn];
  }

  return { message: "Blog save failed after removing optional columns." };
}

export async function saveBlogPost(_state: BlogActionState, formData: FormData): Promise<BlogActionState> {
  const password = readString(formData, "password");
  if (!validateAdminPassword(password)) return { ok: false, message: "Invalid admin password." };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, message: "Supabase service role is not configured." };

  const id = readString(formData, "id");
  const title = readString(formData, "title");
  const slug = readString(formData, "slug") || slugifyBlogTitle(title);
  const status = getBlogStatus(formData);

  if (!title) return { ok: false, message: "Title is required." };
  if (!slug) return { ok: false, message: "Slug is required." };

  const payload: Record<string, string | boolean | null> = {
    title,
    slug,
    excerpt: getFinalExcerpt(formData),
    content: readString(formData, "content") || null,
    seo_title: readString(formData, "seo_title") || `${title} | Furniture Brand Reviews`,
    seo_description: getSeoDescription(formData),
    cover_image_url: readString(formData, "cover_image_url") || getBlogCoverImageForBlog({ title, slug, category: readString(formData, "category") }),
    cover_image_alt: readString(formData, "cover_image_alt") || getBlogCoverAlt({ title }),
    category: readString(formData, "category") || null,
    allow_index: readString(formData, "allow_index") === "on",
    needs_review: status === "published" ? false : readString(formData, "was_auto_draft") === "true",
    status,
    published_at: status === "published" ? readString(formData, "published_at") || new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  };

  const error = await saveBlogPayload(supabase, payload, id);

  if (error) {
    console.error("Blog save failed", error);
    return { ok: false, message: `Blog save failed: ${error.message}` };
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");

  return {
    ok: true,
    message: status === "published" ? "Blog post published." : "Blog post saved as draft."
  };
}

export async function deleteBlogPost(_state: BlogActionState, formData: FormData): Promise<BlogActionState> {
  const password = readString(formData, "password");
  if (!validateAdminPassword(password)) return { ok: false, message: "Invalid admin password." };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ...initialErrorState, message: "Supabase service role is not configured." };

  const id = readString(formData, "id");
  if (!id) return { ok: false, message: "Blog id is required." };

  const { error } = await supabase.from("blogs").delete().eq("id", id);
  if (error) {
    console.error("Blog delete failed", error);
    return { ok: false, message: `Blog delete failed: ${error.message}` };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");

  return { ok: true, message: "Blog post deleted." };
}
