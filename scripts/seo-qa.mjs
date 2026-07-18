const baseUrl = (process.env.SEO_QA_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const checks = [
  { path: "/", indexable: true },
  { path: "/brands", indexable: true },
  { path: "/blog", indexable: true },
  { path: "/review/weilai-concept", indexable: true },
  { path: "/category/sofa-brands", indexable: true },
  { path: "/best-furniture-brands", indexable: true },
  { path: "/compare/dfs-vs-sofology", indexable: true },
  { path: "/blog/best-furniture-brands-based-on-customer-reviews", indexable: true },
  { path: "/review/weilai-concept/write", indexable: false },
  { path: "/admin/blog", indexable: false },
  { path: "/business/login", indexable: false }
];

function getTag(html, regex) {
  return html.match(regex)?.[1]?.trim() || "";
}

function hasJsonLd(html) {
  return /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i.test(html);
}

function robotsContent(html) {
  return getTag(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i);
}

function isNoIndex(html) {
  return /noindex/i.test(robotsContent(html));
}

async function checkPage({ path, indexable }) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, { redirect: "manual" });
  const contentType = response.headers.get("content-type") || "";
  const html = contentType.includes("text/html") ? await response.text() : "";
  const title = getTag(html, /<title>([^<]+)<\/title>/i);
  const description = getTag(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const canonical = getTag(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i);
  const ogTitle = getTag(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const ogDescription = getTag(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const twitterCard = getTag(html, /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const noindex = isNoIndex(html);

  const errors = [];
  if (response.status !== 200) errors.push(`status ${response.status}`);
  if (!title) errors.push("missing title");
  if (!description) errors.push("missing meta description");
  if (indexable) {
    if (!canonical) errors.push("missing canonical");
    if (!ogTitle) errors.push("missing og:title");
    if (!ogDescription) errors.push("missing og:description");
    if (!twitterCard) errors.push("missing twitter:card");
    if (noindex) errors.push("unexpected noindex");
  } else if (!noindex) {
    errors.push("missing noindex");
  }
  if (canonical && /[?&](utm_|sort=|filter=|page=|ref=)/i.test(canonical)) errors.push(`canonical has parameter: ${canonical}`);

  return {
    path,
    ok: errors.length === 0,
    indexable,
    noindex,
    hasJsonLd: hasJsonLd(html),
    canonical,
    errors
  };
}

async function checkTextFile(path, required) {
  const response = await fetch(`${baseUrl}${path}`);
  const text = await response.text();
  const normalizedText = text.toLowerCase();
  const errors = [];
  if (response.status !== 200) errors.push(`status ${response.status}`);
  for (const item of required) {
    if (!normalizedText.includes(item.toLowerCase())) errors.push(`missing ${item}`);
  }
  return { path, ok: errors.length === 0, errors };
}

async function main() {
  console.log(`SEO QA base URL: ${baseUrl}`);
  const pageResults = [];

  for (const check of checks) {
    pageResults.push(await checkPage(check));
  }

  const fileResults = [
    await checkTextFile("/robots.txt", ["user-agent: *", "sitemap: https://www.furniturebrandreviews.com/sitemap.xml"]),
    await checkTextFile("/sitemap.xml", ["https://www.furniturebrandreviews.com/"])
  ];

  for (const result of [...pageResults, ...fileResults]) {
    const marker = result.ok ? "OK" : "FAIL";
    console.log(`${marker} ${result.path}`);
    if ("canonical" in result && result.canonical) console.log(`  canonical: ${result.canonical}`);
    if ("hasJsonLd" in result) console.log(`  json-ld: ${result.hasJsonLd ? "yes" : "no"} | noindex: ${result.noindex ? "yes" : "no"}`);
    for (const error of result.errors) console.log(`  - ${error}`);
  }

  const failed = [...pageResults, ...fileResults].filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`SEO QA failed: ${failed.length} checks failed.`);
    process.exit(1);
  }

  console.log("SEO QA passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
