import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { formatBlogDate, getPublishedBlogBySlug } from "@/lib/blogs";

const baseUrl = "https://furniturebrandreviews.com";

function safeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getPublishedBlogBySlug(params.slug);
  if (!blog) {
    return {
      title: "Blog article not found"
    };
  }

  const title = blog.seo_title || blog.title;
  const description = blog.seo_description || blog.excerpt || `Read ${blog.title} on Furniture Brand Reviews.`;
  const canonical = `${baseUrl}/blog/${blog.slug}`;

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
      publishedTime: blog.published_at ?? undefined
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: blog.cover_image_url ? [blog.cover_image_url] : ["/logo.png"]
    }
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getPublishedBlogBySlug(params.slug);
  if (!blog) notFound();
  const canonical = `${baseUrl}/blog/${blog.slug}`;
  const description = blog.seo_description || blog.excerpt || `Read ${blog.title} on Furniture Brand Reviews.`;
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.seo_title || blog.title,
    description,
    image: blog.cover_image_url ? [blog.cover_image_url] : [`${baseUrl}/logo.png`],
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
      <JsonLd data={blogJsonLd} />
      <header className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wide text-muted">
            {blog.category && <span className="rounded-full bg-purple-50 px-3 py-1 text-trust-dark">{blog.category}</span>}
            <time dateTime={blog.published_at ?? blog.created_at}>{formatBlogDate(blog.published_at ?? blog.created_at)}</time>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink md:text-5xl">{blog.title}</h1>
          {blog.excerpt && <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{blog.excerpt}</p>}
        </div>
      </header>

      <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6 lg:px-10">
        {blog.cover_image_url && (
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="mb-10 aspect-[16/9] w-full rounded-2xl border border-line object-cover shadow-sm"
          />
        )}

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
              blockquote: ({ children }) => <blockquote className="mb-5 rounded-xl border-l-4 border-trust bg-wash p-4 text-muted">{children}</blockquote>
            }}
          >
            {blog.content || ""}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
