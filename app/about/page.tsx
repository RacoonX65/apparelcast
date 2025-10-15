import type { Metadata } from "next"
import { Heart, Sparkles, Users, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "About Us | ApparelCast",
  description: "Learn about ApparelCast - your destination for premium fashion and apparel with modern style and quality.",
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
            Where effortless style meets quality. We're passionate about bringing you the finest selection of clothing,
            sneakers, and perfumes that celebrate your unique beauty.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Our Story */}
        <div className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-center mb-8">Our Story</h2>
          <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground leading-relaxed">
            <p>
              ApparelCast was born from a simple belief: everyone deserves to feel confident and beautiful in what they
              wear. We understand that fashion is more than just clothing—it's a form of self-expression, a way to tell
              your story without saying a word.
            </p>
            <p>
              Based in South Africa, we've curated a collection that blends contemporary trends with timeless elegance.
              From chic dresses to comfortable sneakers and captivating fragrances, every piece in our collection is
              chosen with care and attention to detail.
            </p>
            <p>
              We believe in quality over quantity, style over trends, and authenticity over everything. Our mission is
              to provide you with pieces that not only look good but make you feel incredible.
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
                <h3 className="font-semibold text-lg mb-2">Quality First</h3>
                <p className="text-sm text-muted-foreground">
                  We carefully select every item to ensure it meets our high standards of quality and craftsmanship.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Effortless Style</h3>
                <p className="text-sm text-muted-foreground">
                  Fashion should be easy. We curate pieces that are versatile, timeless, and effortlessly chic.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Customer Love</h3>
                <p className="text-sm text-muted-foreground">
                  Your satisfaction is our priority. We're here to make your shopping experience exceptional.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Authenticity</h3>
                <p className="text-sm text-muted-foreground">
                  We believe in being genuine and transparent in everything we do, from products to service.
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
              <h3 className="font-semibold text-lg mb-2">Curated Collections</h3>
              <p className="text-muted-foreground">
                Every piece is handpicked to ensure it aligns with our vision of effortless elegance and quality.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Secure Shopping</h3>
              <p className="text-muted-foreground">
                Shop with confidence knowing your payment information is protected with industry-standard security.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                We partner with reliable couriers to ensure your order arrives quickly and safely at your doorstep.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Easy Returns</h3>
              <p className="text-muted-foreground">
                Not satisfied? We offer hassle-free returns within 7 days to ensure you're completely happy.
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
