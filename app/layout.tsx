import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/site-footer";

const Devtools =
  process.env.NODE_ENV === "production"
    ? null
    : dynamic(() => import("./devtools").then((mod) => mod.Devtools));

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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`} data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        <div className="flex-1">{children}</div>
        <SiteFooter />
        {Devtools ? <Devtools /> : null}
      </body>
    </html>
  );
}