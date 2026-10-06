import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Caveat } from "next/font/google";
import { gift } from "@/content/gift";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});
const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const hand = Caveat({ variable: "--font-hand", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: gift.pageTitle,
  description: "",
  robots: { index: false, follow: false },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='4' fill='%23b69b62'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = { themeColor: "#090909" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${hand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
