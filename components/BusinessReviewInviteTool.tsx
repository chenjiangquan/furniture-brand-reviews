"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { slugifyBrandName } from "@/lib/slug";

const baseUrl = "https://www.furniturebrandreviews.com";

export function BusinessReviewInviteTool() {
  const [brandName, setBrandName] = useState("Your Brand");
  const [brandSlug, setBrandSlug] = useState("your-brand");
  const [message, setMessage] = useState("");

  const links = useMemo(() => {
    const slug = slugifyBrandName(brandSlug || brandName) || "your-brand";
    return {
      reviewPage: `${baseUrl}/review/${slug}`,
      writeReview: `${baseUrl}/review/${slug}/write`
    };
  }, [brandName, brandSlug]);

  const invitationMessage = `Hi, thank you for choosing ${brandName || "our brand"}.

If you have a moment, we would appreciate your honest feedback on Furniture Brand Reviews:
${links.writeReview}

Your review helps other furniture buyers make more informed decisions.`;

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} copied`);
      window.setTimeout(() => setMessage(""), 2200);
    } catch {
      setMessage("Copy failed. Please copy the text manually.");
    }
  }

  return (
    <div className="grid gap-5 rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-ink">Invite customers to review your brand</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Generate neutral links and a message that asks every customer for honest feedback, not only positive reviews.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-ink">Brand name</span>
          <input value={brandName} onChange={(event) => setBrandName(event.target.value)} className="rounded-xl border border-line px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-ink">Brand slug</span>
          <input value={brandSlug} onChange={(event) => setBrandSlug(event.target.value)} className="rounded-xl border border-line px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-3 text-sm">
        <div className="rounded-xl bg-wash p-4">
          <p className="font-bold text-ink">Public review page link</p>
          <p className="mt-1 break-all text-muted">{links.reviewPage}</p>
          <button type="button" onClick={() => copy(links.reviewPage, "Review page link")} className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
            <Copy size={15} />
            Copy link
          </button>
        </div>
        <div className="rounded-xl bg-wash p-4">
          <p className="font-bold text-ink">Write review invitation link</p>
          <p className="mt-1 break-all text-muted">{links.writeReview}</p>
          <button type="button" onClick={() => copy(links.writeReview, "Invitation link")} className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-trust-dark ring-1 ring-line hover:ring-trust">
            <Copy size={15} />
            Copy link
          </button>
        </div>
        <div className="rounded-xl bg-wash p-4">
          <p className="font-bold text-ink">Copy invitation message</p>
          <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-6 text-muted">{invitationMessage}</pre>
          <button type="button" onClick={() => copy(invitationMessage, "Invitation message")} className="mt-3 inline-flex items-center gap-2 rounded-full bg-trust px-4 py-2 font-bold text-white hover:bg-trust-dark">
            <Copy size={15} />
            Copy message
          </button>
        </div>
      </div>
      {message ? <p className="text-sm font-semibold text-trust-dark">{message}</p> : null}
    </div>
  );
}
