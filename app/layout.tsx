import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { CookieConsent } from "@/components/cookie-consent"
import { BusinessStructuredData, WebsiteStructuredData } from "@/components/structured-data"
import { SafeConsole } from "@/components/safe-console"
import "./globals.css"

export const metadata: Metadata = {
  title: "ApparelCast - Premium Fashion & Apparel Online Store",
  description: "ApparelCast offers curated fashion and apparel for modern style enthusiasts. Shop the latest trends and timeless pieces with fast delivery nationwide.",
  keywords: "ApparelCast, fashion store, online apparel, clothing store, fashion trends, style, modern fashion, online shopping, apparel store",
  generator: "ApparelCast",
  authors: [{ name: "ApparelCast" }],
  creator: "ApparelCast",
  publisher: "ApparelCast",
  robots: "index, follow",
  metadataBase: new URL('https://apparelcast.shop'),
  alternates: {
    canonical: 'https://apparelcast.shop',
  },
  icons: {
    icon: '/apparelcast.ico',
    shortcut: '/apparelcast.ico',
    apple: '/apparelcast.ico',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apparelcast.shop",
    siteName: "ApparelCast",
    title: "ApparelCast - Premium Fashion & Apparel Online Store",
    description: "Discover curated fashion and apparel at ApparelCast. Shop the latest trends for modern style enthusiasts.",
    images: [
      {
        url: "/apparelcast.svg",
        width: 1200,
        height: 630,
        alt: "ApparelCast - Premium Fashion & Apparel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@apparelcast",
    creator: "@apparelcast",
    title: "ApparelCast - Premium Fashion & Apparel Online Store",
    description: "Discover curated fashion and apparel at ApparelCast. Shop the latest trends for modern style enthusiasts.",
    images: ["/apparelcast.svg"],
  },
  verification: {
    google: "your-google-verification-code-here",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <BusinessStructuredData />
        <WebsiteStructuredData />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <SafeConsole />
          {children}
          <Toaster />
          <Analytics />
          <CookieConsent />
        </Suspense>
      </body>
    </html>
  )
}
