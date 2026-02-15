"use client";

import { useChatContext } from "@/components/homepage/ChatContext";

interface CustomizeButtonProps {
  message: string;
  className?: string;
}

export default function CustomizeButton({ message, className }: CustomizeButtonProps) {
  const { openChat } = useChatContext();

  return (
    <button onClick={() => openChat(message)} className={className}>
      Customize This Journey
    </button>
  );
}
