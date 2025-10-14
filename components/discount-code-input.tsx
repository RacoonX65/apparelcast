"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Tag, X } from "lucide-react"

interface DiscountCodeInputProps {
  subtotal: number
  onDiscountApplied: (discount: { code: string; amount: number; codeId: string }) => void
  onDiscountRemoved: () => void
  appliedDiscount?: { code: string; amount: number; codeId: string } | null
}

export function DiscountCodeInput({
  subtotal,
  onDiscountApplied,
  onDiscountRemoved,
  appliedDiscount,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [previewDiscount, setPreviewDiscount] = useState<{ 
    code: string; 
    amount: number; 
    type: string; 
    value: number; 
    codeId: string 
  } | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const validateAndPreviewCode = async () => {
    if (!code.trim()) return

    setIsValidating(true)
    setPreviewDiscount(null)

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to apply discount codes.",
          variant: "destructive",
        })
        return
      }

      // Fetch discount code
      const { data: discountCode, error } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single()

      if (error || !discountCode) {
        toast({
          title: "Invalid code",
          description: "This discount code is not valid.",
          variant: "destructive",
        })
        return
      }

      // Check usage limit
      if (discountCode.usage_limit && discountCode.usage_count >= discountCode.usage_limit) {
        toast({
          title: "Code expired",
          description: "This discount code has reached its usage limit.",
          variant: "destructive",
        })
        return
      }

      // Check date validity
      const now = new Date()
      if (discountCode.valid_from && new Date(discountCode.valid_from) > now) {
        toast({
          title: "Code not active",
          description: "This discount code is not yet active.",
          variant: "destructive",
        })
        return
      }

      if (discountCode.valid_until && new Date(discountCode.valid_until) < now) {
        toast({
          title: "Code expired",
          description: "This discount code has expired.",
          variant: "destructive",
        })
        return
      }

      // Check minimum order amount
      if (discountCode.minimum_order_amount && subtotal < discountCode.minimum_order_amount) {
        toast({
          title: "Minimum order not met",
          description: `Minimum order amount of R${discountCode.minimum_order_amount.toFixed(2)} required.`,
          variant: "destructive",
        })
        return
      }

      // Calculate discount amount
      let discountAmount = 0
      if (discountCode.discount_type === "percentage") {
        discountAmount = (subtotal * discountCode.discount_value) / 100
        if (discountCode.max_discount_amount) {
          discountAmount = Math.min(discountAmount, discountCode.max_discount_amount)
        }
      } else {
        discountAmount = discountCode.discount_value
      }

      // Ensure discount doesn't exceed subtotal
      discountAmount = Math.min(discountAmount, subtotal)

      // Show preview
      setPreviewDiscount({
        code: discountCode.code,
        amount: discountAmount,
        type: discountCode.discount_type,
        value: discountCode.discount_value,
        codeId: discountCode.id,
      })

    } catch (error) {
      console.error("Discount code validation error:", error)
      toast({
        title: "Error",
        description: "Failed to validate discount code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const applyDiscount = () => {
    if (!previewDiscount) return

    onDiscountApplied({
      code: previewDiscount.code,
      amount: previewDiscount.amount,
      codeId: previewDiscount.codeId,
    })

    toast({
      title: "Discount applied!",
      description: `You saved R${previewDiscount.amount.toFixed(2)}`,
    })

    setCode("")
    setPreviewDiscount(null)
  }

  const handleRemoveDiscount = () => {
    onDiscountRemoved()
    toast({
      title: "Discount removed",
      description: "The discount code has been removed from your order.",
    })
  }

  // If discount is already applied, show applied state
  if (appliedDiscount) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">{appliedDiscount.code}</p>
            <p className="text-xs text-green-600">Saved R{appliedDiscount.amount.toFixed(2)}</p>
          </div>
        </div>
        <Button
          onClick={handleRemoveDiscount}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="discount-code">Discount Code</Label>
      <div className="flex gap-2">
        <Input
          id="discount-code"
          placeholder="Enter discount code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && validateAndPreviewCode()}
          disabled={isValidating}
        />
        <Button 
          onClick={validateAndPreviewCode} 
          disabled={isValidating || !code.trim()} 
          variant="outline"
        >
          {isValidating ? "Checking..." : "Preview"}
        </Button>
      </div>
      
      {previewDiscount && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-green-800">Discount Preview</h4>
            <span className="text-sm text-green-600 font-medium">{previewDiscount.code}</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>
                Discount ({previewDiscount.type === "percentage" 
                  ? `${previewDiscount.value}%` 
                  : "Fixed"}):
              </span>
              <span>-R{previewDiscount.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-green-800 border-t border-green-200 pt-2">
              <span>New Subtotal:</span>
              <span>R{(subtotal - previewDiscount.amount).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={applyDiscount} className="flex-1" size="sm">
              Apply Discount
            </Button>
            <Button 
              onClick={() => setPreviewDiscount(null)} 
              variant="outline" 
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
