import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "ExFlow CFO ROI Calculator | AP Automation Business Case",
  description: "Build a CFO-ready AP automation business case for ExFlow in Dynamics 365 across cost efficiency, working capital, control, and resource reallocation.",
  metadataBase: new URL("https://truvio.com"),
  openGraph: {
    title: "ExFlow CFO ROI Calculator",
    description: "A scenario-driven AP automation ROI model for CFO discovery and finance sign-off conversations.",
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
