import type { SeoLongFormSection } from "@/lib/seo-long-form-content";

export function SeoLongFormSections({ sections }: { sections: SeoLongFormSection[] }) {
  if (!sections.length) return null;

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="grid gap-7">
        {sections.map((section) => (
          <article key={section.heading} className="grid gap-3">
            <h2 className="text-2xl font-bold text-ink">{section.heading}</h2>
            <div className="grid gap-4">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="leading-7 text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
