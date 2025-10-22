import type { Metadata } from "next"
import { Heart, Sparkles, Users, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "About ApparelCast | Curated Fashion & Style Experts",
  description: "Meet ApparelCast - South Africa's premier fashion destination. We curate premium clothing, designer sneakers, and luxury fragrances for style-conscious individuals. Trusted, secure shopping experience.",
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-8 text-center max-w-4xl">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">About ApparelCast</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            South Africa's trusted CIPC registered clothing company. We're eliminating online fashion scams by providing 
            secure, validated purchases for both individual items and bulk orders.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-8 py-12 max-w-6xl">
        {/* Our Story */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-center mb-6">Our Story</h2>
          <div className="max-w-3xl mx-auto space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Welcome to ApparelCast - South Africa's premier destination for curated fashion and style. We're passionate 
              about bringing you the finest selection of designer clothing, statement sneakers, and luxury fragrances that 
              define contemporary fashion.
            </p>
            <p>
              Our expert team carefully curates every piece in our collection, ensuring that each item meets our high 
              standards for quality, style, and craftsmanship. From emerging designers to established luxury brands, 
              we showcase fashion that speaks to the modern, style-conscious individual.
            </p>
            <p>
              What sets us apart is our commitment to authenticity and trust. As a CIPC registered company in South Africa 
              under Apperal Clothing (Pty) Ltd, we provide the security and accountability that online fashion shopping 
              deserves. We validate every piece of merchandise and work only with reliable suppliers.
            </p>
            <p>
              Whether you're looking for a single statement piece or placing a bulk order, ApparelCast combines fashion 
              expertise with business integrity to deliver an exceptional shopping experience.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-center mb-8">What We Stand For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-4 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-2">Curated Excellence</h3>
                <p className="text-sm text-muted-foreground">
                  Every piece is handpicked by our fashion experts. We showcase only the finest quality clothing, sneakers, and fragrances.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-4 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-2">Style Passion</h3>
                <p className="text-sm text-muted-foreground">
                  Fashion is our passion. We live and breathe style, bringing you the latest trends and timeless classics.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-4 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-2">Customer First</h3>
                <p className="text-sm text-muted-foreground">
                  Your style journey matters to us. We provide personalized service and expert fashion advice.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-4 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-2">Trusted & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  CIPC registered with full legal accountability. Shop with confidence knowing you're protected.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-primary/5 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-serif font-bold text-center mb-8">Why Shop With ApparelCast?</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-sm mb-2">CIPC Registered Business</h3>
              <p className="text-muted-foreground">
                Fully registered company with tax number and legal accountability. No anonymous sellers or scam risks.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">Secure Payment Processing</h3>
              <p className="text-muted-foreground">
                Professional payment systems with buyer protection. No risky WhatsApp transfers or unverified transactions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">Bulk Order Specialists</h3>
              <p className="text-muted-foreground">
                Custom quotations for bulk orders with size and color specifications. Perfect for retailers and resellers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">Quality Assurance</h3>
              <p className="text-muted-foreground">
                Every item validated and quality-checked before sale. Material verification ensures you get what you pay for.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">Transparent Pricing</h3>
              <p className="text-muted-foreground">
                Honest, competitive pricing for both single items and bulk orders. No hidden fees or surprise charges.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">Legal Recourse</h3>
              <p className="text-muted-foreground">
                As a registered business, you have full legal protection and recourse if any issues arise with your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}
