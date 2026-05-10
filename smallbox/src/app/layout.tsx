import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BeamsBackground } from "@/components/ui/beams-background";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fixel",
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
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} dark`}>
      <body className={`min-h-full flex flex-col antialiased ${spaceGrotesk.className}`}>
        <ThemeProvider>
          <BeamsBackground fixed className="min-h-screen">
            {children}
          </BeamsBackground>
        </ThemeProvider>
      </body>
    </html>
  );
}
