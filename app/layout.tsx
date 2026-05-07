import type { Metadata } from "next";
import Script from "next/script";
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
        <Script id="hotjar" strategy="afterInteractive">
          {`
(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:6707259,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
`}
        </Script>
      </body>
    </html>
  );
}
