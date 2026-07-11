import type { Metadata } from "next";

export const siteUrl = "https://www.furniturebrandreviews.com";
export const siteName = "Furniture Brand Reviews";
export const defaultShareImage = "/logo.png";

type SeoMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noindex?: boolean;
  absoluteTitle?: boolean;
};

export function absoluteUrl(path: string) {
  return new URL(path || "/", siteUrl).toString();
}

export function createSeoMetadata({
  title,
  description,
  path,
  image = defaultShareImage,
  noindex = false,
  absoluteTitle = false
}: SeoMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = image || defaultShareImage;
  const shareTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title: shareTitle,
      description,
      url: canonical,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: shareTitle
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [imageUrl]
    },
    robots: noindex
      ? {
          index: false,
          follow: true
        }
      : undefined
  };
}

export function createNoIndexMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false
    }
  };
}
