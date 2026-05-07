"use client";

import { useState } from "react";

export function CompanyLogo({ name, logoUrl, size = "md" }: { name: string; logoUrl?: string | null; size?: "sm" | "md" | "lg" }) {
  const [hasImageError, setHasImageError] = useState(false);
  const sizes = {
    sm: "h-11 w-11 text-base md:h-14 md:w-14 md:text-lg",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-xl md:h-24 md:w-24 md:text-2xl"
  };

  if (logoUrl && !hasImageError) {
    return (
      <span className={`${sizes[size]} relative block shrink-0 overflow-hidden rounded-2xl border border-line bg-white`}>
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="h-full w-full object-contain p-2"
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      </span>
    );
  }

  return (
    <span className={`${sizes[size]} grid shrink-0 place-items-center rounded-2xl bg-wash font-bold text-trust-dark ring-1 ring-line`}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
