"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentLinkId = searchParams.get("payment_link_id");

  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean;
    bookingReference: string | null;
    error: string | null;
  }>({
    loading: true,
    success: false,
    bookingReference: null,
    error: null,
  });

  useEffect(() => {
    async function checkPaymentStatus() {
      if (!sessionId && !paymentLinkId) {
        setStatus({
          loading: false,
          success: true,
          bookingReference: null,
          error: null,
        });
        return;
      }

      if (sessionId) {
        try {
          const res = await fetch(`/api/payments/status?session_id=${sessionId}`);
          const data = await res.json();

          if (data.success && data.paymentStatus === "paid") {
            setStatus({
              loading: false,
              success: true,
              bookingReference: data.bookingReference,
              error: null,
            });
          } else {
            setStatus({
              loading: false,
              success: false,
              bookingReference: null,
              error: "Payment verification pending",
            });
          }
        } catch {
          setStatus({
            loading: false,
            success: true,
            bookingReference: null,
            error: null,
          });
        }
      } else {
        // Payment link doesn't have instant verification
        setStatus({
          loading: false,
          success: true,
          bookingReference: null,
          error: null,
        });
      }
    }

    checkPaymentStatus();
  }, [sessionId, paymentLinkId]);

  if (status.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700/50 shadow-xl">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>

        {status.bookingReference && (
          <p className="text-slate-400 mb-4">
            Booking Reference: <span className="text-emerald-400 font-mono">{status.bookingReference}</span>
          </p>
        )}

        <p className="text-slate-300 mb-8">
          Thank you for your payment. We have sent a confirmation email with your receipt.
          Our team will be in touch shortly with the next steps for your adventure.
        </p>

        <div className="space-y-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="font-semibold text-emerald-400 mb-2">What happens next?</h3>
            <ul className="text-sm text-slate-300 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">1.</span>
                You'll receive a payment confirmation email
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">2.</span>
                Our team will confirm all supplier bookings
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">3.</span>
                You'll receive your detailed travel documents
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium"
          >
            Return Home
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Questions? Contact us at <a href="mailto:support@curatedascents.com" className="text-emerald-400 hover:underline">support@curatedascents.com</a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
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
      <PaymentSuccessContent />
    </Suspense>
  );
}
