import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getSiteSettings } from "@/lib/sanity/queries";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: "400",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SipShield — Handcrafted Oak Drink Covers",
  description:
    "Hand-turned oak drink covers that protect your drink in style. Each piece is unique, sustainably sourced, and made in the UK.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const instagramUrl = settings?.socialLinks?.instagram || "https://instagram.com/sipshield";

  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${plusJakarta.variable}`}
    >
      <body>
        <Header />
        {children}
        <Footer instagramUrl={instagramUrl} />
      </body>
    </html>
  );
}
