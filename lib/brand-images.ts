export type BrandImageCandidates = {
  logoUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
};

function absolutizeUrl(value: string | null, website: string) {
  if (!value) return null;
  try {
    return new URL(value, website).toString();
  } catch {
    return null;
  }
}

function findMetaContent(html: string, property: string) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  return html.match(pattern)?.[1] ?? null;
}

function findLinkHref(html: string, relPattern: RegExp) {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const link of links) {
    const rel = link.match(/\brel=["']([^"']+)["']/i)?.[1] ?? "";
    const href = link.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "";
    if (relPattern.test(rel) && href) return href;
  }
  return null;
}

function findLogoImage(html: string) {
  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  for (const image of images) {
    const alt = image.match(/\balt=["']([^"']+)["']/i)?.[1] ?? "";
    const src = image.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? "";
    if (src && /logo|brand/i.test(`${alt} ${src}`)) return src;
  }
  return null;
}

export async function getBrandImageCandidates(website: string): Promise<BrandImageCandidates> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(website, {
      signal: controller.signal,
      headers: { "user-agent": "FurnitureBrandReviewsBot/1.0" }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { logoUrl: null, faviconUrl: absolutizeUrl("/favicon.ico", website), ogImageUrl: null };
    }

    const html = await response.text();
    const favicon = findLinkHref(html, /icon/i) ?? "/favicon.ico";
    const ogImage = findMetaContent(html, "og:image");
    const logo = findLogoImage(html);

    return {
      logoUrl: absolutizeUrl(logo, website),
      faviconUrl: absolutizeUrl(favicon, website),
      ogImageUrl: absolutizeUrl(ogImage, website)
    };
  } catch {
    return {
      logoUrl: null,
      faviconUrl: absolutizeUrl("/favicon.ico", website),
      ogImageUrl: null
    };
  }
}
