import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Saarway — Pakistan's First Livestock ERP & Marketplace",
  description:
    "Manage your farm digitally and connect with buyers across Pakistan. Farm. Track. Thrive.",
  icons: {
    icon: "/images/logo-icon-v2.png",
    apple: "/images/logo-icon-v2.png",
  },
  openGraph: {
    title: "Saarway — Pakistan's First Livestock ERP & Marketplace",
    description:
      "Manage your farm digitally and connect with buyers across Pakistan. Farm. Track. Thrive.",
    type: "website",
    url: "https://saarway.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saarway — Pakistan's First Livestock ERP & Marketplace",
    description:
      "Manage your farm digitally and connect with buyers across Pakistan.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
