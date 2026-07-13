"use client";

import Image from "next/image";
import { useState } from "react";

export function CompanyLogo({ name, logoUrl, size = "md" }: { name: string; logoUrl?: string | null; size?: "sm" | "md" | "lg" }) {
  const [hasImageError, setHasImageError] = useState(false);
  const sizes = {
    sm: "h-11 w-11 text-base md:h-14 md:w-14 md:text-lg",
    md: "h-14 w-14 text-lg",
    lg: "h-[10rem] w-[10rem] min-h-[10rem] min-w-[10rem] text-2xl md:text-3xl"
  };

  if (logoUrl && !hasImageError) {
    return (
      <span className={`${sizes[size]} relative flex-shrink-0 overflow-hidden rounded-xl border border-line bg-white`}>
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          fill
          sizes={size === "lg" ? "160px" : size === "md" ? "56px" : "56px"}
          className="object-contain"
          onError={() => setHasImageError(true)}
        />
      </span>
    );
  }

  return (
    <span className={`${sizes[size]} flex flex-shrink-0 items-center justify-center rounded-xl bg-wash font-bold text-trust-dark ring-1 ring-line`}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
