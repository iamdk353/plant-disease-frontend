import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriNex - Nurturing Digital Growth",
  description: "Transform your farming with real-time digital insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${inter.variable} ${manrope.variable}`}>
      <body className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container flex flex-col min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
