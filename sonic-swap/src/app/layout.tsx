import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClientProviders } from "@/providers/ClientProviders";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sonic Swap",
  description: "Swap tokens on Sonic with zero app fees",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
