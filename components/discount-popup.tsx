"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { X, Gift, Tag, Clock, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

export function DiscountPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [discount, setDiscount] = useState<DiscountCode | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if popup has been shown in this session
    const popupShown = sessionStorage.getItem('discount-popup-shown')
    if (popupShown) {
      setHasShown(true)
      return
    }

    fetchActiveDiscount()
  }, [])

  useEffect(() => {
    if (discount && !hasShown) {
      // Show popup after 5 seconds delay
      const timer = setTimeout(() => {
        setIsVisible(true)
        setHasShown(true)
        sessionStorage.setItem('discount-popup-shown', 'true')
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [discount, hasShown])

  const fetchActiveDiscount = async () => {
    const { data } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("is_active", true)
      .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (data) {
      setDiscount(data)
    }
  }

  const copyToClipboard = async () => {
    if (!discount) return

    try {
      await navigator.clipboard.writeText(discount.code)
      setCopiedCode(true)
      toast({
        title: "Code copied!",
        description: `Discount code "${discount.code}" copied to clipboard`,
      })
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  const formatDiscount = () => {
    if (!discount) return ""
    return discount.discount_type === "percentage" 
      ? `${discount.discount_value}%` 
      : `R${discount.discount_value}`
  }

  const getDaysUntilExpiry = () => {
    if (!discount?.valid_until) return null
    
    const now = new Date()
    const expiry = new Date(discount.valid_until)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }

  if (!isVisible || !discount) {
    return null
  }

  const daysLeft = getDaysUntilExpiry()
  const isUrgent = daysLeft !== null && daysLeft <= 3

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto animate-in zoom-in-95 duration-300 shadow-2xl border-2">
          <CardContent className="p-0">
            {/* Header with close button */}
            <div className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-t-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute top-2 right-2 text-primary-foreground hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-full">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Special Offer!</h3>
                  <p className="text-primary-foreground/90 text-sm">Limited time discount</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Discount Badge */}
              <div className="flex items-center justify-between">
                <Badge className="text-lg font-bold px-3 py-1">
                  <Tag className="h-4 w-4 mr-1" />
                  {formatDiscount()} OFF
                </Badge>
                {isUrgent && (
                  <Badge variant="destructive" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {daysLeft === 0 ? 'Last Day!' : `${daysLeft} days left`}
                  </Badge>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold mb-2">
                  {discount.description || `Save ${formatDiscount()} on your order`}
                </h4>
                {discount.minimum_order_amount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Minimum purchase: R{discount.minimum_order_amount}
                  </p>
                )}
              </div>

              {/* Expiry Info */}
              {discount.valid_until && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

              {/* Code Display */}
              <div className="bg-muted/50 rounded-lg p-4 border-2 border-dashed border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Use code</p>
                    <p className="font-mono font-bold text-xl tracking-wider text-primary">
                      {discount.code}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="ml-2"
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button asChild className="flex-1">
                  <Link href="/products" onClick={handleClose}>
                    Shop Now
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Maybe Later
                </Button>
              </div>

              {/* Fine Print */}
              <p className="text-xs text-muted-foreground text-center">
                This offer won't be shown again during this session
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}