import Link from "next/link";
import { BrandCard } from "@/components/BrandCard";
import { getCompanies } from "@/lib/data";

type CategoryPageProps = {
  title: string;
  subtitle: string;
  keywords: string[];
  comparePoints: string[];
};

export async function CategoryPage({ title, subtitle, keywords, comparePoints }: CategoryPageProps) {
  const companies = await getCompanies();
  const loweredKeywords = keywords.map((keyword) => keyword.toLowerCase());
  const matchingCompanies = companies
    .filter((company) =>
      loweredKeywords.some((keyword) =>
        `${company.name} ${company.category} ${company.description ?? ""}`.toLowerCase().includes(keyword)
      )
    )
    .slice(0, 12);

  return (
    <div className="bg-white">
      <section className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-trust-dark">Furniture categories</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-ink">What shoppers compare</h2>
          <ul className="mt-5 grid gap-3 text-base leading-7 text-muted md:grid-cols-2">
            {comparePoints.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#A855F7]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>

        <div className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight text-ink">Related furniture brands</h2>
          {matchingCompanies.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {matchingCompanies.map((company) => (
                <BrandCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-muted">
                More brands for this category are coming soon. Browse all listed furniture companies to compare reviews
                and ratings across the platform.
              </p>
              <Link
                href="/brands"
                className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-trust-dark"
              >
                Browse all brands
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
