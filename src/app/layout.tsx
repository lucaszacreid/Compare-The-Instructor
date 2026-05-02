import type { Metadata } from "next";
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
      <head>
        {/* ============================================================
            Google Tag Manager — replace GTM-XXXXXXX with your GTM ID
            ============================================================ */}
        {/* <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-XXXXXXX');` }} /> */}
      </head>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) — replace GTM-XXXXXXX with your GTM ID */}
        {/* <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX" height="0" width="0" style={{ display: "none", visibility: "hidden" }} /></noscript> */}
        {children}
      </body>
    </html>
  );
}
