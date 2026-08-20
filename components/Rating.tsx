import { RatingStars, getTrustScoreLabel } from "@/components/RatingStars";

export function Rating({ value, count, size = "small", showLabel = true }: { value: number; count?: number; size?: "small" | "medium" | "large"; showLabel?: boolean }) {
  return (
    <div className="grid gap-1">
      {showLabel ? <p className="text-sm font-bold text-ink">{getTrustScoreLabel(value)}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <RatingStars rating={value} size={size} showValue />
        {typeof count === "number" && <span className="text-sm text-muted">{count} reviews</span>}
      </div>
    </div>
  );
}
