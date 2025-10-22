"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DiscountCodeInput } from "@/components/discount-code-input"
import { PepLocationPicker } from "@/components/pep-location-picker"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Plus, Package, AlertTriangle } from "lucide-react"
import { AddressDialog } from "@/components/address-dialog"
import { PepLocation } from "@/lib/pep-locations"

interface CheckoutFormProps {
  cartItems: any[]
  addresses: any[]
  subtotal: number
  totalBulkSavings?: number
  userEmail: string
  userPhone: string
  isGuest?: boolean
}

const DELIVERY_OPTIONS = [
  { id: "courier_guy", name: "Courier Guy", price: 99, description: "3-5 business days" },
  { id: "pudo", name: "Pudo Locker", price: 65, description: "Collect from nearest locker" },
  { id: "pep_send", name: "PEP Send", price: 55, description: "Collect from PEP Pax pickup point" },
]

// Free shipping threshold - should match cart page
const FREE_SHIPPING_THRESHOLD = 750

export function CheckoutForm({ cartItems, addresses, subtotal, totalBulkSavings = 0, userEmail, userPhone, isGuest = false }: CheckoutFormProps) {
  const [selectedAddress, setSelectedAddress] = useState(addresses.find((a) => a.is_default)?.id || addresses[0]?.id)
  const [deliveryMethod, setDeliveryMethod] = useState(DELIVERY_OPTIONS[0].id)
  const [selectedPepLocation, setSelectedPepLocation] = useState<PepLocation | null>(null)
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number; codeId: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [guestFirstName, setGuestFirstName] = useState("")
  const [guestLastName, setGuestLastName] = useState("")
  const [guestAddress, setGuestAddress] = useState("")
  const [guestCity, setGuestCity] = useState("")
  const [guestProvince, setGuestProvince] = useState("")
  const [guestPostalCode, setGuestPostalCode] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Check if cart contains bulk orders
  const hasBulkOrders = cartItems.some(item => item.is_bulk_order)

  // Filter delivery options based on bulk order status
  const availableDeliveryOptions = hasBulkOrders 
    ? DELIVERY_OPTIONS.filter(option => option.id !== "pep_send")
    : DELIVERY_OPTIONS

  // Apply free shipping if threshold is met
  const baseDeliveryFee = availableDeliveryOptions.find((opt) => opt.id === deliveryMethod)?.price || 0
  const deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : baseDeliveryFee
  const discountAmount = appliedDiscount?.amount || 0
  const total = subtotal + deliveryFee - discountAmount

  const handleCheckout = async () => {
    // Validate guest information if guest user
    if (isGuest) {
      if (!guestEmail || !guestPhone || !guestFirstName || !guestLastName || !guestAddress || !guestCity || !guestProvince || !guestPostalCode) {
        toast({
          title: "Information Required",
          description: "Please fill in all guest information fields.",
          variant: "destructive",
        })
        return
      }
    } else {
      // Validate authenticated user address
      if (!selectedAddress) {
        toast({
          title: "Address Required",
          description: "Please select a delivery address.",
          variant: "destructive",
        })
        return
      }
    }

    // Check if PEP Send is selected but no location is chosen
    if (deliveryMethod === "pep_send" && !selectedPepLocation) {
      toast({
        title: "PEP Location Required",
        description: "Please select a PEP Pax pickup point.",
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
      let userId = null
      let orderEmail = userEmail
      let orderPhone = userPhone

      if (!isGuest) {
        // Check authentication for authenticated users
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          console.error("Auth error:", authError)
          throw new Error(`Authentication error: ${authError.message}`)
        }
        
        if (!user) {
          console.error("No user found in session")
          throw new Error("Not authenticated - please log in again")
        }

        userId = user.id
        console.log("User authenticated:", user.id)
      } else {
        // Use guest information
        orderEmail = guestEmail
        orderPhone = guestPhone
        userId = null // Guest orders will have null user_id
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Create order - handle both guest and authenticated users
      const orderData = {
        user_id: userId,
        order_number: orderNumber,
        total_amount: total,
        delivery_fee: deliveryFee,
        delivery_method: deliveryMethod,
        address_id: isGuest ? null : selectedAddress, // Guest orders don't use saved addresses
        discount_code_id: appliedDiscount?.codeId || null,
        discount_amount: discountAmount,
        status: "pending",
        payment_status: "pending",
        // Add guest information for guest orders
        ...(isGuest && {
          guest_email: guestEmail,
          guest_phone: guestPhone,
          guest_first_name: guestFirstName,
          guest_last_name: guestLastName,
          guest_address: guestAddress,
          guest_city: guestCity,
          guest_province: guestProvince,
          guest_postal_code: guestPostalCode,
        })
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single()

      if (orderError) {
        console.error("Order creation error:", orderError)
        throw new Error(`Failed to create order: ${orderError.message}`)
      }

      if (!order) {
        throw new Error("Order creation failed: no order returned")
      }

      // Create order items with bulk pricing information
      const orderItems = cartItems.map((item) => {
        const product = item.products as any
        const pricePerUnit = item.is_bulk_order && item.bulk_price ? item.bulk_price : (product?.price || item.original_price)
        
        return {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: pricePerUnit,
          size: item.size,
          color: item.color,
          is_bulk_order: item.is_bulk_order || false,
          bulk_tier_id: item.bulk_tier_id || null,
          bulk_price: item.bulk_price || null,
          bulk_savings: item.bulk_savings || 0,
          original_price: item.original_price || (product?.price || item.original_price),
        }
      })

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("Order items creation error:", itemsError)
        throw new Error(`Failed to create order items: ${itemsError.message}`)
      }

      // Clear guest cart after successful order creation
      if (isGuest) {
        // This will be handled client-side after successful redirect
        // We'll add a flag to clear the cart on return from payment
        const clearCartUrl = new URL(window.location.href)
        clearCartUrl.searchParams.set('clearGuestCart', 'true')
        clearCartUrl.searchParams.set('orderId', order.id)
      }

      // Initialize Yoco payment
      const response = await fetch("/api/yoco/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: orderEmail,
          amount: Math.round(total * 100), // Yoco expects amount in cents as integer
          orderId: order.id,
          orderNumber: orderNumber,
        }),
      })

      const data = await response.json()
      
      console.log("Yoco response:", { status: response.status, data })

      if (!response.ok) {
        const errorMsg = data.error || data.message || `Payment initialization failed (${response.status})`
        throw new Error(errorMsg)
      }
      
      if (!data.redirect_url) {
        throw new Error("Invalid payment response: missing redirect URL")
      }

      // Redirect to Yoco payment page
      window.location.href = data.redirect_url
    } catch (error) {
      console.error("Checkout error:", error)
      
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
        {/* Guest Information */}
        {isGuest && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-first-name">First Name *</Label>
                  <Input
                    id="guest-first-name"
                    value={guestFirstName}
                    onChange={(e) => setGuestFirstName(e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-last-name">Last Name *</Label>
                  <Input
                    id="guest-last-name"
                    value={guestLastName}
                    onChange={(e) => setGuestLastName(e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-email">Email Address *</Label>
                <Input
                  id="guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-phone">Phone Number *</Label>
                <Input
                  id="guest-phone"
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+27 123 456 7890"
                  required
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGuest ? (
              // Guest address form
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-address">Street Address *</Label>
                  <Input
                    id="guest-address"
                    value={guestAddress}
                    onChange={(e) => setGuestAddress(e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-city">City *</Label>
                    <Input
                      id="guest-city"
                      value={guestCity}
                      onChange={(e) => setGuestCity(e.target.value)}
                      placeholder="Cape Town"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-province">Province *</Label>
                    <Input
                      id="guest-province"
                      value={guestProvince}
                      onChange={(e) => setGuestProvince(e.target.value)}
                      placeholder="Western Cape"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-postal-code">Postal Code *</Label>
                  <Input
                    id="guest-postal-code"
                    value={guestPostalCode}
                    onChange={(e) => setGuestPostalCode(e.target.value)}
                    placeholder="8001"
                    required
                  />
                </div>
              </div>
            ) : addresses.length > 0 ? (
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

            {!isGuest && (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setShowAddressDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Address
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Delivery Method */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Method</CardTitle>
            {hasBulkOrders && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                <AlertTriangle className="h-4 w-4" />
                <span>PEP Send is not available for bulk orders (10+ items). Courier delivery required.</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
              {availableDeliveryOptions.map((option) => (
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

            {/* PEP Location Picker */}
            {deliveryMethod === "pep_send" && !hasBulkOrders && (
              <div className="mt-4 p-4 border rounded-lg bg-blue-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Select PEP Pax Pickup Point</h4>
                </div>
                <PepLocationPicker
                  selectedLocationId={selectedPepLocation?.id}
                  onLocationSelect={setSelectedPepLocation}
                />
              </div>
            )}
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
                const isBulkOrder = item.is_bulk_order
                const originalPrice = item.original_price || product.price
                const bulkPrice = item.bulk_price || product.price
                const pricePerUnit = isBulkOrder ? bulkPrice : product.price
                const itemTotal = pricePerUnit * item.quantity
                const itemSavings = item.bulk_savings || 0

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
                      {isBulkOrder && (
                        <div className="absolute top-1 left-1">
                          <Package className="h-3 w-3 text-green-600 bg-white rounded-full p-0.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-2">{product.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      {isBulkOrder ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground line-through">
                              R {originalPrice.toFixed(2)}
                            </span>
                            <span className="text-xs font-semibold text-green-600">
                              R {bulkPrice.toFixed(2)} each
                            </span>
                          </div>
                          <p className="font-semibold">R {itemTotal.toFixed(2)}</p>
                          {itemSavings > 0 && (
                            <p className="text-xs text-green-600">
                              Saved R {itemSavings.toFixed(2)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="font-semibold">R {itemTotal.toFixed(2)}</p>
                      )}
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
                  <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                    {deliveryFee === 0 ? 'FREE' : `R ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {subtotal >= FREE_SHIPPING_THRESHOLD && (
                  <div className="flex justify-between text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                    <span className="font-medium">🎉 Free Shipping Applied!</span>
                    <span className="font-semibold">-R {baseDeliveryFee.toFixed(2)}</span>
                  </div>
                )}
                {totalBulkSavings > 0 && (
                  <div className="flex justify-between text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                    <span className="font-medium">🎁 Bulk Order Savings</span>
                    <span className="font-semibold">-R {totalBulkSavings.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                    <span className="font-medium">Discount Applied</span>
                    <span className="font-semibold">-R {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className={discountAmount > 0 ? "text-green-600" : ""}>
                      R {total.toFixed(2)}
                    </span>
                  </div>
                  {(discountAmount > 0 || totalBulkSavings > 0) && (
                    <div className="text-xs text-green-600 text-right mt-1">
                      You saved R {(discountAmount + totalBulkSavings).toFixed(2)}!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={isProcessing || (!isGuest && !selectedAddress)}
              className="w-full h-12 bg-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isProcessing ? "Processing Payment..." : "Pay with Yoco"}
            </Button>

            <div className="flex items-center justify-center gap-2">
              <Image
                src="/yoco_logo.png"
                alt="Yoco"
                width={60}
                height={20}
                className="object-contain"
              />
              <p className="text-xs text-center text-muted-foreground">Secure payment powered by Yoco</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address Dialog */}
      <AddressDialog open={showAddressDialog} onOpenChange={setShowAddressDialog} />
    </div>
  )
}
