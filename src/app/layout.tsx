import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hybrid AI Data Extractor · Automation Console",
  description:
    "Control console for a Python web-scraping + Gemini AI extraction robot with Google Sheets sync.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-[#08090c] font-sans text-slate-200 antialiased selection:bg-emerald-500/30 selection:text-emerald-100">
        {children}
      </body>
    </html>
  );
}
