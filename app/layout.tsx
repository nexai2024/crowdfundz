import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { Devtools } from "./devtools";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jet-brains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CrowdVenture — Back Independence",
  description:
    "CrowdVenture connects software craftspeople with forward-thinking patrons. Back verified solopreneurs, track live build metrics, and unlock insider access before the mainstream.",
  openGraph: {
    title: "CrowdVenture",
    description:
      "Back verified solopreneurs, track live build metrics, and unlock insider access to tools before they hit the mainstream.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
        <Devtools />
      </body>
    </html>
  );
}