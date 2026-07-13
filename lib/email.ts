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

type AdminReviewNotificationInput = {
  brandName: string;
  rating: number;
  title: string;
  reviewerName: string;
  reviewerEmail: string;
  adminUrl?: string;
};

type BusinessClaimEmailInput = {
  to: string | null | undefined;
  contactName: string;
  brandName: string;
};

type BusinessClaimApprovedEmailInput = BusinessClaimEmailInput & {
  loginEmail: string;
  loginUrl?: string;
  passwordResetUrl?: string;
};

type BusinessLoginLinkEmailInput = {
  to: string | null | undefined;
  contactName?: string | null;
  loginUrl: string;
  expiresAt?: string | null;
};

type BusinessPasswordResetEmailInput = {
  to: string | null | undefined;
  resetUrl: string;
  expiresAt?: string | null;
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

export async function sendAdminNewReviewNotificationEmail({
  brandName,
  rating,
  title,
  reviewerName,
  reviewerEmail,
  adminUrl = "https://www.furniturebrandreviews.com/admin/reviews"
}: AdminReviewNotificationInput) {
  const to = process.env.REVIEW_ADMIN_EMAIL || "chenjiangquan123@gmail.com";
  const displayBrandName = safeValue(brandName, "Unknown brand");
  const displayTitle = safeValue(title, "Customer review");
  const displayReviewerName = safeValue(reviewerName, "Unknown reviewer");
  const displayReviewerEmail = safeValue(reviewerEmail, "No email provided");
  const safeBrandName = escapeHtml(displayBrandName);
  const safeTitle = escapeHtml(displayTitle);
  const safeReviewerName = escapeHtml(displayReviewerName);
  const safeReviewerEmail = escapeHtml(displayReviewerEmail);
  const safeAdminUrl = escapeHtml(adminUrl);
  const text = `A new review is waiting for moderation.

Brand: ${displayBrandName}
Rating: ${rating}/5
Title: ${displayTitle}
Reviewer: ${displayReviewerName}
Email: ${displayReviewerEmail}

Open admin reviews:
${adminUrl}`;

  const html = renderEmailLayout(`<h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.2;color:#111827;font-weight:800;">New review waiting for moderation</h1>
<p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#374151;">A new customer review has been submitted and is pending moderation.</p>
<div style="margin:20px 0;padding:16px 18px;border-radius:14px;background:#f7f3fb;border:1px solid #eadff2;color:#374151;font-size:15px;line-height:1.7;">
  <strong>Brand:</strong> ${safeBrandName}<br />
  <strong>Rating:</strong> ${rating}/5<br />
  <strong>Title:</strong> ${safeTitle}<br />
  <strong>Reviewer:</strong> ${safeReviewerName}<br />
  <strong>Email:</strong> ${safeReviewerEmail}
</div>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 22px 0;">
  <tr>
    <td bgcolor="#8b4aa3" style="border-radius:999px;">
      <a href="${safeAdminUrl}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#8b4aa3;color:#ffffff;font-size:15px;line-height:1;font-weight:700;text-decoration:none;">Open review admin</a>
    </td>
  </tr>
</table>`);

  return sendEmail({
    to,
    subject: `New review submitted for ${displayBrandName}`,
    text,
    html
  });
}

export async function sendBusinessClaimSubmittedEmail({ to, contactName, brandName }: BusinessClaimEmailInput) {
  const displayContactName = safeValue(contactName, "there");
  const displayBrandName = safeValue(brandName, "your brand");
  const safeContactName = escapeHtml(displayContactName);
  const safeBrandName = escapeHtml(displayBrandName);
  const text = `Hi ${displayContactName},

Thank you for submitting a business claim for ${displayBrandName}.

Your claim is pending review. We check business claims before enabling dashboard access so brand profiles and customer reviews stay protected.

We will notify you once your claim has been approved.

Furniture Brand Reviews
Independent furniture brand reviews worldwide.`;

  const html = renderEmailLayout(`<h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.2;color:#111827;font-weight:800;">Business claim received</h1>
<p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#374151;">Hi ${safeContactName},</p>
<p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#374151;">Thank you for submitting a business claim for <strong style="color:#111827;">${safeBrandName}</strong>.</p>
<p style="margin:0 0 22px 0;font-size:16px;line-height:1.7;color:#374151;">Your claim is pending review. We check business claims before enabling dashboard access so brand profiles and customer reviews stay protected.</p>
<div style="margin:24px 0 0 0;padding:16px 18px;border-radius:14px;background:#f7f3fb;border:1px solid #eadff2;color:#5b2f6d;font-size:15px;line-height:1.6;font-weight:700;">We will notify you once your claim has been approved.</div>`);

  return sendEmail({
    to,
    subject: "Your business claim has been submitted",
    text,
    html
  });
}

export async function sendBusinessClaimApprovedEmail({ to, contactName, brandName, loginEmail, loginUrl: providedLoginUrl, passwordResetUrl: providedPasswordResetUrl }: BusinessClaimApprovedEmailInput) {
  const displayContactName = safeValue(contactName, "there");
  const displayBrandName = safeValue(brandName, "your brand");
  const displayLoginEmail = safeValue(loginEmail, "your approved business email");
  const safeContactName = escapeHtml(displayContactName);
  const safeBrandName = escapeHtml(displayBrandName);
  const safeLoginEmail = escapeHtml(displayLoginEmail);
  const loginUrl = providedLoginUrl || `https://www.furniturebrandreviews.com/business/login?email=${encodeURIComponent(displayLoginEmail)}`;
  const passwordResetUrl = providedPasswordResetUrl || `https://www.furniturebrandreviews.com/business/reset-password?email=${encodeURIComponent(displayLoginEmail)}`;
  const safeLoginUrl = escapeHtml(loginUrl);
  const safePasswordResetUrl = escapeHtml(passwordResetUrl);
  const text = `Hi ${displayContactName},

Your business claim for ${displayBrandName} has been approved.

Your approved login email is:
${displayLoginEmail}

To set your initial password, use the forgot password flow here:
${passwordResetUrl}

After setting your password, log in here:
${loginUrl}

Inside the dashboard you can manage profile information, reply to approved reviews, copy review invitation links and get widget embed codes.

Furniture Brand Reviews
Independent furniture brand reviews worldwide.`;

  const html = renderEmailLayout(`<h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.2;color:#111827;font-weight:800;">Your business dashboard is ready</h1>
<p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#374151;">Hi ${safeContactName},</p>
<p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#374151;">Your business claim for <strong style="color:#111827;">${safeBrandName}</strong> has been approved.</p>
<div style="margin:20px 0;padding:16px 18px;border-radius:14px;background:#f7f3fb;border:1px solid #eadff2;color:#5b2f6d;font-size:15px;line-height:1.6;">
  <strong>Login email:</strong> ${safeLoginEmail}<br />
  Set your initial password with the forgot password flow before logging in.
</div>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 22px 0;">
  <tr>
    <td bgcolor="#8b4aa3" style="border-radius:999px;">
      <a href="${safePasswordResetUrl}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#8b4aa3;color:#ffffff;font-size:15px;line-height:1;font-weight:700;text-decoration:none;">Set initial password</a>
    </td>
  </tr>
</table>
<p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#374151;">After setting your password, you can log in here: <a href="${safeLoginUrl}" style="color:#8b4aa3;font-weight:700;">Business login</a>.</p>
<p style="margin:0;font-size:15px;line-height:1.7;color:#374151;">Inside the dashboard you can manage profile information, reply to approved reviews, copy review invitation links and get widget embed codes.</p>`);

  return sendEmail({
    to,
    subject: "Your Furniture Brand Reviews business dashboard is ready",
    text,
    html
  });
}

export async function sendBusinessPasswordResetEmail({ to, resetUrl, expiresAt }: BusinessPasswordResetEmailInput) {
  const safeResetUrl = escapeHtml(resetUrl);
  const expiresText = expiresAt ? new Date(expiresAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "2 hours";
  const safeExpiresText = escapeHtml(expiresText);
  const text = `Use this link to set or reset your Furniture Brand Reviews business password:
${resetUrl}

This link expires at ${expiresText}.

Furniture Brand Reviews
Independent furniture brand reviews worldwide.`;

  const html = renderEmailLayout(`<h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.2;color:#111827;font-weight:800;">Set your business password</h1>
<p style="margin:0 0 24px 0;font-size:16px;line-height:1.7;color:#374151;">Use this secure link to set or reset your Furniture Brand Reviews business dashboard password.</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 22px 0;">
  <tr>
    <td bgcolor="#8b4aa3" style="border-radius:999px;">
      <a href="${safeResetUrl}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#8b4aa3;color:#ffffff;font-size:15px;line-height:1;font-weight:700;text-decoration:none;">Set business password</a>
    </td>
  </tr>
</table>
<div style="margin:20px 0 0 0;padding:16px 18px;border-radius:14px;background:#f7f3fb;border:1px solid #eadff2;color:#5b2f6d;font-size:15px;line-height:1.6;font-weight:700;">This link expires at ${safeExpiresText}.</div>`);

  return sendEmail({
    to,
    subject: "Set your Furniture Brand Reviews business password",
    text,
    html
  });
}

export async function sendBusinessLoginLinkEmail({ to, contactName, loginUrl, expiresAt }: BusinessLoginLinkEmailInput) {
  const displayContactName = safeValue(contactName, "there");
  const safeContactName = escapeHtml(displayContactName);
  const safeLoginUrl = escapeHtml(loginUrl);
  const expiresText = expiresAt ? new Date(expiresAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "24 hours";
  const safeExpiresText = escapeHtml(expiresText);
  const text = `Hi ${displayContactName},

Use this secure link to access your Furniture Brand Reviews business dashboard:
${loginUrl}

This link expires at ${expiresText}.

Furniture Brand Reviews
Independent furniture brand reviews worldwide.`;

  const html = renderEmailLayout(`<h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.2;color:#111827;font-weight:800;">Your secure business login link</h1>
<p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#374151;">Hi ${safeContactName},</p>
<p style="margin:0 0 24px 0;font-size:16px;line-height:1.7;color:#374151;">Use this secure link to access your Furniture Brand Reviews business dashboard.</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 22px 0;">
  <tr>
    <td bgcolor="#8b4aa3" style="border-radius:999px;">
      <a href="${safeLoginUrl}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#8b4aa3;color:#ffffff;font-size:15px;line-height:1;font-weight:700;text-decoration:none;">Open business dashboard</a>
    </td>
  </tr>
</table>
<div style="margin:20px 0 0 0;padding:16px 18px;border-radius:14px;background:#f7f3fb;border:1px solid #eadff2;color:#5b2f6d;font-size:15px;line-height:1.6;font-weight:700;">This link expires at ${safeExpiresText}.</div>`);

  return sendEmail({
    to,
    subject: "Your Furniture Brand Reviews business login link",
    text,
    html
  });
}
