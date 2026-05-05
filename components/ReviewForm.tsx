"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitReview, type ReviewFormState } from "@/lib/actions";

const initialState: ReviewFormState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-trust px-6 py-3 font-bold text-white hover:bg-trust-dark disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Submitting..." : "Submit review"}
    </button>
  );
}

export function ReviewForm({ slug }: { slug: string }) {
  const [state, action] = useFormState(submitReview.bind(null, slug), initialState);

  return (
    <form action={action} className="grid gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
      {state.message && (
        <div className={`rounded-xl p-4 text-sm font-semibold ${state.ok ? "bg-purple-50 text-trust-dark" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      )}
      <label className="grid gap-2">
        <span className="font-semibold">Rating</span>
        <select name="rating" required className="rounded-xl border border-line px-4 py-3">
          <option value="">Choose a rating</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} star{rating === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2">
        <span className="font-semibold">Review title</span>
        <input name="title" required className="rounded-xl border border-line px-4 py-3" />
      </label>
      <label className="grid gap-2">
        <span className="font-semibold">Review content</span>
        <textarea name="content" required rows={7} className="rounded-xl border border-line px-4 py-3" />
      </label>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-semibold">Name</span>
          <input name="name" required className="rounded-xl border border-line px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="font-semibold">Email</span>
          <input name="email" type="email" required className="rounded-xl border border-line px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-semibold">Order number optional</span>
          <input name="orderNumber" className="rounded-xl border border-line px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="font-semibold">Proof image optional</span>
          <input name="proofImage" type="file" accept="image/*" className="rounded-xl border border-line px-4 py-3" />
        </label>
      </div>
      <SubmitButton />
    </form>
  );
}
