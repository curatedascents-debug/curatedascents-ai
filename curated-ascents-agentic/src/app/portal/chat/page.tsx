"use client";

import { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import { Loader2 } from "lucide-react";

export default function PortalChatPage() {
  const [clientInfo, setClientInfo] = useState<{ id: number; email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/auth/me")
      .then((res) => res.json())
      .then((data) => setClientInfo({ id: data.id, email: data.email, name: data.name || "" }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <ChatInterface
        isWidget
        portalMode
        clientId={clientInfo?.id}
        clientEmail={clientInfo?.email}
      />
    </div>
  );
}
