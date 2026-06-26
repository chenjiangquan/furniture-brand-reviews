const endpoint =
  process.env.BLOG_AUTO_DRAFT_ENDPOINT ||
  `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/cron/generate-blog-draft`;

const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("Missing CRON_SECRET. Add it to .env.local before running blog:auto-draft.");
  process.exit(1);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`
  }
});

let payload;
try {
  payload = await response.json();
} catch {
  payload = { success: false, error: await response.text() };
}

console.log(JSON.stringify(payload, null, 2));

if (!response.ok || payload?.success === false) {
  process.exit(payload?.skipped ? 0 : 1);
}
