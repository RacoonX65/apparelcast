import type { Metadata } from "next"
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Contact Us | Caarl",
  description:
    "Get in touch with Caarl. Contact us via email, WhatsApp, or social media for any questions about our products.",
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We'd love to hear from you. Whether you have a question about products, orders, or anything else, our team
              is ready to answer all your questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Reach out to us through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a
                      href="mailto:editorkhozad@gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      editorkhozad@gmail.com
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">WhatsApp</h3>
                    <a
                      href="https://wa.me/27123456789"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      +27 12 345 6789
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-muted-foreground">South Africa</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
                <CardDescription>Stay connected on social media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Instagram */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Instagram className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Instagram</h3>
                    <a
                      href="https://instagram.com/caarl_fashion"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      @caarl_fashion
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
                      href="https://facebook.com/caarl.fashion"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Caarl Fashion
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
                <h3 className="font-semibold mb-2">What are your business hours?</h3>
                <p className="text-muted-foreground">
                  We respond to messages Monday to Friday, 9 AM to 5 PM (SAST). Orders can be placed 24/7 through our
                  website.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How long does shipping take?</h3>
                <p className="text-muted-foreground">
                  Standard shipping takes 3-5 business days within South Africa. Express shipping is available for
                  next-day delivery in major cities.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What is your return policy?</h3>
                <p className="text-muted-foreground">
                  We offer a 7-day return policy for unworn items in original condition. See our{" "}
                  <a href="/returns" className="text-primary hover:underline">
                    Returns Policy
                  </a>{" "}
                  for full details.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer international shipping?</h3>
                <p className="text-muted-foreground">
                  Currently, we only ship within South Africa. We're working on expanding to other countries soon.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-serif font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Don't hesitate to reach out. We're here to help make your shopping experience amazing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:editorkhozad@gmail.com"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Send Email
              </a>
              <a
                href="https://wa.me/27123456789"
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
