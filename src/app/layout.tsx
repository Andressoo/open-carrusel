import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PaletteProvider } from "@/components/command-palette/PaletteProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Storu Studio · El laboratorio de contenido del comercio colombiano",
  description:
    "1 idea · 1 set coherente · Historia + Carrusel + Reel listos para publicar. Brief al agente · editor unificado · export a Instagram.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      translate="no"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="h-full notranslate" suppressHydrationWarning>
        {children}
        <PaletteProvider />
      </body>
    </html>
  );
}
