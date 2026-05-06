import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Privacy choices",
  description:
    "Manage privacy choices for Furniture Brand Reviews, including personal data requests linked to customer reviews and furniture company feedback."
};

export default function PrivacyChoicesPage() {
  return (
    <InfoPage
      title="Privacy choices"
      subtitle="You can contact Furniture Brand Reviews about personal data connected with reviews or platform enquiries."
      sections={[
        {
          title: "Your choices",
          bullets: [
            "Ask us to review personal information connected with a submitted review.",
            "Request correction or deletion of personal data where applicable.",
            "Ask questions about how review contact details are used for moderation."
          ]
        },
        {
          title: "Contact support",
          body: (
            <p>
              Email <a className="font-semibold text-trust-dark" href="mailto:support@furniturebrandreviews.com">support@furniturebrandreviews.com</a>{" "}
              for privacy choices and data requests.
            </p>
          )
        }
      ]}
    />
  );
}
