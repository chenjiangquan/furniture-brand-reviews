import { NextResponse } from "next/server";
import { sendBusinessWidgetFollowUpEmail } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isAuthorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase admin is not configured." }, { status: 500 });
  }

  const { data: claims, error } = await supabase.rpc("claim_due_business_widget_followups", { p_limit: 25 });
  if (error) {
    console.error("Could not claim business widget follow-ups:", error);
    return NextResponse.json({ success: false, error: "Could not load due follow-ups." }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;
  for (const claim of claims ?? []) {
    const emailSent = await sendBusinessWidgetFollowUpEmail({
      to: claim.contact_email,
      contactName: claim.contact_name,
      brandName: claim.brand_name,
      claimId: claim.id
    });
    const nextStatus = emailSent ? "sent" : "failed";
    const { error: updateError } = await supabase
      .from("business_claims")
      .update({
        widget_followup_status: nextStatus,
        widget_followup_sent_at: emailSent ? new Date().toISOString() : null
      })
      .eq("id", claim.id)
      .eq("widget_followup_status", "sending");

    if (updateError) {
      console.error("Could not save business widget follow-up result:", updateError);
      failed += 1;
    } else if (emailSent) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return NextResponse.json({ success: failed === 0, processed: (claims ?? []).length, sent, failed });
}
