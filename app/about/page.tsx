import type { Metadata } from "next"
import { Heart, Sparkles, Users, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "About Us | ApparelCast",
  description: "Learn about ApparelCast - South Africa's trusted CIPC registered clothing company eliminating online fashion scams through secure, validated bulk and retail purchases.",
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl font-serif font-bold text-foreground mb-6">About ApparelCast</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            South Africa's trusted CIPC registered clothing company. We're eliminating online fashion scams by providing 
            secure, validated purchases for both individual items and bulk orders.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Our Story */}
        <div className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-center mb-8">Our Story</h2>
          <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground leading-relaxed">
            <p>
              ApparelCast was founded by two sisters and one brother who witnessed too many people getting scammed when 
              buying clothing online, especially in bulk purchases. We saw how customers would lose money through WhatsApp 
              transactions with unregistered sellers who had no accountability or legal recourse.
            </p>
            <p>
              As a CIPC registered company in South Africa under Apperal Clothing (Pty) Ltd, we created ApparelCast to 
              bring trust and security back to online fashion shopping. We have a proper tax number, legal registration, 
              and full accountability - something that was missing in the market.
            </p>
            <p>
              Our mission is simple: eliminate the insecurity and scams in online clothing purchases. We validate every 
              piece of merchandise, check material quality, and work only with reliable suppliers. Whether you're buying 
              a single item or placing a bulk order, you can trust that your purchase is secure and legitimate.
            </p>
            <p>
              We specialize in both individual sales and bulk orders, making it easy for customers to get quality clothing 
              at reasonable prices while having the assurance that comes with dealing with a registered, accountable business.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">What We Stand For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-primary/20">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Trust & Security</h3>
                <p className="text-sm text-muted-foreground">
                  CIPC registered with full legal accountability. No more WhatsApp scams - shop with complete confidence.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Quality Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Every item is validated and quality-checked before being added to our stock. No compromises on quality.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Bulk & Retail</h3>
                <p className="text-sm text-muted-foreground">
                  Whether you need one item or hundreds, we cater to both individual customers and bulk orders.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Reliable Suppliers</h3>
                <p className="text-sm text-muted-foreground">
                  We work only with verified, reliable suppliers to ensure consistent quality and affordable pricing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-primary/5 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-serif font-bold text-center mb-8">Why Shop With ApparelCast?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-lg mb-2">CIPC Registered Business</h3>
              <p className="text-muted-foreground">
                Fully registered company with tax number and legal accountability. No anonymous sellers or scam risks.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Secure Payment Processing</h3>
              <p className="text-muted-foreground">
                Professional payment systems with buyer protection. No risky WhatsApp transfers or unverified transactions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Bulk Order Specialists</h3>
              <p className="text-muted-foreground">
                Custom quotations for bulk orders with size and color specifications. Perfect for retailers and resellers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Quality Assurance</h3>
              <p className="text-muted-foreground">
                Every item validated and quality-checked before sale. Material verification ensures you get what you pay for.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Transparent Pricing</h3>
              <p className="text-muted-foreground">
                Honest, competitive pricing for both single items and bulk orders. No hidden fees or surprise charges.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Legal Recourse</h3>
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
