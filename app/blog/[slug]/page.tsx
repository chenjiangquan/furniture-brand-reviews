import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowRight } from "lucide-react";
import { BlogEditorialGuide } from "@/components/BlogEditorialGuide";
import { JsonLd } from "@/components/JsonLd";
import {
  extractFaqFromMarkdown,
  formatBlogDate,
  getPublishedBlogBySlug,
  getPublishedBlogs,
  getReadingTime,
  shouldIndexBlog
} from "@/lib/blogs";
import { getCompanies } from "@/lib/data";
import {
  getBlogRelatedBrands,
  getBlogRelatedComparisons,
  getIndexableFeaturedComparisonLinks,
  getRelatedCategories,
  getRelatedRankingPages
} from "@/lib/internal-links";
import { buildBreadcrumbSchema, buildFaqSchema, buildGraph } from "@/lib/jsonLd";
import { createNoIndexMetadata, siteUrl } from "@/lib/seo";

const baseUrl = siteUrl;

const categoryLinks: Record<string, string> = {
  sofa: "/sofa-brands",
  sofas: "/sofa-brands",
  dining: "/dining-table-brands",
  bedroom: "/bedroom-furniture-brands",
  outdoor: "/outdoor-furniture",
  garden: "/outdoor-furniture",
  office: "/home-office-furniture"
};

