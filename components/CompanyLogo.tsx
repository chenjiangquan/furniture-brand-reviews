"use client";

import Image from "next/image";
import { useState } from "react";

export function CompanyLogo({
  name,
  logoUrl,
  size = "md",
  preferScreenshotCrop = false
}: {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  preferScreenshotCrop?: boolean;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const cleanLogoUrl = typeof logoUrl === "string" ? logoUrl.trim() : "";
  const initial = name.charAt(0).toUpperCase();
  const sizes = {
    sm: "h-11 w-11 text-base md:h-14 md:w-14 md:text-lg",
    md: "h-14 w-14 text-lg",
    lg: "h-[10rem] w-[10rem] min-h-[10rem] min-w-[10rem] text-2xl md:text-3xl"
  };

  if (cleanLogoUrl && !hasImageError) {
    return (
      <span className={`${sizes[size]} relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-wash`}>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-trust-dark">
          {initial}
        </span>
        <Image
          src={cleanLogoUrl}
          alt={`${name} logo`}
          fill
          unoptimized
          sizes={size === "lg" ? "160px" : size === "md" ? "56px" : "56px"}
          className={preferScreenshotCrop && size !== "lg" ? "object-cover object-left-top" : size === "lg" ? "object-contain" : "object-contain p-1.5"}
          onLoad={(event) => {
            const image = event.currentTarget;
            const ratio = image.naturalWidth / Math.max(1, image.naturalHeight);
            if (image.naturalWidth <= 4 || image.naturalHeight <= 4 || ratio < 0.18) {
              setHasImageError(true);
            }
          }}
          onError={() => setHasImageError(true)}
        />
      </span>
    );
  }

  return (
    <span className={`${sizes[size]} flex flex-shrink-0 items-center justify-center rounded-xl bg-wash font-bold text-trust-dark ring-1 ring-line`}>
      {initial}
    </span>
  );
}
