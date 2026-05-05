import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "CompareTheInstructor — Find Your Perfect Driving Instructor",
  description:
    "We match you with the best local driving instructor tailored to your budget, experience and availability. No guesswork. No wasted lessons.",
  metadataBase: new URL("https://comparetheinstructor.co.uk"),
  openGraph: {
    title: "CompareTheInstructor — Find Your Perfect Driving Instructor",
    description:
      "We match you with the best local driving instructor tailored to your budget, experience and availability. No guesswork. No wasted lessons.",
    url: "https://comparetheinstructor.co.uk",
    siteName: "CompareTheInstructor",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CompareTheInstructor — Find Your Perfect Driving Instructor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CompareTheInstructor — Find Your Perfect Driving Instructor",
    description:
      "We match you with the best local driving instructor tailored to your budget, experience and availability.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className="antialiased">
        {children}

        {/* Google Ads tag — loads on every page */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18002343673"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18002343673');
          `}
        </Script>
      </body>
    </html>
  );
}
