import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatBlogDate, getPublishedBlogs } from "@/lib/blogs";
import { createSeoMetadata } from "@/lib/seo";

const blogTitle = "Furniture Blog & Reviews | Furniture Brand Reviews";
const blogDescription = "Furniture buying guides, brand comparisons, customer review analysis and home inspiration.";

export function generateMetadata({ searchParams }: { searchParams: { page?: string } }): Metadata {
  return createSeoMetadata({
    title: blogTitle,
    description: blogDescription,
    path: "/blog",
    absoluteTitle: true,
    noindex: Boolean(searchParams.page)
  });
}

const postsPerPage = 9;

export default async function BlogPage({ searchParams }: { searchParams: { page?: string } }) {
  const blogs = await getPublishedBlogs();
  const totalPages = Math.max(1, Math.ceil(blogs.length / postsPerPage));
  const requestedPage = Number.parseInt(searchParams.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1;
  const visibleBlogs = blogs.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  return (
    <div className="bg-white">
      <section className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-wide text-trust-dark">Furniture Brand Reviews Blog</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink md:text-5xl">Furniture reviews, guides and brand insights</h1>
          <p className="mt-4 max-w-3xl leading-7 text-muted">
            Independent articles to help furniture shoppers compare brands, delivery experiences, product quality and customer service.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-10">
        {visibleBlogs.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleBlogs.map((blog) => (
                <article key={blog.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                  {blog.cover_image_url && (
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="block aspect-[16/9] bg-wash bg-cover bg-center"
                      style={{ backgroundImage: `url("${blog.cover_image_url}")` }}
                      aria-label={blog.cover_image_alt || blog.title}
                    />
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wide text-muted">
                      {blog.category && <span className="rounded-full bg-purple-50 px-3 py-1 text-trust-dark">{blog.category}</span>}
                      <time dateTime={blog.published_at ?? blog.created_at}>{formatBlogDate(blog.published_at ?? blog.created_at)}</time>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-ink">
                      <Link href={`/blog/${blog.slug}`} className="hover:text-trust-dark">
                        {blog.title}
                      </Link>
                    </h2>
                    {blog.excerpt && <p className="mt-3 leading-7 text-muted">{blog.excerpt}</p>}
                    <Link href={`/blog/${blog.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-trust-dark">
                      Read article <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-10 flex flex-wrap items-center justify-center gap-3" aria-label="Blog pagination">
                <Link
                  href={currentPage > 2 ? `/blog?page=${currentPage - 1}` : "/blog"}
                  aria-disabled={currentPage === 1}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                    currentPage === 1
                      ? "pointer-events-none border-line text-muted opacity-50"
                      : "border-purple-200 text-trust-dark hover:bg-purple-50"
                  }`}
                >
                  <ArrowLeft size={16} />
                  Previous
                </Link>
                <span className="rounded-full bg-wash px-4 py-2 text-sm font-bold text-ink">
                  Page {currentPage} of {totalPages}
                </span>
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  aria-disabled={currentPage === totalPages}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                    currentPage === totalPages
                      ? "pointer-events-none border-line text-muted opacity-50"
                      : "border-purple-200 text-trust-dark hover:bg-purple-50"
                  }`}
                >
                  Next
                  <ArrowRight size={16} />
                </Link>
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-line bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-ink">No published articles yet</h2>
            <p className="mt-2 text-muted">New furniture brand review guides will appear here soon.</p>
          </div>
        )}
      </section>
    </div>
  );
}
