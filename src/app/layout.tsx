import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "SHANATECH · Mitra Teknologi & Shanatech Academy",
    template: "%s · SHANATECH",
  },
  description: site.description,
  keywords: [
    "Shanatech",
    "jasa pembuatan website Binjai",
    "software house Indonesia",
    "kursus komputer",
    "kursus bahasa Inggris",
    "LKP Binjai",
    "digital agency",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: site.name,
    title: "SHANATECH · Mitra Teknologi & Shanatech Academy",
    description: site.description,
    images: [
      {
        url: "/images/hero-visual.png",
        width: 1280,
        height: 1024,
        alt: "Visual abstrak teknologi SHANATECH",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SHANATECH · Mitra Teknologi & Shanatech Academy",
    description: site.description,
    images: ["/images/hero-visual.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#071426",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
