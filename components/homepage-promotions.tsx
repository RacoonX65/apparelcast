"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tag, Clock, Gift, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface DiscountCode {
  id: string
  code: string
  description: string | null
  discount_type: string
  discount_value: number
  minimum_order_amount: number
  valid_until: string | null
}

export function HomepagePromotions() {
  const [activeDiscounts, setActiveDiscounts] = useState<DiscountCode[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchActiveDiscounts()
  }, [])

  const fetchActiveDiscounts = async () => {
    const { data } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("is_active", true)
      .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
      .order("created_at", { ascending: false })
      .limit(3)

    if (data) {
      setActiveDiscounts(data)
    }
  }

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast({
        title: "Code copied!",
        description: `Discount code "${code}" copied to clipboard`,
      })
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      })
    }
  }

  const formatDiscount = (discount: DiscountCode) => {
    return discount.discount_type === "percentage" 
      ? `${discount.discount_value}%` 
      : `R${discount.discount_value}`
  }

  const getDiscountTitle = (discount: DiscountCode) => {
    if (discount.description) {
      return discount.description
    }
    
    const value = formatDiscount(discount)
    return `Save ${value} on your order`
  }

  const getDaysUntilExpiry = (validUntil: string | null) => {
    if (!validUntil) return null
    
    const now = new Date()
    const expiry = new Date(validUntil)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }

  if (activeDiscounts.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-serif font-semibold">Special Offers</h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Don't miss out on these amazing deals! Use the codes below to save on your next purchase.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {activeDiscounts.map((discount, index) => {
            const daysLeft = getDaysUntilExpiry(discount.valid_until)
            const isUrgent = daysLeft !== null && daysLeft <= 3
            
            return (
              <Card 
                key={discount.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  isUrgent ? 'ring-2 ring-destructive/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  {/* Discount Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge 
                      variant={index === 0 ? "default" : "secondary"} 
                      className="text-sm font-bold"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {formatDiscount(discount)} OFF
                    </Badge>
                    {isUrgent && (
                      <Badge variant="destructive" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {daysLeft === 0 ? 'Last Day!' : `${daysLeft} days left`}
                      </Badge>
                    )}
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-xl font-semibold mb-2">
                    {getDiscountTitle(discount)}
                  </h3>
                  
                  {discount.minimum_order_amount > 0 && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Minimum purchase: R{discount.minimum_order_amount}
                    </p>
                  )}

                  {/* Expiry Info */}
                  {discount.valid_until && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="h-4 w-4" />
                      <span>
                        Valid until {new Date(discount.valid_until).toLocaleDateString('en-ZA', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {/* Code Display and Copy */}
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Discount Code</p>
                        <p className="font-mono font-bold text-lg tracking-wider">
                          {discount.code}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(discount.code)}
                        className="ml-2"
                      >
                        {copiedCode === discount.code ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button asChild className="w-full">
                    <Link href="/products">
                      Shop Now
                    </Link>
                  </Button>
                </CardContent>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary/10 rounded-full translate-y-8 -translate-x-8" />
              </Card>
            )
          })}
        </div>

        {/* View All Offers Link */}
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link href="/products">
              Browse All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}