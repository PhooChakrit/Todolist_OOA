'use client';

import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./styles/globals.css";
import { SessionProvider } from "next-auth/react";

const NotoSansThai = Noto_Sans_Thai({
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en" className={NotoSansThai.className}>
        <body>{children}</body>
      </html>
    </SessionProvider>
  );
}