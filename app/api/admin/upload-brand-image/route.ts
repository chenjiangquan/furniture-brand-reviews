import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const bucketName = "brand-logos";
const maxFileSize = 5 * 1024 * 1024;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

function isAlreadyExistsError(message?: string) {
  return Boolean(message?.toLowerCase().includes("already") || message?.toLowerCase().includes("exist"));
}

function getExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName === "jpeg" ? "jpg" : fromName;

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const supabase = getSupabaseAdmin();

  if (!adminPassword) {
    return jsonResponse({ success: false, error: "Admin password is not configured" }, 500);
  }

  if (!supabase) {
    return jsonResponse({ success: false, error: "Supabase service role is not configured" }, 500);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ success: false, error: "Invalid form data" }, 400);
  }

  const password = String(formData.get("password") || request.headers.get("x-admin-password") || "");
  if (password !== adminPassword) {
    return jsonResponse({ success: false, error: "Unauthorized" }, 401);
  }

  const companyId = String(formData.get("companyId") || "");
  if (!companyId) {
    return jsonResponse({ success: false, error: "companyId is required" }, 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonResponse({ success: false, error: "Image file is required" }, 400);
  }

  if (!file.type.startsWith("image/")) {
    return jsonResponse({ success: false, error: "Only image files are allowed" }, 400);
  }

  if (file.size > maxFileSize) {
    return jsonResponse({ success: false, error: "Image must be 5MB or smaller" }, 400);
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("id", companyId)
    .single();

  if (companyError || !company) {
    return jsonResponse({ success: false, error: companyError?.message || "Company not found" }, 404);
  }

  const { error: bucketError } = await supabase.storage.createBucket(bucketName, { public: true });
  if (bucketError && !isAlreadyExistsError(bucketError.message)) {
    return jsonResponse({ success: false, error: bucketError.message }, 500);
  }

  const extension = getExtension(file);
  const path = `${company.slug}-${Date.now()}.${extension}`;
  const imageBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, imageBuffer, {
    contentType: file.type || "image/jpeg",
    upsert: false
  });

  if (uploadError) {
    return jsonResponse({ success: false, error: uploadError.message }, 500);
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(bucketName).getPublicUrl(path);

  const { error: updateError } = await supabase.from("companies").update({ logo_url: publicUrl }).eq("id", company.id);

  if (updateError) {
    return jsonResponse({ success: false, error: updateError.message }, 500);
  }

  return jsonResponse({ success: true, logo_url: publicUrl, companyId: company.id });
}
