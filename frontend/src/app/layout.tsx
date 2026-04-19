import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIFusion - Multimodal Chat",
  description: "Next-gen AI Aggregator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col transition-colors duration-500 bg-neutral-50 text-black dark:bg-[#0a0a0a] dark:text-white" suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="dark">
              {children}
          </ThemeProvider>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
