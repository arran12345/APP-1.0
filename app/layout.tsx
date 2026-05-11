import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/ui/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse — Fitness tracker",
  description:
    "A minimalist fitness tracker. Weekly goals, workouts, body metrics and nutrition — without the bloat.",
  applicationName: "Pulse",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pulse",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#F5F0E1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink min-h-dvh antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
