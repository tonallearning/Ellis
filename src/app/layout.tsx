import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { themeInitScript } from "@/components/theme/theme-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tybuilds.tech"),
  title: {
    default: "Ellis — tybuilds",
    template: "%s · Ellis",
  },
  description:
    "Ellis is Ty's portfolio host. A conversation about her work — honest, including when he doesn't know.",
  applicationName: "tybuilds",
  openGraph: {
    title: "Ellis — tybuilds",
    description:
      "A conversation about Ty's work. Honest, including when he doesn't know.",
    url: "/",
    siteName: "tybuilds",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ellis — tybuilds",
    description:
      "A conversation about Ty's work. Honest, including when he doesn't know.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ec" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="ellis-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
