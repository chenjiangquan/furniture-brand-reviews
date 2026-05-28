import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Cookie policy",
  description:
    "Read the Furniture Brand Reviews cookie policy for website functionality, customer reviews and furniture brand review browsing.",
  path: "/cookie-policy"
});

export default function CookiePolicyPage() {
  return (
    <InfoPage
      title="Cookie policy"
      subtitle="This cookie policy explains how Furniture Brand Reviews may use cookies or similar technologies."
      sections={[
        {
          title: "Essential cookies",
          body: (
            <p>
              Essential cookies may be used to keep the website secure, remember basic settings and support core platform
              functionality.
            </p>
          )
        },
        {
          title: "Analytics and improvement",
          body: (
            <p>
              We may use privacy-conscious analytics to understand how people browse furniture brand reviews and improve
              the website experience.
            </p>
          )
        },
        {
          title: "Your choices",
          body: <p>You can manage cookies through your browser settings. Some website features may rely on essential cookies.</p>
        }
      ]}
    />
  );
}
