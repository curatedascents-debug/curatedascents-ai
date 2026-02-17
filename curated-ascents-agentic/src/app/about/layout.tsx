import { ChatProvider } from "@/components/homepage/ChatContext";
import Navigation from "@/components/homepage/Navigation";
import Footer from "@/components/homepage/Footer";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <div className="min-h-screen">
        <Navigation />
        {children}
        <Footer />
      </div>
    </ChatProvider>
  );
}
