import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Furniture Brand Reviews and our approach to furniture review moderation."
};

export default function AboutPage() {
  return <StaticPage title="About Furniture Brand Reviews" body="Furniture Brand Reviews helps furniture shoppers worldwide compare brands using moderated customer feedback, delivery experiences and ratings." />;
}

function StaticPage({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="mt-5 text-lg leading-8 text-muted">{body}</p>
    </div>
  );
}
