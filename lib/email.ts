type SendEmailInput = {
  to: string | null | undefined;
  subject: string;
  text: string;
  html: string;
};

type ReviewSubmittedEmailInput = {
  to: string | null | undefined;
  reviewerName: string;
  brandName: string;
};

type ReviewApprovedEmailInput = ReviewSubmittedEmailInput & {
  brandSlug: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeValue(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function renderEmailLayout(content: string) {
  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Furniture Brand Reviews</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f3fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f7f3fb;margin:0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #eadff2;">
            <tr>
              <td style="padding:28px 28px 18px 28px;background:#ffffff;">
                <div style="font-size:22px;line-height:1.2;font-weight:800;color:#8b4aa3;letter-spacing:-0.2px;">Furniture Brand Reviews</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 30px 28px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px;background:#faf7fd;border-top:1px solid #eadff2;">
                <div style="font-size:14px;line-height:1.5;font-weight:700;color:#1f2937;">Furniture Brand Reviews</div>
                <div style="font-size:13px;line-height:1.5;color:#6b7280;">Independent furniture brand reviews worldwide.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmail({ to, subject, text, html }: SendEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!to) {
    console.warn("Email recipient missing, skipped email notification.");
    return false;
  }

  if (!resendApiKey || !from) {
    console.warn("Email env missing, skipped email notification.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        html
      })
    });

    if (!response.ok) {
      console.warn("Resend email notification failed.", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Resend email notification failed.", error);
    return false;
  }
}

export async function sendReviewSubmittedEmail({ to, reviewerName, brandName }: ReviewSubmittedEmailInput) {
  const displayReviewerName = safeValue(reviewerName, "there");
  const displayBrandName = safeValue(brandName, "the brand");
  const safeReviewerName = escapeHtml(displayReviewerName);
  const safeBrandName = escapeHtml(displayBrandName);
  const text = `Hi ${displayReviewerName},

Thank you for submitting your review for ${displayBrandName}.

Your review is now pending moderation. We manually check reviews before publishing to help keep Furniture Brand Reviews useful, fair and trustworthy.

Companies cannot pay to remove reviews.

Furniture Brand Reviews
Independent furniture brand reviews worldwide.`;

  const html = renderEmailLayout(`<h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.2;color:#111827;font-weight:800;">Thanks for your review</h1>
<p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#374151;">Hi ${safeReviewerName},</p>
<p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#374151;">Thank you for submitting your review for <strong style="color:#111827;">${safeBrandName}</strong>.</p>
<p style="margin:0 0 22px 0;font-size:16px;line-height:1.7;color:#374151;">Your review is now pending moderation. We manually check reviews before publishing to help keep Furniture Brand Reviews useful, fair and trustworthy.</p>
<div style="margin:24px 0 0 0;padding:16px 18px;border-radius:14px;background:#f7f3fb;border:1px solid #eadff2;color:#5b2f6d;font-size:15px;line-height:1.6;font-weight:700;">Companies cannot pay to remove reviews.</div>`);

  return sendEmail({
    to,
    subject: "Your review has been submitted",
    text,
    html
  });
}

export async function sendReviewApprovedEmail({ to, reviewerName, brandName, brandSlug }: ReviewApprovedEmailInput) {
  const displayReviewerName = safeValue(reviewerName, "there");
  const displayBrandName = safeValue(brandName, "the brand");
  const safeReviewerName = escapeHtml(displayReviewerName);
  const safeBrandName = escapeHtml(displayBrandName);
  const profileUrl = `https://furniturebrandreviews.com/review/${encodeURIComponent(brandSlug)}`;
  const safeProfileUrl = escapeHtml(profileUrl);
  const text = `Hi ${displayReviewerName},

Your review for ${displayBrandName} has been approved and published.

You can view the brand profile here:
${profileUrl}

Furniture Brand Reviews
Independent furniture brand reviews worldwide.`;

  const html = renderEmailLayout(`<h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.2;color:#111827;font-weight:800;">Your review is now live</h1>
<p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#374151;">Hi ${safeReviewerName},</p>
<p style="margin:0 0 24px 0;font-size:16px;line-height:1.7;color:#374151;">Your review for <strong style="color:#111827;">${safeBrandName}</strong> has been approved and published.</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 22px 0;">
  <tr>
    <td bgcolor="#8b4aa3" style="border-radius:999px;">
      <a href="${safeProfileUrl}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#8b4aa3;color:#ffffff;font-size:15px;line-height:1;font-weight:700;text-decoration:none;">View brand profile</a>
    </td>
  </tr>
</table>`);

  return sendEmail({
    to,
    subject: "Your review has been published",
    text,
    html
  });
}
