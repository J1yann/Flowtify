import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeSwitcher from "@/components/theme-switcher";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Flowtify - Your Spotify Wrapped, Anytime",
  description: "Transform your Spotify listening data into elegant, shareable visual artifacts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ThemeSwitcher />
        {children}
      </body>
    </html>
  );
}
