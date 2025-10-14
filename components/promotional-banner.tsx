"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { X, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DiscountCode {
  id: string
  code: string
  description: string | null
  discount_type: string
  discount_value: number
  minimum_order_amount: number
  valid_until: string | null
}

export function PromotionalBanner() {
  const [activeDiscounts, setActiveDiscounts] = useState<DiscountCode[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchActiveDiscounts()
  }, [])

  useEffect(() => {
    if (activeDiscounts.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeDiscounts.length)
      }, 4000) // Change every 4 seconds

      return () => clearInterval(interval)
    }
  }, [activeDiscounts.length])

  const fetchActiveDiscounts = async () => {
    const { data } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("is_active", true)
      .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
      .limit(5)

    if (data && data.length > 0) {
      setActiveDiscounts(data)
    }
  }

  const formatDiscount = (discount: DiscountCode) => {
    const value = discount.discount_type === "percentage" 
      ? `${discount.discount_value}%` 
      : `R${discount.discount_value}`
    
    const minPurchase = discount.minimum_order_amount > 0 
      ? ` (Min: R${discount.minimum_order_amount})` 
      : ""
    
    return `${value} OFF${minPurchase}`
  }

  const getPromotionalText = (discount: DiscountCode) => {
    if (discount.description) {
      return discount.description
    }
    
    const value = formatDiscount(discount)
    return `Get ${value} with code ${discount.code}`
  }

  if (!isVisible || activeDiscounts.length === 0) {
    return null
  }

  const currentDiscount = activeDiscounts[currentIndex]

  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-2 px-4 relative overflow-hidden">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <Tag className="h-4 w-4 flex-shrink-0" />
        <div className="flex-1 text-center">
          <span className="animate-pulse">🎉</span>
          <span className="mx-2">{getPromotionalText(currentDiscount)}</span>
          <span className="font-bold bg-white/20 px-2 py-1 rounded text-xs">
            {currentDiscount.code}
          </span>
          {currentDiscount.valid_until && (
            <span className="ml-2 text-xs opacity-90">
              Expires: {new Date(currentDiscount.valid_until).toLocaleDateString()}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-primary-foreground hover:bg-white/20"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Progress indicator for multiple discounts */}
      {activeDiscounts.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white/60 transition-all duration-4000 ease-linear"
            style={{ 
              width: `${((currentIndex + 1) / activeDiscounts.length) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  )
}