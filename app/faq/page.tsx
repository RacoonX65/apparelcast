import type { Metadata } from "next"
import { ChevronDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "FAQ | Apparel Cast",
  description: "Frequently asked questions about ordering, shipping, returns, and more at Apparel Cast.",
}

export default function FAQPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Frequently Asked Questions - Apparel Cast</h1>
          <p className="text-lg text-muted-foreground">Find answers to common questions about shopping with Apparel Cast</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {/* Orders & Payment */}
          <AccordionItem value="item-1" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">How do I place an order?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Simply browse our collection, add items to your cart, and proceed to checkout. You'll need to create an
              account or sign in, then provide your delivery address and payment information. We accept payments via
              Paystack (credit/debit cards).
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">What payment methods do you accept?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              We accept all major credit and debit cards through our secure Paystack payment gateway, including Visa,
              Mastercard, and American Express. All transactions are encrypted and secure.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">Can I use a discount code?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes! Enter your discount code at checkout before completing your payment. The discount will be applied to
              your order total. Follow us on social media to stay updated on special offers and promotions.
            </AccordionContent>
          </AccordionItem>

          {/* Shipping */}
          <AccordionItem value="item-4" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">How long does delivery take?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Courier Guy:</strong> 2-5 business days for major cities, 5-7 business days for remote areas
                </li>
                <li>
                  <strong>Pudo Locker:</strong> 3-5 business days to your nearest Pudo point
                </li>
              </ul>
              <p className="mt-2">
                Orders are processed within 1-2 business days. You'll receive tracking information once your order
                ships.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">Do you ship nationwide?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes, we deliver to all areas in South Africa through our trusted courier partners, Courier Guy and Pudo.
              Delivery times may vary depending on your location.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">How much is shipping?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Shipping costs are calculated at checkout based on your delivery address and chosen courier service. We
              offer free shipping on orders over R750.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">Can I track my order?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes! Once your order ships, you'll receive an email with tracking information. You can also view your
              order status in your account under "My Orders."
            </AccordionContent>
          </AccordionItem>

          {/* Returns & Exchanges */}
          <AccordionItem value="item-8" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">What is your return policy?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              We accept returns within 7 days of delivery for items in their original condition with tags attached.
              Please see our Return & Refund Policy page for complete details on the return process.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">How do I return an item?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Contact us via WhatsApp (063 400 9626) or email (editorkhozad@gmail.com) within 7 days of receiving your
              order. We'll provide you with return instructions and arrange collection if applicable.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">Do you offer exchanges?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes, we offer exchanges for different sizes or colors within 7 days of delivery, subject to availability.
              Contact us to arrange an exchange.
            </AccordionContent>
          </AccordionItem>

          {/* Products */}
          <AccordionItem value="item-11" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">How do I know what size to order?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Each product page includes detailed size information. If you're unsure, we recommend ordering your usual
              size or contacting us for personalized sizing advice via WhatsApp.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-12" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">Are your products authentic?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              We only stock authentic, quality products. Every item is carefully selected and verified before being
              added to our collection.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-13" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">
              When will out-of-stock items be available?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              You can sign up for stock notifications on product pages. We'll email you as soon as the item is back in
              stock. Restocking times vary by product.
            </AccordionContent>
          </AccordionItem>

          {/* Account */}
          <AccordionItem value="item-14" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">Do I need an account to shop?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes, you'll need to create an account to place orders. This allows you to track your orders, save
              addresses, and manage your wishlist. You can sign up with email or use your Google account for quick
              registration.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-15" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">How do I reset my password?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Click "Forgot Password" on the login page and enter your email address. You'll receive a password reset
              link via email. If you don't receive it, check your spam folder or contact us for assistance.
            </AccordionContent>
          </AccordionItem>

          {/* Contact */}
          <AccordionItem value="item-16" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">How can I contact customer support?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <ul className="space-y-2">
                <li>
                  <strong>WhatsApp:</strong> 063 400 9626 (Business) or 072 800 3053 (Personal)
                </li>
                <li>
                  <strong>Email:</strong> editorkhozad@gmail.com
                </li>
                <li>
                  <strong>Social Media:</strong> Instagram (@apparelcast_official), Facebook (Apparel Cast), TikTok
                  (@_c.a.a.r.l)
                </li>
              </ul>
              <p className="mt-2">We typically respond within 24 hours during business hours.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 text-center p-8 bg-primary/5 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            We're here to help! Contact us via WhatsApp, email, or social media.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}
