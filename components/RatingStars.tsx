import { Star } from "lucide-react";

const ratingColours: Record<number, string> = {
  5: "#F5B301",
  4: "#F59E0B",
  3: "#F97316",
  2: "#EF4444",
  1: "#DC2626"
};

export function getRatingColour(rating: number) {
  const rounded = Math.max(1, Math.min(5, Math.round(rating)));
  return ratingColours[rounded];
}

const sizeStyles = {
  small: {
    box: "h-[18px] w-[18px]",
    icon: 12,
    text: "text-sm"
  },
  medium: {
    box: "h-[22px] w-[22px]",
    icon: 15,
    text: "text-base"
  },
  large: {
    box: "h-[28px] w-[28px]",
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
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));
  const colour = getRatingColour(rating);
  const styles = sizeStyles[size];

  return (
    <span className="inline-flex items-center gap-2" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span className="inline-flex items-center gap-[2px]">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.box} grid place-items-center rounded-[3px]`}
            style={{ backgroundColor: star <= roundedRating ? colour : "#E5E7EB" }}
          >
            <Star size={styles.icon} fill="#FFFFFF" color="#FFFFFF" strokeWidth={1.8} />
          </span>
        ))}
      </span>
      {showValue && <span className={`${styles.text} font-bold text-ink`}>{rating.toFixed(1)}</span>}
    </span>
  );
}