function getCategoryLink(category: string | null) {
  if (!category) return null;
  const lowerCategory = category.toLowerCase();
  const matchedKey = Object.keys(categoryLinks).find((key) => lowerCategory.includes(key));
  return matchedKey ? categoryLinks[matchedKey] : null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getPublishedBlogBySlug(params.slug);
  if (!blog) {
    return createNoIndexMetadata("Blog article not found", "This blog article could not be found.");
  }

  const title = blog.seo_title || blog.title;
  const description = blog.seo_description || blog.excerpt || `Read ${blog.title} on Furniture Brand Reviews.`;
  const canonical = `${baseUrl}/blog/${blog.slug}`;
  const isIndexable = shouldIndexBlog(blog);

  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Furniture Brand Reviews",
      images: blog.cover_image_url ? [{ url: blog.cover_image_url, alt: blog.title }] : [{ url: "/logo.png", alt: "Furniture Brand Reviews" }],
      type: "article",
      publishedTime: blog.published_at ?? undefined,
      modifiedTime: blog.updated_at
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: blog.cover_image_url ? [blog.cover_image_url] : ["/logo.png"]
    },
    robots: isIndexable ? undefined : { index: false, follow: true }
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getPublishedBlogBySlug(params.slug);
  if (!blog) notFound();
  const canonical = `${baseUrl}/blog/${blog.slug}`;
  const description = blog.seo_description || blog.excerpt || `Read ${blog.title} on Furniture Brand Reviews.`;
  const allBlogs = await getPublishedBlogs();
  const companies = await getCompanies();
  const relatedBrands = getBlogRelatedBrands(blog, companies, 5);
  const relatedCategories = getRelatedCategories(`${blog.title} ${blog.category ?? ""} ${blog.excerpt ?? ""} ${blog.content ?? ""}`, 4);
  const relatedComparisons = getBlogRelatedComparisons(blog, companies, 3);
  const fallbackComparisons = relatedComparisons.length > 0 ? [] : await getIndexableFeaturedComparisonLinks(3);
  const visibleComparisonLinks = relatedComparisons.length > 0 ? relatedComparisons : fallbackComparisons;
  const relatedRankings = getRelatedRankingPages(`${blog.title} ${blog.category ?? ""} ${blog.excerpt ?? ""} ${blog.content ?? ""}`, 4);
  const relatedBlogs = allBlogs
    .filter((item) => item.slug !== blog.slug)
    .sort((a, b) => {
      if (blog.category && a.category === blog.category && b.category !== blog.category) return -1;
      if (blog.category && a.category !== blog.category && b.category === blog.category) return 1;
      return new Date(b.published_at ?? b.created_at).getTime() - new Date(a.published_at ?? a.created_at).getTime();
    })
    .slice(0, 3);
  const faqSchema = buildFaqSchema(extractFaqFromMarkdown(blog.content));
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: `${baseUrl}/` },
    { name: "Furniture Blog", url: `${baseUrl}/blog` },
    { name: blog.title, url: canonical }
  ]);
  const categoryLink = getCategoryLink(blog.category);
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.seo_title || blog.title,
    description,
    ...(blog.cover_image_url
      ? {
          image: {
            "@type": "ImageObject",
            url: blog.cover_image_url,
            caption: blog.cover_image_alt || blog.title
          }
        }
      : {}),
    datePublished: blog.published_at ?? blog.created_at,
    dateModified: blog.updated_at,
    author: {
      "@type": "Organization",
      name: "Furniture Brand Reviews",
      url: baseUrl
    },
    publisher: {
      "@type": "Organization",
      name: "Furniture Brand Reviews",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical
    }
  };

  return (
    <article className="bg-white">
      <JsonLd data={buildGraph([blogJsonLd, faqSchema, breadcrumbSchema])} />
      <header className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wide text-muted">
            {blog.category && <span className="rounded-full bg-purple-50 px-3 py-1 text-trust-dark">{blog.category}</span>}
            <time dateTime={blog.published_at ?? blog.created_at}>{formatBlogDate(blog.published_at ?? blog.created_at)}</time>
            <span>{getReadingTime(blog.content)}</span>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink md:text-5xl">{blog.title}</h1>
          {blog.excerpt && <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{blog.excerpt}</p>}
          <dl className="mt-6 grid gap-3 rounded-2xl border border-line bg-white p-4 text-sm text-muted sm:grid-cols-3">
            <div>
              <dt className="font-bold text-ink">Author</dt>
              <dd>Furniture Brand Reviews</dd>
            </div>
            <div>
              <dt className="font-bold text-ink">Published</dt>
              <dd>{formatBlogDate(blog.published_at ?? blog.created_at)}</dd>
            </div>
            <div>
              <dt className="font-bold text-ink">Updated</dt>
              <dd>{formatBlogDate(blog.updated_at)}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6 lg:px-10">
        {blog.cover_image_url && (
          <img
            src={blog.cover_image_url}
            alt={blog.cover_image_alt || blog.title}
            className="mb-10 aspect-[16/9] w-full rounded-2xl border border-line object-cover shadow-sm"
          />
        )}

        <BlogEditorialGuide categoryHref={categoryLink} />

        <div className="rounded-2xl border border-line bg-white p-6 leading-8 text-ink shadow-sm md:p-8">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h2 className="mb-4 mt-8 text-3xl font-bold text-ink first:mt-0">{children}</h2>,
              h2: ({ children }) => <h2 className="mb-4 mt-8 text-2xl font-bold text-ink first:mt-0">{children}</h2>,
              h3: ({ children }) => <h3 className="mb-3 mt-6 text-xl font-bold text-ink">{children}</h3>,
              p: ({ children }) => <p className="mb-5 text-muted">{children}</p>,
              ul: ({ children }) => <ul className="mb-5 list-disc space-y-2 pl-6 text-muted">{children}</ul>,
              ol: ({ children }) => <ol className="mb-5 list-decimal space-y-2 pl-6 text-muted">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              a: ({ children, href }) => (
                <a href={href} className="font-semibold text-trust-dark underline underline-offset-4">
                  {children}
                </a>
              ),
              img: ({ alt, src }) => (
                <img
                  src={src ?? ""}
                  alt={alt || blog.title}
                  className="mb-6 w-full rounded-2xl border border-line object-cover shadow-sm"
                />
              ),
              blockquote: ({ children }) => <blockquote className="mb-5 rounded-xl border-l-4 border-trust bg-wash p-4 text-muted">{children}</blockquote>
            }}
          >
            {blog.content || ""}
          </ReactMarkdown>
        </div>

        <section className="mt-8 rounded-2xl border border-line bg-wash p-6">
          <h2 className="text-2xl font-bold text-ink">Explore related furniture reviews</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/brands" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
              Browse all furniture brands
            </Link>
            <Link href="/write-review" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
              Write a furniture review
            </Link>
            {categoryLink ? (
              <Link href={categoryLink} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
                Explore {blog.category} brands
              </Link>
            ) : null}
            <Link href="/blog" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
              More furniture guides
            </Link>
          </div>
        </section>

        {(relatedBrands.length > 0 || relatedCategories.length > 0 || relatedRankings.length > 0 || visibleComparisonLinks.length > 0) ? (
          <section className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Related review pages</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {relatedBrands.length > 0 ? (
                <div>
                  <h3 className="font-bold text-ink">Related brands</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {relatedBrands.map((brand) => (
                      <Link key={brand.slug} href={`/review/${brand.slug}`} className="rounded-full bg-wash px-3 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {relatedCategories.length > 0 ? (
                <div>
                  <h3 className="font-bold text-ink">Related categories</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {relatedCategories.map((category) => (
                      <Link key={category.href} href={category.href} className="rounded-full bg-wash px-3 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
                        {category.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {visibleComparisonLinks.length > 0 ? (
                <div>
                  <h3 className="font-bold text-ink">Related comparisons</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {visibleComparisonLinks.map((comparison) => (
                      <Link key={comparison.href} href={comparison.href} className="rounded-full bg-wash px-3 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
                        {comparison.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {relatedRankings.length > 0 ? (
                <div>
                  <h3 className="font-bold text-ink">Related rankings</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {relatedRankings.map((ranking) => (
                      <Link key={ranking.href} href={ranking.href} className="rounded-full bg-wash px-3 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
                        {ranking.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {relatedBlogs.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-ink">Related articles</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {relatedBlogs.map((relatedBlog) => (
                <Link
                  key={relatedBlog.id}
                  href={`/blog/${relatedBlog.slug}`}
                  className="rounded-2xl border border-line bg-white p-5 shadow-sm hover:border-trust"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-trust-dark">
                    {relatedBlog.category || "Furniture guide"}
                  </p>
                  <h3 className="mt-3 text-lg font-bold leading-tight text-ink">{relatedBlog.title}</h3>
                  {relatedBlog.excerpt ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{relatedBlog.excerpt}</p> : null}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-trust-dark">
                    Read article <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
