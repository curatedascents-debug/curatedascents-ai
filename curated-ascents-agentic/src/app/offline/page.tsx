"use client";

import CuratedAscentsLogo from "@/components/icons/CuratedAscentsLogo";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <CuratedAscentsLogo className="text-emerald-400 mx-auto mb-6" size={64} />
        <h1 className="text-2xl font-bold text-white mb-2">You&apos;re Offline</h1>
        <p className="text-slate-400 mb-8">
          It looks like you&apos;ve lost your internet connection. Please check your network and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 transition"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
