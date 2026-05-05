import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.furniturebrandreviews.com"),
  title: {
    default: "Furniture Brand Reviews | Real Reviews of Furniture Brands Worldwide",
    template: "%s | Furniture Brand Reviews"
  },
  description:
    "Read real customer reviews of furniture brands worldwide. Compare ratings, delivery experiences, product quality and customer service before buying furniture.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png"
  },
  openGraph: {
    title: "Furniture Brand Reviews | Real Reviews of Furniture Brands Worldwide",
    description:
      "Read real customer reviews of furniture brands worldwide. Compare ratings, delivery experiences, product quality and customer service before buying furniture.",
    url: "https://www.furniturebrandreviews.com",
    siteName: "Furniture Brand Reviews",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Furniture Brand Reviews"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Furniture Brand Reviews | Real Reviews of Furniture Brands Worldwide",
    description:
      "Read real customer reviews of furniture brands worldwide. Compare ratings, delivery experiences, product quality and customer service before buying furniture.",
    images: ["/logo.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
