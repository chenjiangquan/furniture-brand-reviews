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
  const safeReviewerName = escapeHtml(reviewerName);
  const safeBrandName = escapeHtml(brandName);
  const text = `Hi ${reviewerName},

Thank you for submitting your review for ${brandName}.

Your review is currently pending moderation. We review submissions before publishing to help keep Furniture Brand Reviews useful, fair and trustworthy.

We will notify you once your review has been approved.

Furniture Brand Reviews`;

  return sendEmail({
    to,
    subject: "Your review has been submitted",
    text,
    html: `<p>Hi ${safeReviewerName},</p>
<p>Thank you for submitting your review for ${safeBrandName}.</p>
<p>Your review is currently pending moderation. We review submissions before publishing to help keep Furniture Brand Reviews useful, fair and trustworthy.</p>
<p>We will notify you once your review has been approved.</p>
<p>Furniture Brand Reviews</p>`
  });
}

export async function sendReviewApprovedEmail({ to, reviewerName, brandName, brandSlug }: ReviewApprovedEmailInput) {
  const safeReviewerName = escapeHtml(reviewerName);
  const safeBrandName = escapeHtml(brandName);
  const profileUrl = `https://furniturebrandreviews.com/review/${encodeURIComponent(brandSlug)}`;
  const safeProfileUrl = escapeHtml(profileUrl);
  const text = `Hi ${reviewerName},

Your review for ${brandName} has been approved and published on Furniture Brand Reviews.

You can view the brand profile here:
${profileUrl}

Thank you for helping other furniture shoppers make better decisions.

Furniture Brand Reviews`;

  return sendEmail({
    to,
    subject: "Your review has been published",
    text,
    html: `<p>Hi ${safeReviewerName},</p>
<p>Your review for ${safeBrandName} has been approved and published on Furniture Brand Reviews.</p>
<p>You can view the brand profile here:<br /><a href="${safeProfileUrl}">${safeProfileUrl}</a></p>
<p>Thank you for helping other furniture shoppers make better decisions.</p>
<p>Furniture Brand Reviews</p>`
  });
}
