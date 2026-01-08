import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CuratedAscents AI | Himalayan Luxury Travel, Powered by AI",
  description: "Combining 28+ years of Himalayan expertise with enterprise-grade AI to deliver bespoke luxury journeys. Founded by Kiran Pokhrel.",
  keywords: "luxury travel, himalayan tours, AI travel planning, Nepal luxury, Bhutan tours, Tibet expeditions",
  authors: [{ name: "Kiran Pokhrel" }],
  openGraph: {
    title: "CuratedAscents AI | Himalayan Luxury Reimagined by AI",
    description: "28+ years of Himalayan expertise meets enterprise-grade AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
        {/* Enhanced Header */}
        <header className="luxury-gradient text-white sticky top-0 z-50 shadow-2xl">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              {/* Logo Section */}
              <div className="flex items-center gap-4">
                <img
                  src="/logo.png"
                  alt="CuratedAscents AI Logo"
                  className="h-14 w-14 md:h-16 md:w-16 rounded-lg shadow-lg"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">CuratedAscents <span className="text-cyan-300">AI</span></h1>
                  <p className="text-xs md:text-sm text-blue-200">
                    Himalayan Luxury • AI-Powered
                  </p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                <a href="/" className="hover:text-cyan-300 transition duration-300 font-medium">
                  Home
                </a>
                <a href="/about" className="hover:text-cyan-300 transition duration-300 font-medium">
                  Expertise
                </a>
                <a href="/ai-generator" className="hover:text-cyan-300 transition duration-300 font-medium">
                  AI Generator
                </a>
                <a href="/packages/nepal-luxury" className="hover:text-cyan-300 transition duration-300 font-medium">
                  Signature Journeys
                </a>
                <a 
                  href="/contact" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold shadow-lg"
                >
                  Start Planning
                </a>
              </nav>
              
              {/* Mobile Menu Button */}
              <button className="md:hidden text-2xl hover:text-cyan-300 transition">
                ☰
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Enhanced Footer */}
        <footer className="luxury-gradient text-gray-300 pt-12 pb-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Column 1 - Brand */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src="/logo-footer.png"
                    alt="CuratedAscents AI Logo"
                    className="h-12 w-12 rounded"
                  />
                  <div>
                    <p className="text-white font-bold text-lg">CuratedAscents AI</p>
                    <p className="text-sm text-blue-300">AI-Powered Luxury Travel</p>
                  </div>
                </div>
                <p className="text-sm">
                  Where 28+ years of Himalayan expertise meets enterprise-grade AI to redefine luxury travel.
                </p>
              </div>
              
              {/* Column 2 - Platform */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Platform</h3>
                <ul className="space-y-2">
                  <li><a href="/" className="hover:text-cyan-300 transition">Home</a></li>
                  <li><a href="/ai-generator" className="hover:text-cyan-300 transition">AI Generator</a></li>
                  <li><a href="/packages/nepal-luxury" className="hover:text-cyan-300 transition">Signature Journeys</a></li>
                  <li><a href="/about" className="hover:text-cyan-300 transition">Founder Expertise</a></li>
                </ul>
              </div>
              
              {/* Column 3 - Destinations */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Destinations</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Nepal Luxury Tours
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Bhutan Cultural Journeys
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Tibet Expeditions
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Himalayan Luxury
                  </li>
                </ul>
              </div>
              
              {/* Column 4 - Contact */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Connect</h3>
                <ul className="space-y-2">
                  <li><a href="/contact" className="hover:text-cyan-300 transition">Contact Kiran</a></li>
                  <li>kiran@curatedascents.com</li>
                  <li>Carmel, IN • Kathmandu, NP</li>
                  <li className="mt-4">
                    <span className="text-sm text-blue-300">US-Based AI • Nepal-Based Execution</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm">
                  © {new Date().getFullYear()} CuratedAscents AI. All rights reserved.
                </p>
                <div className="flex gap-6 mt-4 md:mt-0 text-sm">
                  <a href="/privacy" className="hover:text-cyan-300 transition">Privacy</a>
                  <a href="/terms" className="hover:text-cyan-300 transition">Terms</a>
                  <span className="text-blue-400">AI-Powered Luxury Travel Platform</span>
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-4">
                Founded by Kiran Pokhrel • 28+ Years Himalayan Expertise • Enterprise IT Background
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}