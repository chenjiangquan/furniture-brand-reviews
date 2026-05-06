import Link from "next/link";
import type { ReactNode } from "react";

type InfoSection = {
  title: string;
  body?: ReactNode;
  bullets?: string[];
  cta?: {
    label: string;
    href: string;
  };
};

type InfoPageProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  sections: InfoSection[];
};

export function InfoPage({ eyebrow = "Furniture Brand Reviews", title, subtitle, sections }: InfoPageProps) {
  return (
    <div className="bg-white">
      <section className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-trust-dark">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{subtitle}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-6 px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        {sections.map((section) => (
          <article key={section.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-ink">{section.title}</h2>
            {section.body && <div className="mt-4 space-y-4 text-base leading-7 text-muted">{section.body}</div>}
            {section.bullets && (
              <ul className="mt-5 grid gap-3 text-base leading-7 text-muted">
                {section.bullets.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#A855F7]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {section.cta && (
              <Link
                href={section.cta.href}
                className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-trust-dark"
              >
                {section.cta.label}
              </Link>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
