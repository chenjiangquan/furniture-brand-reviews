import { RatingStars } from "@/components/RatingStars";

export function Rating({ value, count, size = "small" }: { value: number; count?: number; size?: "small" | "medium" | "large" }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <RatingStars rating={value} size={size} showValue />
      {typeof count === "number" && <span className="text-sm text-muted">{count} reviews</span>}
    </div>
  );
}
