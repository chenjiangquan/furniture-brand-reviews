"use client";

import { Children, type ReactNode, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type LatestReviewsCarouselProps = {
  children: ReactNode;
  count: number;
};

function getVisibleCount() {
  if (typeof window === "undefined") return 1;
  if (window.matchMedia("(min-width: 1280px)").matches) return 4;
  if (window.matchMedia("(min-width: 768px)").matches) return 2;
  return 1;
}

export function LatestReviewsCarousel({ children, count }: LatestReviewsCarouselProps) {
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const updateVisibleCount = () => setVisibleCount(getVisibleCount());
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, count - visibleCount);
  const step = 100 / visibleCount;

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused || maxIndex === 0) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, 4000);

    return () => window.clearInterval(timer);
  }, [isPaused, maxIndex]);

  const goPrevious = () => {
    setIndex((current) => (current <= 0 ? maxIndex : current - 1));
  };

  const goNext = () => {
    setIndex((current) => (current >= maxIndex ? 0 : current + 1));
  };

  return (
    <div
      className="mt-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="-mx-2 overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * step}%)` }}
        >
          {Children.map(children, (child) => (
            <div className="min-w-0 shrink-0 basis-full px-2 md:basis-1/2 xl:basis-1/4">
              {child}
            </div>
          ))}
        </div>
      </div>

      {count > visibleCount ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrevious}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-purple-200 bg-white text-trust-dark shadow-sm transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Previous latest review"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-muted">
            {index + 1} / {maxIndex + 1}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-purple-200 bg-white text-trust-dark shadow-sm transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Next latest review"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
