import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Truvio AP Automation ROI Calculator",
  description: "Build an AP automation business case in under 5 minutes with NPV, payback period, and scenario comparison.",
  metadataBase: new URL("https://truvio.com"),
  openGraph: {
    title: "Truvio AP Automation ROI Calculator",
    description: "Adjust invoice volume, team size, and payment mix to generate a finance-ready AP automation business case.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
