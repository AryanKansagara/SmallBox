import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmallBox — Enterprise Tools for Small Businesses",
  description: "SmallBox gives small business owners access to IBM-powered AI, analytics, and automation — for free. Build your website, manage finances, and run marketing from one dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0e1a] text-white">
        {children}
      </body>
    </html>
  );
}
