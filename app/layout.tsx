import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CuratedAscents AI - AI-Powered Luxury Travel",
  description: "Where 25 Years of Global Travel Expertise Meets Artificial Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900`}>
        {/* Header */}
        <header className="bg-black text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo/Title */}
              <div className="flex items-center">
                <a href="/" className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="CuratedAscents AI"
                    width={50}
                    height={50}
                    className="rounded"
                  />
                  <div>
                    <div className="font-bold text-lg">CuratedAscents AI</div>
                    <div className="text-gray-300 text-sm">AI-Powered Luxury Travel</div>
                  </div>
                </a>
              </div>
              
              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="/" className="hover:text-white">Home</a>
                <a href="/about" className="hover:text-white">Expertise</a>
                <a href="/ai-generator" className="hover:text-white">AI Generator</a>
                <a href="/packages/nepal-luxury" className="hover:text-white">Packages</a>
                <a href="/contact" className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100">
                  Start Planning
                </a>
              </nav>
              
              <button className="md:hidden">☰</button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-black text-gray-400 py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="/logo.png"
                    alt="CuratedAscents AI"
                    width={40}
                    height={40}
                  />
                  <div>
                    <div className="text-white font-bold">CuratedAscents AI</div>
                    <div className="text-sm">AI-Powered Luxury Travel</div>
                  </div>
                </div>
                <p className="text-sm">
                  Where 25 Years of Global Travel Expertise Meets Artificial Intelligence
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-3">Platform</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/" className="hover:text-white">Home</a></li>
                  <li><a href="/ai-generator" className="hover:text-white">AI Generator</a></li>
                  <li><a href="/packages/nepal-luxury" className="hover:text-white">Packages</a></li>
                  <li><a href="/about" className="hover:text-white">Expertise</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-3">Services</h3>
                <ul className="space-y-2 text-sm">
                  <li>AI-Powered Itineraries</li>
                  <li>Luxury Travel Curation</li>
                  <li>Corporate Travel Programs</li>
                  <li>Destination Expertise</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-3">Connect</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/contact" className="hover:text-white">Contact</a></li>
                  <li>curatedascents@gmail.com</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
              <p>© {new Date().getFullYear()} CuratedAscents AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}