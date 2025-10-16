import Link from "next/link"
import Image from "next/image"
import { Instagram, Facebook, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Brand Name - Centered */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            ApparelCast
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Effortless Style Modern South African Women's Fashion</p>
        </div>

        {/* Four Column Layout - Desktop / Two Row Layout - Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {/* Shop With Us */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Shop With Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products?filter=new" className="hover:text-foreground transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?category=clothing" className="hover:text-foreground transition-colors">
                  Clothing
                </Link>
              </li>
              <li>
                <Link href="/products?category=sneakers" className="hover:text-foreground transition-colors">
                  Sneakers
                </Link>
              </li>
              <li>
                <Link href="/products?category=perfumes" className="hover:text-foreground transition-colors">
                  Perfumes
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Customer Service</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-foreground transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-foreground transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Connect With Us</h4>
            <div className="space-y-3">
              {/* Support Email */}
              <a
                href="mailto:support@apparelcast.shop"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="bg-primary p-2 rounded-lg">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <span>Support Email</span>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/apparelcastsa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-2 rounded-lg">
                  <Instagram className="h-4 w-4 text-white" />
                </div>
                <span>@apparelcastsa</span>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/apparelcastsa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Facebook className="h-4 w-4 text-white" />
                </div>
                <span>@apparelcastsa</span>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://twitter.com/apparel_cast"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="bg-black p-2 rounded-lg">
                  <Twitter className="h-4 w-4 text-white" />
                </div>
                <span>@apparel_cast</span>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@apparel_cast"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="bg-gray-900 p-2 rounded-lg">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16.5 3c.3 1.9 1.7 3.5 3.5 4v3.1c-1.9-.1-3.7-.8-5.2-2v6.5c0 3.3-2.7 6-6 6-1.6 0-3-.6-4.1-1.6C3.6 17.8 3 16.4 3 14.9c0-3.3 2.7-6 6-6 .5 0 1 .1 1.5.2v3.4c-.4-.2-.9-.3-1.5-.3-1.8 0-3.2 1.5-3.2 3.2s1.4 3.2 3.2 3.2c1.8 0 3.2-1.5 3.2-3.2V3h3.3z"/>
                  </svg>
                </div>
                <span>@apparel_cast</span>
              </a>
            </div>
          </div>
        </div>

        {/* Payment Gateway Section */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Paystack Gateway */}
            <div className="text-center md:text-left">
              <h3 className="text-base font-semibold mb-2">Secure Payments Powered by</h3>
              <div className="flex justify-center md:justify-start">
                <div className="bg-white p-2 rounded-lg shadow-md">
                  <Image
                    src="/paystack_logo.png"
                    alt="Paystack - Secure Payment Gateway"
                    width={90}
                    height={36}
                    className="h-9 w-auto"
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="text-center md:text-right">
              <h4 className="text-base font-semibold mb-2">Accepted Payment Methods</h4>
              <div className="flex flex-wrap justify-center md:justify-end items-center gap-2">
                <div className="bg-white p-1.5 rounded shadow-sm">
                  <Image
                    src="/Visa.svg"
                    alt="Visa"
                    width={45}
                    height={24}
                    className="h-6 w-auto"
                  />
                </div>
                <div className="bg-white p-1.5 rounded shadow-sm">
                  <Image
                    src="/Master Card.svg"
                    alt="Mastercard"
                    width={45}
                    height={24}
                    className="h-6 w-auto"
                  />
                </div>
                <div className="bg-white p-1.5 rounded shadow-sm">
                  <Image
                    src="/instyanty-EFT.png"
                    alt="Instant EFT"
                    width={50}
                    height={24}
                    className="h-6 w-auto"
                  />
                </div>
                <div className="bg-white p-1.5 rounded shadow-sm">
                  <Image
                    src="/ozow.png"
                    alt="ozow pay"
                    width={45}
                    height={24}
                    className="h-6 w-auto"
                  />
                </div>
                <div className="bg-white p-1.5 rounded shadow-sm">
                  <Image
                    src="/snapScan.png"
                    alt="snapScan"
                    width={45}
                    height={24}
                    className="h-6 w-auto"
                  />
                </div>
                <div className="bg-white p-1.5 rounded shadow-sm">
                  <Image
                    src="/scantopay.png"
                    alt="Scan to Pay"
                    width={45}
                    height={24}
                    className="h-6 w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ApparelCast. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
