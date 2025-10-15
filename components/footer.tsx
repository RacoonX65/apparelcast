import Link from "next/link"
import Image from "next/image"
import { Instagram, Facebook } from "lucide-react"

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
              {/* Maya - General Inquiries */}
              <a
                href="mailto:maya@apparelcast.shop"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="bg-primary p-2 rounded-lg">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <span>Maya - General Inquiries</span>
              </a>

              {/* Priscilla - Bulk Orders */}
              <a
                href="mailto:priscilla@apparelcast.shop"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="bg-orange-500 p-2 rounded-lg">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <span>Priscilla - Bulk Orders</span>
              </a>

              {/* Judas - Technical Support */}
              <a
                href="mailto:judas@apparelcast.shop"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="bg-blue-500 p-2 rounded-lg">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <span>Judas - Technical Support</span>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/apparelcast_official"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-2 rounded-lg">
                  <Instagram className="h-4 w-4 text-white" />
                </div>
                <span>@apparelcast_official</span>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/apparelcast.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Facebook className="h-4 w-4 text-white" />
                </div>
                <span>ApparelCast</span>
              </a>

              {/* WhatsApp Support */}
              <a
                href="https://wa.me/27123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="bg-green-500 p-2 rounded-lg">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
                  </svg>
                </div>
                <span>Support: +27 12 345 6789</span>
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
