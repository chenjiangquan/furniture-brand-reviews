type SupabaseLike = {
  from: (table: string) => {
    select: (columns?: string) => any;
    insert: (payload: Record<string, unknown>) => any;
  };
};

type AutoReplyInput = {
  reviewId: string;
  companyId: string;
  reviewerName?: string | null;
  rating?: number | null;
  reviewTitle?: string | null;
};

function normalizeTemplate(template?: string | null) {
  return (template ?? "").trim();
}

function formatAutoReply(template: string, values: {
  brandName: string;
  reviewerName: string;
  rating: string;
  reviewTitle: string;
}) {
  return template
    .replaceAll("{brandName}", values.brandName)
    .replaceAll("{reviewerName}", values.reviewerName)
    .replaceAll("{rating}", values.rating)
    .replaceAll("{reviewTitle}", values.reviewTitle)
    .trim();
}

export async function createAutoReplyForReview(supabase: SupabaseLike, input: AutoReplyInput) {
  if (!input.reviewId || !input.companyId) return;

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, auto_reply_enabled, auto_reply_template")
    .eq("id", input.companyId)
    .maybeSingle();

  if (companyError) {
    console.warn("Auto reply company lookup skipped", companyError);
    return;
  }

  if (!company?.auto_reply_enabled) return;

  const template = normalizeTemplate(company.auto_reply_template);
  if (!template) return;

  const { data: existingReplies, error: existingReplyError } = await supabase
    .from("company_replies")
    .select("id")
    .eq("review_id", input.reviewId)
    .eq("company_id", input.companyId)
    .limit(1);

  if (existingReplyError) {
    console.warn("Auto reply existing reply lookup skipped", existingReplyError);
    return;
  }

  if (existingReplies?.length) return;

  const reply = formatAutoReply(template, {
    brandName: company.name ?? "the brand",
    reviewerName: input.reviewerName?.trim() || "there",
    rating: input.rating ? String(input.rating) : "",
    reviewTitle: input.reviewTitle?.trim() || ""
  });

  if (reply.length < 3) return;

  const { error: insertError } = await supabase.from("company_replies").insert({
    review_id: input.reviewId,
    company_id: input.companyId,
    reply
  });

  if (insertError) {
    console.warn("Auto reply insert skipped", insertError);
  }
}
