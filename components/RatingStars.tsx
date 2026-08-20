import { Star } from "lucide-react";

const ratingColours: Record<number, string> = {
  5: "#7C3AED",
  4: "#AF66F2",
  3: "#FFCC00",
  2: "#FF8A00",
  1: "#FF3B30"
};

export function getRatingColour(rating: number) {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  if (safeRating <= 0) return "#E5E7EB";
  const band = safeRating >= 5 ? 5 : Math.max(1, Math.min(4, Math.floor(safeRating)));
  return ratingColours[band];
}

export function getTrustScoreLabel(rating: number) {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  if (safeRating >= 4.3) return "Excellent";
  if (safeRating >= 3.8) return "Great";
  if (safeRating >= 2.8) return "Average";
  if (safeRating >= 1.8) return "Poor";
  if (safeRating > 0) return "Bad";
  return "No rating yet";
}

export function getVisualStarScore(rating: number) {
  const safeRating = Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0;
  return Math.round(safeRating * 2) / 2;
}

const sizeStyles = {
  small: {
    box: "h-[19px] w-[19px]",
    icon: 12,
    text: "text-sm"
  },
  medium: {
    box: "h-[23px] w-[23px]",
    icon: 15,
    text: "text-base"
  },
  large: {
    box: "h-[29px] w-[29px]",
    icon: 19,
    text: "text-lg"
  }
};

export function RatingStars({
  rating,
  size = "medium",
  showValue = false
}: {
  rating: number;
  size?: "small" | "medium" | "large";
  showValue?: boolean;
}) {
  const safeRating = Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0;
  const visualRating = getVisualStarScore(safeRating);
  const colour = getRatingColour(rating);
  const styles = sizeStyles[size];

  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-2" aria-label={`${safeRating.toFixed(1)} out of 5 stars`}>
      <span className="inline-flex shrink-0 items-center gap-[2px]">
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercent = Math.max(0, Math.min(100, (visualRating - (star - 1)) * 100));

          return (
            <span
              key={star}
              className={`${styles.box} relative grid place-items-center overflow-hidden rounded-none border-0 bg-[#E5E7EB]`}
            >
              <Star size={styles.icon} fill="#FFFFFF" color="#FFFFFF" strokeWidth={1.8} />
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fillPercent}%`, backgroundColor: colour }}
                aria-hidden="true"
              >
                <span className={`${styles.box} grid place-items-center border-0`}>
                  <Star size={styles.icon} fill="#FFFFFF" color="#FFFFFF" strokeWidth={1.8} />
                </span>
              </span>
            </span>
          );
        })}
      </span>
      {showValue && <span className={`${styles.text} font-bold text-ink`}>{safeRating.toFixed(1)}</span>}
    </span>
  );
}
