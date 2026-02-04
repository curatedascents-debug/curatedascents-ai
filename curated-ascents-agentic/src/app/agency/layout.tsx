"use client";

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Theme will be loaded dynamically on the dashboard page
  // This keeps the layout simple and avoids server-side issues
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
