import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Poppins, Dancing_Script } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import RatingButton from "@/components/rating-button";
import { Analytics } from "@vercel/analytics/react";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const dancingScript = Dancing_Script({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-dancing-script",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sweipy",
  description: "Browse, swipe, and download premium reusable website templates, Hero sections, and dashboard interfaces. An app-like feed built for creator communities.",
  keywords: ["frontend", "ui/ux", "web design", "components", "react templates", "tailwindcss inspiration"],
  authors: [{ name: "Sweipy Community" }],
  openGraph: {
    title: "Sweipy - Premium Frontend Component Inspiration",
    description: "Browse, swipe, and share stunning interactive website components and frontend sections.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${dancingScript.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 ${poppins.className}`}>
        <ThemeProvider>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            }
          }} />
          <Navbar />
          <main className="flex-1 w-full flex flex-col">
            {children}
          </main>
          <RatingButton />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
