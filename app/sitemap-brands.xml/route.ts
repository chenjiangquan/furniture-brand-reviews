import { NextResponse } from "next/server";
import { getBrandSitemapEntries, renderUrlSet } from "@/lib/sitemap-data";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const xml = renderUrlSet(await getBrandSitemapEntries());
  return new NextResponse(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600"
    }
  });
}
