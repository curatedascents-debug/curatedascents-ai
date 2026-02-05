"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const milestoneId = searchParams.get("milestone_id");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700/50 shadow-xl">
        {/* Cancelled Icon */}
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>

        <p className="text-slate-300 mb-8">
          Your payment was cancelled. Don't worry - no charges have been made to your account.
          You can return to complete your payment at any time.
        </p>

        <div className="space-y-4">
          <div className="bg-slate-700/50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-yellow-400 mb-2">Need Help?</h3>
            <p className="text-sm text-slate-300">
              If you experienced any issues during checkout or have questions about your booking,
              our team is here to assist you.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            Return Home
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium"
          >
            Chat With Us
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Contact us at <a href="mailto:support@curatedascents.com" className="text-emerald-400 hover:underline">support@curatedascents.com</a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      }
    >
      <PaymentCancelledContent />
    </Suspense>
  );
}
