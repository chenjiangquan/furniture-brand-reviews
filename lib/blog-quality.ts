export const autoDraftMinimumWordCount = 1000;
export const minimumAutoDraftInternalLinks = 5;
export const minimumAutoDraftExternalLinks = 1;
export const minimumAutoDraftFaqItems = 4;
export const minimumAutoDraftH2Sections = 4;

export function getPlainTextFromMarkdown(content: string | null | undefined) {
  return (content ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#*_>`~\-[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getWordCount(content: string | null | undefined) {
  const plainText = getPlainTextFromMarkdown(content);
  if (!plainText) return 0;
  return plainText.split(/\s+/).filter(Boolean).length;
}

export function getH2Count(markdown: string | null | undefined) {
  return ((markdown ?? "").match(/^##\s+/gm) ?? []).length;
}

export function getFaqHeadingCount(markdown: string | null | undefined) {
  return ((markdown ?? "").match(/^###\s+/gm) ?? []).length;
}

export function getMarkdownLinks(markdown: string | null | undefined) {
  return Array.from((markdown ?? "").matchAll(/\]\(([^)\s]+)\)/g)).map((match) => match[1]);
}

export function isInternalBlogLink(href: string) {
  if (href.startsWith("/admin") || href.startsWith("/api") || href.startsWith("/business") || href.startsWith("/review/") && href.endsWith("/write")) {
    return false;
  }

  return (
    href.startsWith("/brands") ||
    href.startsWith("/review/") ||
    href.startsWith("/category/") ||
    href.startsWith("/compare/") ||
    href.startsWith("/blog/") ||
    /^\/(best|worst)-/.test(href)
  );
}

export function isExternalReferenceLink(href: string) {
  return /^https?:\/\//i.test(href) && !/furniturebrandreviews\.com/i.test(href);
}

export function getInternalMarkdownLinkCount(markdown: string | null | undefined) {
  return new Set(getMarkdownLinks(markdown).filter(isInternalBlogLink)).size;
}

export function getExternalMarkdownLinkCount(markdown: string | null | undefined) {
  return new Set(getMarkdownLinks(markdown).filter(isExternalReferenceLink)).size;
}

export function getBlogQualityStats(content: string | null | undefined) {
  return {
    wordCount: getWordCount(content),
    h2Count: getH2Count(content),
    faqCount: getFaqHeadingCount(content),
    internalLinkCount: getInternalMarkdownLinkCount(content),
    externalLinkCount: getExternalMarkdownLinkCount(content)
  };
}
