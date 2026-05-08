"use client";

import { useState } from "react";
import { ImageLightbox } from "@/components/ImageLightbox";

export function ReviewImageGallery({
  images,
  maxImages = 4,
  variant = "review"
}: {
  images: string[];
  maxImages?: number;
  variant?: "review" | "summary";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const visibleImages = images.slice(0, maxImages);
  const gridClass =
    variant === "summary"
      ? "mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
      : "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4";
  const imageClass =
    variant === "summary"
      ? "h-24 w-full object-cover transition hover:scale-105 sm:h-28"
      : "h-24 w-full object-cover transition hover:scale-105";

  if (visibleImages.length === 0) return null;

  return (
    <>
      <div className={gridClass}>
        {visibleImages.map((imageUrl, index) => (
          <button
            key={`${imageUrl}-${index}`}
            type="button"
            onClick={() => {
              setActiveIndex(index);
              setIsOpen(true);
            }}
            className="block cursor-pointer overflow-hidden rounded-xl border border-line bg-wash text-left"
            aria-label={`Open review photo ${index + 1}`}
          >
            <img
              src={imageUrl}
              alt={`Review photo ${index + 1}`}
              className={imageClass}
              loading="lazy"
            />
          </button>
        ))}
      </div>
      <ImageLightbox
        images={visibleImages}
        initialIndex={activeIndex}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onChange={setActiveIndex}
      />
    </>
  );
}
