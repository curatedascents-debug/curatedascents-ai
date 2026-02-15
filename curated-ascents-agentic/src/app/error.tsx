"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-luxury-navy flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
          Something Went Wrong
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
          Oops
        </h1>
        <p className="text-white/60 mb-8">
          We encountered an unexpected error. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-8 py-3 border border-luxury-gold/30 text-luxury-gold font-medium rounded-full hover:border-luxury-gold/60 transition-all duration-300"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
