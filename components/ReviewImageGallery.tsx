"use client";

import { useState } from "react";
import Image from "next/image";
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
  const imageWrapperClass = variant === "summary" ? "relative block h-24 w-full sm:h-28" : "relative block h-24 w-full";

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
            <span className={imageWrapperClass}>
              <Image
              src={imageUrl}
              alt={`Review photo ${index + 1}`}
                fill
                sizes={variant === "summary" ? "(min-width: 1024px) 16vw, 25vw" : "(min-width: 640px) 25vw, 50vw"}
                className="object-cover transition hover:scale-105"
              />
            </span>
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
