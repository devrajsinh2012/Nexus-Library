import "./globals.css";
import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Nexus Library",
  description: "A modern library management system built with Next.js",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
