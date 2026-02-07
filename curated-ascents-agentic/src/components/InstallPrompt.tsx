"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);

    if (isiOS) {
      // Show iOS banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa-install-dismissed", String(Date.now()));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
      <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-2xl">
        {showIOSGuide ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Add to Home Screen</h3>
              <button onClick={handleDismiss} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-slate-300 text-xs">
              <p className="flex items-center gap-2">
                <span className="bg-slate-700 rounded px-1.5 py-0.5">1</span>
                Tap the <Share className="w-4 h-4 inline text-blue-400" /> Share button
              </p>
              <p className="flex items-center gap-2">
                <span className="bg-slate-700 rounded px-1.5 py-0.5">2</span>
                Scroll down and tap &quot;Add to Home Screen&quot;
              </p>
              <p className="flex items-center gap-2">
                <span className="bg-slate-700 rounded px-1.5 py-0.5">3</span>
                Tap &quot;Add&quot; to confirm
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">Install CuratedAscents</p>
              <p className="text-slate-400 text-xs">Quick access from your home screen</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                Later
              </button>
              <button
                onClick={handleInstall}
                className="bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-500 transition"
              >
                Install
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
