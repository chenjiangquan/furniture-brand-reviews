import Image from "next/image";

export function CompanyLogo({ name, logoUrl, size = "md" }: { name: string; logoUrl?: string | null; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-11 w-11 text-base",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl"
  };

  if (logoUrl) {
    return (
      <span className={`${sizes[size]} relative block overflow-hidden rounded-2xl border border-line bg-white`}>
        <Image src={logoUrl} alt={`${name} logo`} fill sizes="80px" className="object-contain p-2" />
      </span>
    );
  }

  return (
    <span className={`${sizes[size]} grid shrink-0 place-items-center rounded-2xl bg-wash font-bold text-trust-dark ring-1 ring-line`}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
