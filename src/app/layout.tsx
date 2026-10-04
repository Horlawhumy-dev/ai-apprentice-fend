import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Backdrop from "@/components/ui/Backdrop";
import SiteNav from "@/components/ui/SiteNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Apprentice — Capture → Map → Teach",
    template: "%s · AI Apprentice",
  },
  description:
    "Capture how an expert actually works, turn the session into a reviewable Work Map, then train an apprentice against expert-confirmed rules.",
  applicationName: "AI Apprentice",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eceff8" },
    { media: "(prefers-color-scheme: dark)", color: "#06070e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Backdrop />
        <SiteNav />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
