import { ChatProvider } from "@/components/homepage/ChatContext";
import Navigation from "@/components/homepage/Navigation";
import Footer from "@/components/homepage/Footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <Navigation />
      <main>{children}</main>
      <Footer />
    </ChatProvider>
  );
}
