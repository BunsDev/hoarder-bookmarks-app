import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/lib/providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getServerAuthSession } from "@/server/auth";
import type { Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hoarder",
  applicationName: "Hoarder",
  description: "Your AI powered second brain",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Hoarder",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerAuthSession();
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
