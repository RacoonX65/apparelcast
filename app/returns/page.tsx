import type { Metadata } from "next"
import { RotateCcw, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Return & Refund Policy | Apparel Cast",
    description: "Learn about our return and refund policy at Apparel Cast. Easy returns within 7 days.",
}

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Returns & Exchanges - Apparel Cast</h1>
          <p className="text-lg text-muted-foreground">
            Your satisfaction is our priority. Read our return policy below.
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* Return Window */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>7-Day Return Window:</strong> You have 7 days from the date of delivery to initiate a return.
            </AlertDescription>
          </Alert>

          {/* Return Conditions */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Return Conditions</h2>
            <p className="text-muted-foreground mb-4">
              To be eligible for a return, items must meet the following conditions:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Items must be in their original condition with all tags attached</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Items must be unworn, unwashed, and undamaged</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Original packaging must be included where applicable</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Proof of purchase (order confirmation email) must be provided</span>
              </li>
            </ul>
          </section>

          {/* Non-Returnable Items */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Non-Returnable Items</h2>
            <p className="text-muted-foreground mb-4">
              For hygiene and safety reasons, the following items cannot be returned:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Perfumes and fragrances (once opened)</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Underwear and intimate apparel</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Items marked as final sale or clearance</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Items without original tags or in used condition</span>
              </li>
            </ul>
          </section>

          {/* How to Return */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">How to Return an Item</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Contact Us</h3>
                  <p className="text-muted-foreground">
                    Reach out within 7 days of delivery via WhatsApp (063 400 9626) or email (editorkhozad@gmail.com)
                    with your order number and reason for return.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Get Approval</h3>
                  <p className="text-muted-foreground">
                    Our team will review your request and provide return instructions if approved. We may request photos
                    of the item to verify its condition.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Ship the Item</h3>
                  <p className="text-muted-foreground">
                    Package the item securely with all original tags and packaging. Ship to the address provided by our
                    team. Keep your tracking number for reference.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Receive Refund</h3>
                  <p className="text-muted-foreground">
                    Once we receive and inspect your return, we'll process your refund within 5-7 business days to your
                    original payment method.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Policy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Refund Policy</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>Processing Time:</strong> Refunds are processed within 5-7 business days after we receive and
                inspect your returned item.
              </p>
              <p>
                <strong>Refund Method:</strong> Refunds will be issued to your original payment method. Please allow
                5-10 business days for the refund to reflect in your account, depending on your bank.
              </p>
              <p>
                <strong>Shipping Costs:</strong> Original shipping fees are non-refundable. Return shipping costs are
                the responsibility of the customer unless the return is due to our error (wrong item sent, defective
                product, etc.).
              </p>
              <p>
                <strong>Partial Refunds:</strong> In some cases, partial refunds may be granted for items that are
                returned in less than perfect condition or without original packaging.
              </p>
            </div>
          </section>

          {/* Exchanges */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Exchanges</h2>
            <p className="text-muted-foreground mb-4">
              We offer exchanges for different sizes or colors within 7 days of delivery, subject to availability. To
              request an exchange:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Contact us via WhatsApp or email with your order number</li>
              <li>Specify the item you'd like to exchange and your preferred size/color</li>
              <li>We'll check availability and provide exchange instructions</li>
              <li>Ship the original item back to us</li>
              <li>We'll send your replacement item once we receive the return</li>
            </ol>
          </section>

          {/* Damaged or Defective Items */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Damaged or Defective Items</h2>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                If you receive a damaged or defective item, please contact us immediately with photos. We'll arrange a
                replacement or full refund at no cost to you, including return shipping.
              </AlertDescription>
            </Alert>
          </section>

          {/* Contact Information */}
          <section className="bg-primary/5 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Questions About Returns?</h2>
            <p className="text-muted-foreground mb-4">
              Our customer service team is here to help with any return-related questions.
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong>WhatsApp:</strong> 063 400 9626 (Business) or 072 800 3053 (Personal)
              </p>
              <p>
                <strong>Email:</strong> returns@apparelcast.shop
              </p>
              <p>
                <strong>Response Time:</strong> Within 24 hours during business hours
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}
