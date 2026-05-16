import { NextResponse } from "next/server";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";

export async function POST(_request: Request, { params }: { params: { reviewId: string } }) {
  const reviewId = params.reviewId;

  if (!reviewId) {
    return NextResponse.json({ success: false, message: "Review id is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) {
    return NextResponse.json({ success: false, message: "Supabase is not configured." }, { status: 500 });
  }

  const { data: review, error: lookupError } = await supabase
    .from("reviews")
    .select("id, useful_count")
    .eq("id", reviewId)
    .maybeSingle();

  if (lookupError) {
    console.error("Useful review lookup failed", lookupError);
    return NextResponse.json({ success: false, message: lookupError.message }, { status: 500 });
  }

  if (!review) {
    return NextResponse.json({ success: false, message: "Review not found." }, { status: 404 });
  }

  const nextCount = Number(review.useful_count ?? 0) + 1;
  const { data: updatedReview, error: updateError } = await supabase
    .from("reviews")
    .update({ useful_count: nextCount })
    .eq("id", reviewId)
    .select("useful_count")
    .single();

  if (updateError) {
    console.error("Useful review update failed", updateError);
    return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    useful_count: Number(updatedReview?.useful_count ?? nextCount)
  });
}
