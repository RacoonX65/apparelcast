"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DiscountCodeInput } from "@/components/discount-code-input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Plus } from "lucide-react"
import { AddressDialog } from "@/components/address-dialog"

interface CheckoutFormProps {
  cartItems: any[]
  addresses: any[]
  subtotal: number
  userEmail: string
  userPhone: string
}

const DELIVERY_OPTIONS = [
  { id: "courier_guy", name: "Courier Guy", price: 99, description: "3-5 business days" },
  { id: "pudo", name: "Pudo Locker", price: 65, description: "Collect from nearest locker" },
]

export function CheckoutForm({ cartItems, addresses, subtotal, userEmail, userPhone }: CheckoutFormProps) {
  const [selectedAddress, setSelectedAddress] = useState(addresses.find((a) => a.is_default)?.id || addresses[0]?.id)
  const [deliveryMethod, setDeliveryMethod] = useState(DELIVERY_OPTIONS[0].id)
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number; codeId: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const deliveryFee = DELIVERY_OPTIONS.find((opt) => opt.id === deliveryMethod)?.price || 0
  const discountAmount = appliedDiscount?.amount || 0
  const total = subtotal + deliveryFee - discountAmount

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select a delivery address.",
        variant: "destructive",
      })
      return
    }

    // Prevent multiple clicks
    if (isProcessing) {
      return
    }

    setIsProcessing(true)
    try {
      // Check authentication with better error handling
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser()
      
      if (authError) {
        console.error("[v0] Auth error:", authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }
      
      if (!user) {
        console.error("[v0] No user found in session")
        throw new Error("Not authenticated - please log in again")
      }

      console.log("[v0] User authenticated:", user.id)

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total_amount: total,
          delivery_fee: deliveryFee,
          delivery_method: deliveryMethod,
          address_id: selectedAddress,
          discount_code_id: appliedDiscount?.codeId || null,
          discount_amount: discountAmount,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single()

      if (orderError) {
        console.error("[v0] Order creation error:", orderError)
        throw new Error(`Failed to create order: ${orderError.message}`)
      }

      if (!order) {
        throw new Error("Order creation failed: no order returned")
      }

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: (item.products as any).price,
        size: item.size,
        color: item.color,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("[v0] Order items creation error:", itemsError)
        throw new Error(`Failed to create order items: ${itemsError.message}`)
      }

      // Initialize Paystack payment
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          amount: total * 100, // Paystack expects amount in kobo (cents)
          orderId: order.id,
          orderNumber: orderNumber,
        }),
      })

      const data = await response.json()
      
      console.log("[v0] Paystack response:", { status: response.status, data })

      if (!response.ok) {
        const errorMsg = data.error || data.message || `Payment initialization failed (${response.status})`
        throw new Error(errorMsg)
      }
      
      if (!data.authorization_url) {
        throw new Error("Invalid payment response: missing authorization URL")
      }

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url
    } catch (error) {
      console.error("[v0] Checkout error:", error)
      
      let errorMessage = "An unexpected error occurred. Please try again."
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        // Handle Supabase errors or other object errors
        if ('message' in error) {
          errorMessage = (error as any).message
        } else if ('error' in error) {
          errorMessage = (error as any).error
        } else {
          errorMessage = "Payment processing failed. Please check your details and try again."
        }
      }
      
      toast({
        title: "Checkout failed",
        description: errorMessage,
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses.length > 0 ? (
              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-start space-x-3 border rounded-lg p-4">
                    <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-1" />
                    <Label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{address.full_name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {address.street_address}, {address.city}, {address.province} {address.postal_code}
                      </div>
                      <div className="text-sm text-muted-foreground">{address.phone}</div>
                      {address.is_default && (
                        <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-sm text-muted-foreground">No saved addresses. Please add one below.</p>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => setShowAddressDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          </CardContent>
        </Card>

        {/* Delivery Method */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
              {DELIVERY_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 border rounded-lg p-4">
                  <RadioGroupItem value={option.id} id={`delivery-${option.id}`} className="mt-1" />
                  <Label htmlFor={`delivery-${option.id}`} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{option.name}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                      <div className="font-semibold">R {option.price.toFixed(2)}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cartItems.map((item) => {
                const product = item.products as any
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-20 relative flex-shrink-0 overflow-hidden rounded bg-muted">
                      <Image
                        src={
                          product.image_url ||
                          `/placeholder.svg?height=80&width=64&query=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                        }
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-2">{product.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-semibold">R {(product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-4 space-y-3">
              <DiscountCodeInput
                subtotal={subtotal}
                onDiscountApplied={setAppliedDiscount}
                onDiscountRemoved={() => setAppliedDiscount(null)}
                appliedDiscount={appliedDiscount}
              />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">R {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">R {deliveryFee.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Discount</span>
                    <span className="font-medium">-R {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>R {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={isProcessing || !selectedAddress}
              className="w-full h-12 bg-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isProcessing ? "Processing Payment..." : "Pay with Paystack"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">Secure payment powered by Paystack</p>
          </CardContent>
        </Card>
      </div>

      {/* Address Dialog */}
      <AddressDialog open={showAddressDialog} onOpenChange={setShowAddressDialog} />
    </div>
  )
}
