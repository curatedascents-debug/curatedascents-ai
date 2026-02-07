import Link from "next/link";
import CuratedAscentsLogo from "@/components/icons/CuratedAscentsLogo";

interface StaticPageLayoutProps {
  children: React.ReactNode;
}

export default function StaticPageLayout({ children }: StaticPageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <CuratedAscentsLogo className="text-emerald-400" size={28} />
            <span className="text-lg font-serif font-bold text-white">CuratedAscents</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} CuratedAscents. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-slate-300 transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
