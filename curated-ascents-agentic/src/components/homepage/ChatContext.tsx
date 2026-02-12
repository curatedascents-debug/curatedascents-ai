"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import ChatWidget from "./ChatWidget";

interface ChatContextValue {
  openChat: (message?: string) => void;
  toggleChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | undefined>();

  const openChat = useCallback((message?: string) => {
    if (message) setInitialMessage(message);
    setIsChatOpen(true);
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  return (
    <ChatContext.Provider value={{ openChat, toggleChat, closeChat }}>
      {children}
      <ChatWidget isOpen={isChatOpen} onToggle={toggleChat} initialMessage={initialMessage} />
    </ChatContext.Provider>
  );
}
