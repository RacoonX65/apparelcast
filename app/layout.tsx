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
import { CartWishlistProvider } from "@/contexts/cart-wishlist-context"
import { FloatingWhatsApp } from "@/components/floating-whatsapp"
import "./globals.css"

export const metadata: Metadata = {
  title: "ApparelCast - Curated Fashion & Style Destination",
  description: "Discover premium fashion at ApparelCast. Shop curated collections of designer clothing, statement sneakers, and luxury fragrances. Your style destination in South Africa.",
  keywords: "ApparelCast fashion, designer clothing, luxury fashion, statement sneakers, premium fragrances, South African fashion, curated style, fashion destination, trendy apparel",
  generator: "ApparelCast",
  authors: [{ name: "ApparelCast" }],
  creator: "ApparelCast",
  publisher: "ApparelCast",
  robots: "index, follow, max-image-preview:large",
  metadataBase: new URL('https://apparelcast.shop'),
  alternates: {
    canonical: 'https://apparelcast.shop',
  },
  icons: {
    icon: ['/apparelcast.ico', '/favicon.ico'],
    shortcut: ['/apparelcast.ico', '/favicon.ico'],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apparelcast.shop",
    siteName: "ApparelCast",
    title: "ApparelCast - Curated Fashion & Style Destination",
    description: "Discover premium fashion at ApparelCast. Shop curated collections of designer clothing, statement sneakers, and luxury fragrances.",
    images: [
      {
        url: "/apparelcast.png",
        width: 1200,
        height: 630,
        alt: "ApparelCast - Premium Fashion & Apparel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@apparel_cast",
    creator: "@apparel_cast",
    title: "ApparelCast - Curated Fashion & Style Destination",
    description: "Discover premium fashion at ApparelCast. Shop curated collections of designer clothing, statement sneakers, and luxury fragrances.",
    images: ["/apparelcast.png"],
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
        <CartWishlistProvider>
          <Suspense fallback={null}>
            <SafeConsole />
            {children}
            <FloatingWhatsApp />
            <Toaster />
            <Analytics />
            <CookieConsent />
          </Suspense>
        </CartWishlistProvider>
      </body>
    </html>
  )
}
