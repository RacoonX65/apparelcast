import type { Metadata } from "next"
import { Package, Truck, MapPin, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Shipping Policy | Caarl",
  description: "Learn about our shipping options, delivery times, and costs at Caarl.",
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Shipping Policy</h1>
          <p className="text-lg text-muted-foreground">Fast, reliable delivery across South Africa</p>
        </div>

        {/* Shipping Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Courier Guy</CardTitle>
              </div>
              <CardDescription>Door-to-door delivery service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Delivery Time</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Major cities: 2-5 business days</li>
                  <li>• Remote areas: 5-7 business days</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time tracking</li>
                  <li>• Signature on delivery</li>
                  <li>• Insurance included</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Pudo Locker</CardTitle>
              </div>
              <CardDescription>Collect from your nearest Pudo point</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Delivery Time</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 3-5 business days to Pudo point</li>
                  <li>• 24/7 collection access</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Secure locker storage</li>
                  <li>• SMS notification when ready</li>
                  <li>• Convenient collection times</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipping Costs */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Shipping Costs</CardTitle>
            <CardDescription>Calculated at checkout based on your location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div>
                  <p className="font-semibold">Standard Shipping</p>
                  <p className="text-sm text-muted-foreground">Varies by location and courier</p>
                </div>
                <p className="font-semibold">R50 - R150</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">Free Shipping</p>
                  <p className="text-sm text-green-600 dark:text-green-500">On orders over R500</p>
                </div>
                <p className="font-semibold text-green-700 dark:text-green-400">FREE</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing & Delivery */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Order Processing</h3>
              <p className="text-sm text-muted-foreground">
                Orders are processed within 1-2 business days. You'll receive a confirmation email once your order
                ships.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track your order in real-time with the tracking number sent to your email and available in your account.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Packaging</h3>
              <p className="text-sm text-muted-foreground">
                All items are carefully packaged to ensure they arrive in perfect condition at your doorstep.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Important Information */}
        <Card>
          <CardHeader>
            <CardTitle>Important Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Delivery Address</h4>
              <p className="text-sm">
                Please ensure your delivery address is correct and complete. We cannot be held responsible for orders
                delivered to incorrect addresses provided by the customer.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Delivery Attempts</h4>
              <p className="text-sm">
                Couriers will attempt delivery up to 3 times. If delivery is unsuccessful, the package will be returned
                to us, and you'll be contacted to arrange redelivery (additional fees may apply).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Delays</h4>
              <p className="text-sm">
                While we strive for timely delivery, delays may occur due to factors beyond our control (weather, public
                holidays, courier issues). We'll keep you informed of any significant delays.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Missing or Damaged Packages</h4>
              <p className="text-sm">
                If your package arrives damaged or items are missing, please contact us immediately with photos. We'll
                resolve the issue promptly with a replacement or refund.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Public Holidays</h4>
              <p className="text-sm">
                Orders placed during public holidays will be processed on the next business day. Delivery times may be
                extended during holiday periods.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="mt-12 text-center p-8 bg-primary/5 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Questions About Shipping?</h2>
          <p className="text-muted-foreground mb-6">Our team is here to help with any shipping-related questions.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/27634009626"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              WhatsApp Us
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Contact Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
