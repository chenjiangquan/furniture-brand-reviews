import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ companies: [] });

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ companies: [] });

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, slug, category")
    .eq("status", "published")
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(6);

  if (error) {
    console.error("Company search failed:", error);
    return NextResponse.json({ companies: [] }, { status: 500 });
  }

  return NextResponse.json({ companies: data ?? [] });
}
