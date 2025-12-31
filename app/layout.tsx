import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CuratedAscents AI - Luxury Travel",
  description: "AI-Powered Luxury Travel Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {/* TEST HEADER - Simple, will definitely work */}
        <header className="bg-black text-white p-4 shadow">
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">CuratedAscents <span className="text-blue-400">AI</span></h1>
                <p className="text-sm text-gray-300">AI-Powered Luxury Travel</p>
              </div>
              <nav className="space-x-4 hidden md:block">
                <a href="/" className="hover:text-blue-300">Home</a>
                <a href="/ai-generator" className="hover:text-blue-300">AI Generator</a>
                <a href="/contact" className="bg-white text-black px-3 py-1 rounded text-sm">Contact</a>
              </nav>
              <button className="md:hidden">Menu</button>
            </div>
          </div>
        </header>

        <main className="min-h-screen">
          <div className="container mx-auto p-4">
            {children}
          </div>
        </main>

        <footer className="bg-black text-gray-400 p-6">
          <div className="container mx-auto">
            <div className="text-center">
              <p className="font-bold text-white">CuratedAscents AI</p>
              <p className="text-sm mt-2">© 2025 All rights reserved</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
