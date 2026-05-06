import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "System status",
  description:
    "Check Furniture Brand Reviews system status for the website, review submission, brand pages and admin tools."
};

export default function SystemStatusPage() {
  return (
    <InfoPage
      title="System status"
      subtitle="Current platform status for Furniture Brand Reviews."
      sections={[
        {
          title: "All systems operational",
          bullets: ["Website", "Review submission", "Brand pages", "Admin tools"]
        },
        {
          title: "Status updates",
          body: <p>If an issue affects customer reviews or furniture brand pages, we will update this page when possible.</p>
        }
      ]}
    />
  );
}
