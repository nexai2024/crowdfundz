import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  title: "Protocol100 — 100 Days. 1 Solo Builder. 0 Venture Capital.",
  description:
    "An open, build-in-public sprint taking indie founders from zero to launched software without outside investment.",
  openGraph: {
    title: "Protocol100 — The 100-Day Public Sprint",
    description:
      "Fuel the build-in-public experiment. Micro-pledges prove solo builders can ship without VC backing.",
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
      </body>
    </html>
  );
}