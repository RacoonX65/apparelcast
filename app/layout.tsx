import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { CookieConsent } from "@/components/cookie-consent"
import { BusinessStructuredData, WebsiteStructuredData } from "@/components/structured-data"
import "./globals.css"

export const metadata: Metadata = {
  title: "CAARL Fashion Store - Premium Women's Fashion in South Africa",
  description: "CAARL Fashion Store offers curated women's fashion, designer sneakers, and luxury perfumes. Shop the latest trends and timeless pieces for South African women. Free delivery nationwide.",
  keywords: "CAARL, CAARL fashion, CAARL fashion store, women's fashion South Africa, designer sneakers, luxury perfumes, South African fashion, online fashion store, women's clothing",
  generator: "CAARL Fashion Store",
  authors: [{ name: "CAARL Fashion Store" }],
  creator: "CAARL Fashion Store",
  publisher: "CAARL Fashion Store",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://caarl.co.za",
    siteName: "CAARL Fashion Store",
    title: "CAARL Fashion Store - Premium Women's Fashion in South Africa",
    description: "Discover curated women's fashion, designer sneakers, and luxury perfumes at CAARL Fashion Store. Shop the latest trends for South African women.",
    images: [
      {
        url: "/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "CAARL Fashion Store - Premium Women's Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@caarl_fashion",
    creator: "@caarl_fashion",
    title: "CAARL Fashion Store - Premium Women's Fashion in South Africa",
    description: "Discover curated women's fashion, designer sneakers, and luxury perfumes at CAARL Fashion Store.",
    images: ["/placeholder.jpg"],
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
          {children}
          <Toaster />
          <Analytics />
          <CookieConsent />
        </Suspense>
      </body>
    </html>
  )
}
