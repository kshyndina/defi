import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SEO } from "@/components/seo/SEO";
import { StructuredData } from "@/components/seo/StructuredData";
import { Header } from "@/components/news/Header";
import { Footer } from "@/components/news/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DUF - Crypto Security News",
  description:
    "Minimalistic crypto security news website covering hacks, scams, and security incidents in the cryptocurrency space",
  keywords: [
    "crypto",
    "security",
    "hacks",
    "scams",
    "blockchain",
    "bitcoin",
    "ethereum",
  ],
  authors: [{ name: "DUF" }],
  openGraph: {
    title: "DUF - Crypto Security News",
    description:
      "Minimalistic crypto security news website covering hacks, scams, and security incidents",
    url: "https://degennews.com",
    siteName: "DUF",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DUF - Crypto Security News",
    description:
      "Minimalistic crypto security news website covering hacks, scams, and security incidents",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <SEO />
        <StructuredData type="website" data={{}} />
        {/* Favicon */}
        <link rel="icon" href="/favicon_defi.jpg" sizes="any" />
        <link
          rel="icon"
          href="/favicon_defi.jpg"
          type="image/jpg"
          sizes="32x32"
        />
        <link
          rel="icon"
          href="/favicon_defi.jpg"
          type="image/jpg"
          sizes="16x16"
        />
        <link
          rel="apple-touch-icon"
          href="/favicon_defi.jpg"
          sizes="180x180"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Android Chrome */}
        <link rel="icon" href="/favicon_defi.jpg" sizes="192x192" />
        <link rel="icon" href="/favicon_defi.jpg" sizes="512x512" />

        {/* Preload critical resources */}

        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.google.com" />

        {/* Preload key assets */}
        <link rel="preload" href="/favicon_defi.jpg" as="image" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          as="style"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          />
        </noscript>

        {/* Performance hints */}
        <meta httpEquiv="X-DNS-Prefetch-Control" content="on" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />

        {/* Security headers */}
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta
          httpEquiv="Referrer-Policy"
          content="strict-origin-when-cross-origin"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden`}
      >
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
