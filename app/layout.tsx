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
  title: "Crowdventure — A subdomain for every builder",
  description:
    "Claim a subdomain, publish each project at its own slug, and raise pledges on a shared campaign template.",
  openGraph: {
    title: "Crowdventure",
    description:
      "Creator homes and project pages for independent builds. The template is shared. The campaign data is not.",
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