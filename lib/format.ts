export function formatReviewDate(createdAt: string) {
  const date = new Date(createdAt);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) return createdAt;

  const elapsedMs = Date.now() - timestamp;
  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));

  if (elapsedHours < 1) return "just now";
  if (elapsedHours < 24) return `${elapsedHours} ${elapsedHours === 1 ? "hour" : "hours"} ago`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays <= 5) return `${elapsedDays} ${elapsedDays === 1 ? "day" : "days"} ago`;

  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}
