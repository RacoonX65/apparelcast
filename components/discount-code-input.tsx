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
  const { toast } = useToast()
  const supabase = createClient()

  const validateAndApplyCode = async () => {
    if (!code.trim()) return

    setIsValidating(true)

    try {
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
        setIsValidating(false)
        return
      }

      // Check if code is expired
      if (discountCode.valid_until && new Date(discountCode.valid_until) < new Date()) {
        toast({
          title: "Code expired",
          description: "This discount code has expired.",
          variant: "destructive",
        })
        setIsValidating(false)
        return
      }

      // Check if code hasn't started yet
      if (discountCode.valid_from && new Date(discountCode.valid_from) > new Date()) {
        toast({
          title: "Code not yet valid",
          description: "This discount code is not yet active.",
          variant: "destructive",
        })
        setIsValidating(false)
        return
      }

      // Check minimum purchase amount
      if (discountCode.min_purchase_amount && subtotal < discountCode.min_purchase_amount) {
        toast({
          title: "Minimum purchase not met",
          description: `Minimum purchase of R${discountCode.min_purchase_amount.toFixed(2)} required.`,
          variant: "destructive",
        })
        setIsValidating(false)
        return
      }

      // Check max uses
      if (discountCode.max_uses && discountCode.used_count >= discountCode.max_uses) {
        toast({
          title: "Code limit reached",
          description: "This discount code has reached its usage limit.",
          variant: "destructive",
        })
        setIsValidating(false)
        return
      }

      // Calculate discount amount
      let discountAmount = 0
      if (discountCode.discount_type === "percentage") {
        discountAmount = (subtotal * discountCode.discount_value) / 100
      } else {
        discountAmount = discountCode.discount_value
      }

      // Ensure discount doesn't exceed subtotal
      discountAmount = Math.min(discountAmount, subtotal)

      onDiscountApplied({
        code: discountCode.code,
        amount: discountAmount,
        codeId: discountCode.id,
      })

      toast({
        title: "Discount applied!",
        description: `You saved R${discountAmount.toFixed(2)}`,
      })

      setCode("")
    } catch (error) {
      console.error("[v0] Discount code validation error:", error)
      toast({
        title: "Error",
        description: "Failed to validate discount code.",
        variant: "destructive",
      })
    }

    setIsValidating(false)
  }

  const handleRemoveDiscount = () => {
    onDiscountRemoved()
    toast({
      title: "Discount removed",
      description: "The discount code has been removed.",
    })
  }

  if (appliedDiscount) {
    return (
      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium">{appliedDiscount.code}</p>
            <p className="text-xs text-muted-foreground">-R{appliedDiscount.amount.toFixed(2)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRemoveDiscount} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="discount-code">Discount Code</Label>
      <div className="flex gap-2">
        <Input
          id="discount-code"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && validateAndApplyCode()}
          disabled={isValidating}
        />
        <Button onClick={validateAndApplyCode} disabled={isValidating || !code.trim()} variant="outline">
          {isValidating ? "Checking..." : "Apply"}
        </Button>
      </div>
    </div>
  )
}
