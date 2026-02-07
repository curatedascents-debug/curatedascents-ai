import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CuratedAscents - Luxury Adventure Travel",
  description: "Bespoke luxury adventures across Nepal, Tibet, Bhutan, and India. Experience the Himalayas with our expert expedition architects.",
  keywords: ["luxury travel", "Nepal", "Tibet", "Bhutan", "India", "Everest", "trekking", "adventure travel"],
  openGraph: {
    title: "CuratedAscents - Luxury Adventure Travel",
    description: "Bespoke luxury adventures across Nepal, Tibet, Bhutan, and India",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
