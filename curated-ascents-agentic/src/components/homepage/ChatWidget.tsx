"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minimize2, Phone } from "lucide-react";
import { chatWidgetVariants } from "@/lib/animations";
import ChatInterface from "@/components/ChatInterface";

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  initialMessage?: string;
}

export default function ChatWidget({ isOpen, onToggle, initialMessage }: ChatWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onToggle();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onToggle]);

  // Prevent body scroll when widget is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Chat Button (visible when closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onToggle}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-luxury-gold text-luxury-navy shadow-lg shadow-luxury-gold/20 hover:bg-luxury-gold/90 hover:shadow-luxury-gold/30 transition-all flex items-center justify-center group"
            aria-label="Open chat"
          >
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />

            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-luxury-gold animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (mobile only) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={onToggle}
            />

            {/* Chat Container */}
            <motion.div
              variants={chatWidgetVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className={`fixed z-50 bg-luxury-navy border border-luxury-gold/10 shadow-2xl overflow-hidden
                ${isMinimized
                  ? "bottom-6 right-6 w-80 h-16 rounded-2xl"
                  : "bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[420px] h-full md:h-[600px] md:rounded-2xl"
                }
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-luxury-navy border-b border-luxury-gold/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-luxury-gold animate-pulse" />
                  <div>
                    <h3 className="text-white font-medium text-sm">Expedition Architect</h3>
                    {!isMinimized && (
                      <p className="text-white/50 text-xs">Your Private Expedition Architect</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:+17155054964"
                    className="p-2 text-luxury-gold hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    aria-label="Call an Expert"
                    title="Call an Expert"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onToggle}
                    className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              {!isMinimized && (
                <div className="h-[calc(100%-52px)]">
                  <ChatInterface isWidget initialMessage={initialMessage} />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
