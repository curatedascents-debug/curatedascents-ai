import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-luxury-navy flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
          Page Not Found
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-4">
          404
        </h1>
        <p className="text-white/60 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
          >
            Back to Home
          </Link>
          <Link
            href="/blog"
            className="px-8 py-3 border border-luxury-gold/30 text-luxury-gold font-medium rounded-full hover:border-luxury-gold/60 transition-all duration-300"
          >
            Read Our Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
