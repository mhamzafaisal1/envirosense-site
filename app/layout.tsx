import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EnviroSense: crop recommendations from a soil test",
  description:
    "A live Random Forest model that recommends crops from soil nutrients and climate, with an explainable field check. Research from Valparaiso University.",
  openGraph: {
    title: "EnviroSense: crop recommendations from a soil test",
    description:
      "Try the live model: soil nutrients and climate in, crop recommendation and field check out.",
    images: ["/og-envirosense.svg"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
