"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitFirstReview, submitReview, type ReviewFormState } from "@/lib/actions";

const initialState: ReviewFormState = { ok: false, message: "" };
const maxReviewImageCount = 5;
const maxReviewImageSize = 5 * 1024 * 1024;
const allowedReviewImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

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

export function ReviewForm({ slug, brandName }: { slug?: string; brandName?: string }) {
  const [state, action] = useFormState(slug ? submitReview.bind(null, slug) : submitFirstReview, initialState);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(
    () =>
      selectedImages.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file)
      })),
    [selectedImages]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function syncFileInput(files: File[]) {
    if (!fileInputRef.current) return;
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    fileInputRef.current.files = dataTransfer.files;
  }

  function validateImages(files: File[]) {
    if (files.length > maxReviewImageCount) return "Please upload no more than 5 photos.";

    for (const file of files) {
      if (!allowedReviewImageTypes.has(file.type)) return "Review photos must be JPEG, PNG or WebP images.";
      if (file.size > maxReviewImageSize) return "Each review photo must be 5MB or smaller.";
    }

    return "";
  }

  function handleImageChange(files: FileList | null) {
    const nextImages = Array.from(files ?? []);
    const error = validateImages(nextImages);
    setImageError(error);

    if (error) {
      setSelectedImages([]);
      syncFileInput([]);
      return;
    }

    setSelectedImages(nextImages);
    syncFileInput(nextImages);
  }

  function removeImage(index: number) {
    const nextImages = selectedImages.filter((_, currentIndex) => currentIndex !== index);
    setSelectedImages(nextImages);
    setImageError("");
    syncFileInput(nextImages);
  }

  return (
    <form action={action} encType="multipart/form-data" className="grid gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
      {state.message && (
        <div className={`rounded-xl p-4 text-sm font-semibold ${state.ok ? "bg-purple-50 text-trust-dark" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      )}
      {imageError && <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{imageError}</div>}
      {!slug && (
        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="font-semibold">Brand name</span>
            <input name="brandName" required defaultValue={brandName} className="rounded-xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold">Brand website optional</span>
            <input
              name="brandWebsite"
              type="text"
              inputMode="url"
              placeholder="https://example.com"
              className="rounded-xl border border-line px-4 py-3"
            />
          </label>
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
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="grid min-w-0 gap-2">
          <span className="font-semibold">Name</span>
          <input name="name" required className="w-full max-w-full rounded-xl border border-line px-4 py-3" />
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="font-semibold">Email</span>
          <input name="email" type="email" required className="w-full max-w-full rounded-xl border border-line px-4 py-3" />
        </label>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="grid min-w-0 gap-2">
          <span className="font-semibold">Order number optional</span>
          <input name="orderNumber" className="w-full max-w-full rounded-xl border border-line px-4 py-3" />
        </label>
        <label className="grid min-w-0 gap-2 md:col-span-2">
          <span className="font-semibold">Upload photos optional</span>
          <input
            ref={fileInputRef}
            name="reviewImages"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => handleImageChange(event.target.files)}
            className="block w-full max-w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          <span className="text-xs text-muted">JPEG, PNG or WebP. Up to 5 photos, 5MB each.</span>
        </label>
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {previews.map((preview, index) => (
            <div key={`${preview.name}-${index}`} className="relative overflow-hidden rounded-xl border border-line bg-wash">
              <img src={preview.url} alt={preview.name} className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-ink shadow-sm hover:bg-purple-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <SubmitButton />
    </form>
  );
}
