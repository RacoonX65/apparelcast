import type { Metadata } from "next"
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Contact Us | Caarl",
  description:
    "Get in touch with Caarl. Contact us via email, WhatsApp, or social media for any questions about our products.",
}

export default function ContactPage() {
  return (
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

              {/* WhatsApp Business */}
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Business WhatsApp</h3>
                  <a
                    href="https://wa.me/27634009626"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    063 400 9626
                  </a>
                </div>
              </div>

              {/* WhatsApp Personal */}
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Personal WhatsApp</h3>
                  <a
                    href="https://wa.me/27728003053"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    072 800 3053
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
            <CardContent className="space-y-4">
              {/* Instagram */}
              <a
                href="https://instagram.com/caarl_b_lushlife"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-3 rounded-lg">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Instagram</h3>
                  <p className="text-sm text-muted-foreground">@caarl_b_lushlife</p>
                </div>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/CaarlLushlife"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Facebook className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Facebook</h3>
                  <p className="text-sm text-muted-foreground">Caarl Lushlife</p>
                </div>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com/@_c.a.a.r.l"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="bg-black p-3 rounded-lg">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">TikTok</h3>
                  <p className="text-sm text-muted-foreground">@_c.a.a.r.l</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
            <CardDescription>When you can reach us</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold mb-2">Monday - Friday</p>
                <p className="text-muted-foreground">9:00 AM - 6:00 PM SAST</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Saturday</p>
                <p className="text-muted-foreground">10:00 AM - 4:00 PM SAST</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Sunday</p>
                <p className="text-muted-foreground">Closed</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Response Time</p>
                <p className="text-muted-foreground">Within 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
