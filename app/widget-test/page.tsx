import Script from "next/script";
import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "External Website Widget Test",
  "Local test page for the Furniture Brand Reviews embeddable carousel widget."
);

const carouselEmbedCode = `<div class="fbr-widget" data-brand="weilai-concept" data-layout="carousel"></div>
<script async src="/widget.js"></script>`;

const microEmbedCode = `<div class="fbr-widget" data-brand="weilai-concept" data-layout="micro"></div>
<script async src="/widget.js"></script>`;

export default function WidgetTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px] rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight">External Website Widget Test</h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          This page simulates a simple external website embedding the Furniture Brand Reviews carousel widget with a
          plain container, light background and locally loaded widget script.
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-bold">Embed code</h2>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800">
            <code>{carouselEmbedCode}</code>
          </pre>
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-bold">Rendered carousel widget</h2>
          <div className="fbr-widget" data-brand="weilai-concept" data-layout="carousel" />
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold">Micro embed code</h2>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800">
            <code>{microEmbedCode}</code>
          </pre>
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-bold">Rendered micro widget</h2>
          <div className="fbr-widget" data-brand="weilai-concept" data-layout="micro" />
        </section>
      </div>

      <Script src="/widget.js" strategy="afterInteractive" />
    </div>
  );
}
