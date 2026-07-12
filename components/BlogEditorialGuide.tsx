import Link from "next/link";

export function BlogEditorialGuide({ categoryHref }: { categoryHref: string | null }) {
  return (
    <section className="mb-8 rounded-2xl border border-line bg-wash p-6">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-trust-dark">Furniture buying guide</p>
      <h2 className="mt-2 text-2xl font-bold text-ink">How to use this guide</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 ring-1 ring-line">
          <h3 className="font-bold text-ink">Start with review patterns</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use this article to understand common furniture buying themes, then check individual brand review pages for current approved
            customer feedback.
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-line">
          <h3 className="font-bold text-ink">Compare before choosing</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Compare average rating, review count, delivery comments, product quality mentions and customer service experiences before
            ordering large furniture online.
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-line">
          <h3 className="font-bold text-ink">Approved reviews only</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Public ratings, rankings and comparison pages on Furniture Brand Reviews use approved reviews. Pending reviews are not used in
            public SEO data.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/brands" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
          Browse furniture brands
        </Link>
        <Link href="/best-furniture-brands" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
          Best furniture brands
        </Link>
        {categoryHref ? (
          <Link href={categoryHref} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
            Browse categories
          </Link>
        ) : null}
        <Link href="/review-guidelines" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
          Review guidelines
        </Link>
      </div>
    </section>
  );
}
