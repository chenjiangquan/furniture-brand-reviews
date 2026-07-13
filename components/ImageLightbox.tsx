"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function ImageLightbox({
  images,
  initialIndex,
  open,
  onClose,
  onChange
}: {
  images: string[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  onChange: (index: number) => void;
}) {
  const currentImage = images[initialIndex];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasMultipleImages) {
        onChange((initialIndex - 1 + images.length) % images.length);
      }
      if (event.key === "ArrowRight" && hasMultipleImages) {
        onChange((initialIndex + 1) % images.length);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hasMultipleImages, images.length, initialIndex, onChange, onClose, open]);

  if (!open || !currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image preview"
        className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-900 shadow-sm transition hover:bg-white"
      >
        <X size={22} />
      </button>

      {hasMultipleImages && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onChange((initialIndex - 1 + images.length) % images.length);
          }}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900 shadow-sm transition hover:bg-white"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <div className="relative h-[85vh] w-[90vw]" onClick={(event) => event.stopPropagation()}>
        <Image
          src={currentImage}
          alt="Review photo preview"
          fill
          sizes="90vw"
          className="rounded-xl object-contain shadow-2xl"
        />
      </div>

      {hasMultipleImages && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onChange((initialIndex + 1) % images.length);
          }}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900 shadow-sm transition hover:bg-white"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
