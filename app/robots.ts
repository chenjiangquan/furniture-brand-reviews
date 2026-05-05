import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "Googlebot",
      allow: "/",
      disallow: "/admin"
    },
    sitemap: "https://www.furniturebrandreviews.com/sitemap.xml"
  };
}
