import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Respond to reviews",
  "Learn why furniture companies should respond to customer reviews and improve transparency on Furniture Brand Reviews."
);

export default function RespondToReviewsPage() {
  return (
    <InfoPage
      title="Respond to reviews"
      subtitle="Thoughtful responses help furniture companies build trust and show shoppers how customer issues are handled."
      sections={[
        {
          title: "Why responses matter",
          bullets: [
            "Build trust with shoppers comparing furniture companies.",
            "Show how customer service handles delivery, returns and product concerns.",
            "Improve transparency around common customer issues.",
            "Turn customer feedback into clearer service improvements."
          ]
        },
        {
          title: "Future response tools",
          body: <p>Business response features are planned as part of upcoming brand tools.</p>
        }
      ]}
    />
  );
}
