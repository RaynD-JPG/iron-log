import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IronLog",
  description: "Track your workout splits, sets, reps and weight over time.",
  // Enables full-screen, app-like behavior when added to the iOS home screen.
  appleWebApp: {
    capable: true,
    title: "IronLog",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  // Let content extend into the safe areas so env(safe-area-inset-*) works
  // for the notch and home-indicator on iPhone.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      {/* min-h-dvh = dynamic viewport height: tracks the real visible area as
          the mobile address bar shows/hides, avoiding gaps and cut-off content. */}
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
