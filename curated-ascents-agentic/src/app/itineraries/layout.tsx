import { ChatProvider } from "@/components/homepage/ChatContext";
import Navigation from "@/components/homepage/Navigation";
import Footer from "@/components/homepage/Footer";

export default function ItinerariesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-luxury-white">
        <Navigation />
        {children}
        <Footer />
      </div>
    </ChatProvider>
  );
}
