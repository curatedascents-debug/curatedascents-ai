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
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="bg-gray-50">
        {/* Header with 192×192 Logo */}
        <header className="bg-black text-white p-4 shadow-lg">
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              {/* Logo Section */}
              <div className="flex items-center gap-4">
                <img
                  src="/logo.png"  // 192×192
                  alt="CuratedAscents AI Logo"
                  className="h-16 w-16 md:h-20 md:w-20" // 64px mobile, 80px desktop
                  style={{ display: 'block' }}
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">CuratedAscents <span className="text-blue-400">AI</span></h1>
                  <p className="text-sm text-gray-300">AI-Powered Luxury Travel</p>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="/" className="hover:text-blue-300 transition">Home</a>
                <a href="/about" className="hover:text-blue-300 transition">Expertise</a>
                <a href="/ai-generator" className="hover:text-blue-300 transition">AI Generator</a>
                <a href="/packages/nepal-luxury" className="hover:text-blue-300 transition">Packages</a>
                <a href="/contact" className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium">
                  Start Planning
                </a>
              </nav>
              <button className="md:hidden text-xl">☰</button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>

        {/* Footer with 160×160 Logo */}
        <footer className="bg-black text-gray-400 py-8">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Footer Column 1 - with logo-footer.png */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/logo-footer.png"  // 160×160
                    alt="CuratedAscents AI Logo"
                    className="h-12 w-12"  // 48px display
                  />
                  <div>
                    <p className="text-white font-bold text-lg">CuratedAscents AI</p>
                    <p className="text-sm">AI-Powered Luxury Travel</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Where 25 Years of Global Travel Expertise Meets Artificial Intelligence
                </p>
              </div>
              
              {/* Footer Column 2 */}
              <div>
                <h3 className="text-white font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/" className="hover:text-white transition">Home</a></li>
                  <li><a href="/ai-generator" className="hover:text-white transition">AI Generator</a></li>
                  <li><a href="/packages/nepal-luxury" className="hover:text-white transition">Packages</a></li>
                  <li><a href="/about" className="hover:text-white transition">Expertise</a></li>
                </ul>
              </div>
              
              {/* Footer Column 3 */}
              <div>
                <h3 className="text-white font-semibold mb-4">Destinations</h3>
                <ul className="space-y-2 text-sm">
                  <li>Nepal Luxury Tours</li>
                  <li>Bhutan Cultural Journeys</li>
                  <li>Tibet Expedition</li>
                  <li>Global Luxury Travel</li>
                </ul>
              </div>
              
              {/* Footer Column 4 */}
              <div>
                <h3 className="text-white font-semibold mb-4">Connect</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/contact" className="hover:text-white transition">Contact Us</a></li>
                  <li>curatedascents@gmail.com</li>
                  <li>Corporate Programs</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
              <p>© {new Date().getFullYear()} CuratedAscents AI. All rights reserved.</p>
              <p className="mt-2">AI-Powered Luxury Travel Platform</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}