import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CuratedAscents AI",
  description: "AI-Powered Luxury Travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        {/* Simple Header */}
        <header className="bg-black text-white p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">CuratedAscents <span className="text-blue-400">AI</span></h1>
              <p className="text-sm text-gray-300">Luxury Travel × AI Technology</p>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="/" className="hover:text-blue-300">Home</a>
              <a href="/about" className="hover:text-blue-300">Expertise</a>
              <a href="/ai-generator" className="hover:text-blue-300">AI Generator</a>
              <a href="/contact" className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100">Contact</a>
            </nav>
            <button className="md:hidden text-xl">☰</button>
          </div>
        </header>

        <main className="min-h-screen">
          <div className="max-w-6xl mx-auto p-4">
            {children}
          </div>
        </main>

        {/* Simple Footer */}
        <footer className="bg-black text-gray-400 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">CuratedAscents AI</h3>
                <p className="text-sm">25+ Years Himalayan Expertise × AI Technology</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Services</h4>
                <ul className="text-sm space-y-2">
                  <li>AI-Powered Itineraries</li>
                  <li>Luxury Travel Curation</li>
                  <li>Corporate Travel Programs</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Contact</h4>
                <ul className="text-sm space-y-2">
                  <li>curatedascents@gmail.com</li>
                  <li><a href="/contact" className="hover:text-white">Get in Touch</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
              <p>© {new Date().getFullYear()} CuratedAscents AI</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
