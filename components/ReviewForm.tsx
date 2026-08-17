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

const productTypes = [
  "Sofa",
  "Sofa bed",
  "Dining table",
  "Bed / mattress",
  "Wardrobe / storage",
  "Outdoor furniture",
  "Office furniture",
  "Other"
];

const deliveryOptions = ["On time", "Delayed", "Damaged on arrival", "Not delivered yet", "Not applicable"];
const serviceOptions = ["Helpful", "Slow response", "No response", "Not contacted", "Not applicable"];
const buyAgainOptions = ["Yes", "Maybe", "No"];

export function ReviewForm({ slug, brandName, invitationToken }: { slug?: string; brandName?: string; invitationToken?: string }) {
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
      {invitationToken ? <input type="hidden" name="invitationToken" value={invitationToken} /> : null}
      <label className="hidden" aria-hidden="true">
        <span>Review website</span>
        <input name="reviewWebsite" tabIndex={-1} autoComplete="off" />
      </label>
      {state.message && (
        <div className={`rounded-xl p-4 text-sm font-semibold ${state.ok ? "bg-purple-50 text-trust-dark" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      )}
      {invitationToken ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold leading-6 text-green-800">
          You are using a verified invitation link. Your review will still be checked before publication.
        </div>
      ) : null}
      {imageError && <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{imageError}</div>}
      {!slug && (
        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="font-semibold">Brand name</span>
            <input name="brandName" required defaultValue={brandName} className="rounded-xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold">Brand website</span>
            <input
              name="brandWebsite"
              type="text"
              inputMode="url"
              required
              placeholder="https://example.com"
              className="rounded-xl border border-line px-4 py-3"
            />
          </label>
        </div>
      )}
      <label className="grid gap-2">
        <span className="font-semibold">Overall rating</span>
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
        <input
          name="title"
          required
          minLength={5}
          placeholder="Summarise your furniture buying experience"
          className="rounded-xl border border-line px-4 py-3"
        />
      </label>
      <label className="grid gap-2">
        <span className="font-semibold">Review content</span>
        <textarea
          name="content"
          required
          minLength={50}
          rows={7}
          placeholder="What product did you buy? How was delivery? Was the product quality as expected? How was customer service? Would you buy from this brand again?"
          className="rounded-xl border border-line px-4 py-3"
        />
        <span className="text-xs leading-5 text-muted">Please write at least 50 characters and include useful details for other furniture buyers.</span>
      </label>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="grid min-w-0 gap-2">
          <span className="font-semibold">Display name</span>
          <input name="name" required className="w-full max-w-full rounded-xl border border-line px-4 py-3" />
          <span className="text-xs text-muted">Shown publicly with your review.</span>
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="font-semibold">Email</span>
          <input name="email" type="email" required className="w-full max-w-full rounded-xl border border-line px-4 py-3" />
          <span className="text-xs text-muted">Used for moderation and spam prevention. Your email is not shown publicly.</span>
        </label>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="grid min-w-0 gap-2">
          <span className="font-semibold">Product type optional</span>
          <select name="productType" className="w-full max-w-full rounded-xl border border-line px-4 py-3">
            <option value="">Choose a product type</option>
            {productTypes.map((productType) => (
              <option key={productType} value={productType}>
                {productType}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="font-semibold">Order month optional</span>
          <input name="orderMonth" type="month" className="w-full max-w-full rounded-xl border border-line px-4 py-3" />
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="font-semibold">Delivery experience optional</span>
          <select name="deliveryExperience" className="w-full max-w-full rounded-xl border border-line px-4 py-3">
            <option value="">Choose an option</option>
            {deliveryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="font-semibold">Customer service optional</span>
          <select name="customerServiceExperience" className="w-full max-w-full rounded-xl border border-line px-4 py-3">
            <option value="">Choose an option</option>
            {serviceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="font-semibold">Would buy again optional</span>
          <select name="wouldBuyAgain" className="w-full max-w-full rounded-xl border border-line px-4 py-3">
            <option value="">Choose an option</option>
            {buyAgainOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
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
              {/* eslint-disable-next-line @next/next/no-img-element -- Object URL previews are local browser blobs, not remote page assets. */}
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
      <label className="flex items-start gap-3 rounded-xl border border-line bg-wash p-4 text-sm font-semibold text-ink">
        <input
          name="confirmedGenuineExperience"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-line text-trust focus:ring-2 focus:ring-purple-200"
        />
        <span>I confirm this review is based on my genuine experience.</span>
      </label>
      <SubmitButton />
    </form>
  );
}
