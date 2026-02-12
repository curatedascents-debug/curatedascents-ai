"use client";

import { useChatContext } from "./ChatContext";
import type { ReactNode } from "react";

interface ChatButtonProps {
  message?: string;
  className?: string;
  children: ReactNode;
}

export default function ChatButton({ message, className, children }: ChatButtonProps) {
  const { openChat } = useChatContext();

  return (
    <button onClick={() => openChat(message)} className={className}>
      {children}
    </button>
  );
}
