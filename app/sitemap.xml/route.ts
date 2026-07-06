import { NextResponse } from "next/server";
import { renderSitemapIndex } from "@/lib/sitemap-data";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const lastmod = new Date().toISOString();
  const xml = renderSitemapIndex([
    { loc: `${siteUrl}/sitemap-pages.xml`, lastmod },
    { loc: `${siteUrl}/sitemap-brands.xml`, lastmod },
    { loc: `${siteUrl}/sitemap-categories.xml`, lastmod },
    { loc: `${siteUrl}/sitemap-compare.xml`, lastmod },
    { loc: `${siteUrl}/sitemap-blog.xml`, lastmod }
  ]);

  return new NextResponse(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600"
    }
  });
}
