import type { Metadata } from "next"
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Contact Us | ApparelCast",
  description:
    "Contact ApparelCast support at support@apparelcast.shop. Follow us on Instagram and Facebook @apparelcastsa and X @apparel_cast. CIPC registered for your protection.",
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Contact Support</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reach ApparelCast support for secure fashion purchases, bulk orders, and custom quotations. As a CIPC registered company, your protection is our priority.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Team Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Single email for all inquiries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Support */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Support - ApparelCast</h3>
                    <a
                      href="mailto:support@apparelcast.shop"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      support@apparelcast.shop
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">General inquiries, bulk orders, and technical support</p>
                  </div>
                </div>

                {/* Departmental Emails */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Info</h3>
                      <a
                        href="mailto:info@apparelcast.shop"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        info@apparelcast.shop
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">General information & press</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Bulk Orders</h3>
                      <a
                        href="mailto:bulk@apparelcast.shop"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        bulk@apparelcast.shop
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">Wholesale pricing & quotations</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Returns</h3>
                      <a
                        href="mailto:returns@apparelcast.shop"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        returns@apparelcast.shop
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">Exchanges, refunds & return questions</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Orders</h3>
                      <a
                        href="mailto:orders@apparelcast.shop"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        orders@apparelcast.shop
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">Order tracking & updates</p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">WhatsApp Support</h3>
                    <a
                      href="https://wa.me/27603910551"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      (+27) 60 391 0551
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">Quick questions & order updates</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">CIPC Registered</h3>
                    <p className="text-muted-foreground">Apperal Clothing (Pty) Ltd</p>
                    <p className="text-sm text-muted-foreground mt-1">South Africa - Legal protection guaranteed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media & Bulk Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Follow Us & Bulk Orders</CardTitle>
                <CardDescription>Stay connected and request bulk quotations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bulk Quote Request */}
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h3 className="font-semibold mb-2 text-primary">Need a Bulk Quote?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact Priscilla directly for wholesale pricing, custom orders, and bulk quotations with size/color specifications.
                  </p>
                  <a
                    href="mailto:bulk@apparelcast.shop?subject=Bulk Order Quotation Request&body=Hi ApparelCast Bulk Team,%0D%0A%0D%0AI'm interested in a bulk order quotation. Please provide details for:%0D%0A%0D%0AProduct:%0D%0AQuantity needed:%0D%0ASizes required:%0D%0AColors needed:%0D%0ADelivery timeline:%0D%0A%0D%0AThank you!"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Request Bulk Quote
                  </a>
                </div>

                {/* Instagram */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Instagram className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Instagram</h3>
                    <a
                      href="https://instagram.com/apparelcastsa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      @apparelcastsa
                    </a>
                  </div>
                </div>

                {/* Facebook */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Facebook className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Facebook</h3>
                    <a
                      href="https://facebook.com/apparelcastsa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      @apparelcastsa
                    </a>
                  </div>
                </div>

                {/* X (Twitter) */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Twitter className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">X (Twitter)</h3>
                    <a
                      href="https://x.com/apparel_cast"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      @apparel_cast
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How do I know ApparelCast is legitimate?</h3>
                <p className="text-muted-foreground">
                  We're CIPC registered as "Apperal Clothing (Pty) Ltd" with a valid tax number. Unlike WhatsApp sellers, 
                  you have legal recourse and consumer protection when shopping with us.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer bulk pricing?</h3>
                <p className="text-muted-foreground">
                  Yes! Contact support at support@apparelcast.shop for wholesale pricing. We specialize in bulk orders 
                  with custom size/color combinations and competitive pricing for resellers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How long does shipping take?</h3>
                <p className="text-muted-foreground">
                  Standard shipping takes 3-5 business days within South Africa. Express shipping is available for
                  next-day delivery in major cities. Bulk orders may require additional processing time.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What is your return policy?</h3>
                <p className="text-muted-foreground">
                  We offer a 7-day return policy for unworn items in original condition. See our{" "}
                  <a href="/returns" className="text-primary hover:underline">
                    Returns Policy
                  </a>{" "}
                  for full details. Bulk orders have special return terms.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How do you validate product quality?</h3>
                <p className="text-muted-foreground">
                  Every item is physically inspected by our team before listing. We check materials, stitching, 
                  and overall quality to ensure you receive exactly what's advertised - no surprises.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-serif font-bold mb-4">Ready to Shop Securely?</h2>
            <p className="text-muted-foreground mb-6">
              Discover authentic, quality fashion with ApparelCast - your trusted destination for style. 
              No more WhatsApp scams - shop with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@apparelcast.shop"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Email Support
              </a>
              <a
                href="mailto:support@apparelcast.shop?subject=Bulk Order Quotation Request"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Request Bulk Quote
              </a>
              <a
                href="https://wa.me/27603910551"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
