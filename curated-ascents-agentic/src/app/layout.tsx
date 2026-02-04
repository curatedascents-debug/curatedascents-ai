import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CuratedAscents - Luxury Adventure Travel",
  description: "Bespoke luxury adventures across Nepal, Tibet, Bhutan, and India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}