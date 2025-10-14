"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { verifyPaymentAndUpdateOrder } from "@/actions/order-actions"


interface CheckoutClientProps {
  cartItems: any[]
  savedAddresses: any[]
  userProfile: any
  userEmail: string
}

const DELIVERY_FEES = {
  courier_guy: 99.0,
  pudo: 65.0,
}

declare global {
  interface Window {
    PaystackPop?: any
  }
}

export function CheckoutClient({ cartItems, savedAddresses, userProfile, userEmail }: CheckoutClientProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<"courier_guy" | "pudo">("courier_guy")
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.find((addr) => addr.is_default)?.id || "",
  )
  const [isNewAddress, setIsNewAddress] = useState(savedAddresses.length === 0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaystackLoaded, setIsPaystackLoaded] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [newAddress, setNewAddress] = useState({
    full_name: userProfile?.full_name || "",
    phone: userProfile?.phone || "",
    street_address: "",
    city: "",
    province: "",
    postal_code: "",
  })

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const deliveryFee = DELIVERY_FEES[deliveryMethod]
  const total = subtotal + deliveryFee

  useEffect(() => {
    const checkPaystack = () => {
      if (typeof window !== "undefined" && window.PaystackPop) {
        setIsPaystackLoaded(true)
      } else {
        setTimeout(checkPaystack, 100)
      }
    }
    checkPaystack()
  }, [])

  const handlePayment = async () => {
    if (!isPaystackLoaded || !window.PaystackPop) {
      toast({
        title: "Payment system loading",
        description: "Please wait a moment and try again.",
        variant: "destructive",
      })
      return
    }

    if (!isNewAddress && !selectedAddressId) {
      toast({
        title: "Please select a delivery address",
        variant: "destructive",
      })
      return
    }

    if (isNewAddress) {
      if (
        !newAddress.full_name ||
        !newAddress.phone ||
        !newAddress.street_address ||
        !newAddress.city ||
        !newAddress.province ||
        !newAddress.postal_code
      ) {
        toast({
          title: "Please fill in all address fields",
          variant: "destructive",
        })
        return
      }
    }

    setIsProcessing(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      let addressId = selectedAddressId

      if (isNewAddress) {
        const { data: newAddr, error: addrError } = await supabase
          .from("addresses")
          .insert({
            user_id: user.id,
            ...newAddress,
            is_default: savedAddresses.length === 0,
          })
          .select()
          .single()

        if (addrError) {
          console.error("Error creating address:", addrError)
          throw addrError
        }
        addressId = newAddr.id
      }

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: "pending",
          total_amount: total,
          delivery_method: deliveryMethod,
          delivery_fee: deliveryFee,
          address_id: addressId,
          payment_status: "pending",
        })
        .select()
        .single()

      if (orderError) {
        console.error("[v0] Error creating order:", orderError)
        throw orderError
      }

      console.log("[v0] Order created successfully:", order.id)

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("[v0] Error creating order items:", itemsError)
        throw itemsError
      }

      console.log("[v0] Order items created successfully")

      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

      if (!paystackKey) {
        console.error("[v0] Paystack public key is missing")
        toast({
          title: "Configuration Error",
          description: "Payment system is not configured. Please contact support.",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      console.log("[v0] Initializing Paystack payment for order:", order.id)

      try {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: userEmail,
          amount: Math.round(total * 100),
          currency: "ZAR",
          ref: orderNumber,
          metadata: {
            order_id: order.id,
            order_number: orderNumber,
            custom_fields: [
              {
                display_name: "Order Number",
                variable_name: "order_number",
                value: orderNumber,
              },
            ],
          },
          callback: async (response: any) => {
            const result = await verifyPaymentAndUpdateOrder(order.id, response.reference)

            if (result.success) {
              toast({
                title: "Payment successful!",
                description: "Your order has been placed.",
              })
              router.push(`/order-confirmation/${order.id}`)
            } else {
              console.error("[v0] Failed to update order:", result.error)
              toast({
                title: "Payment received but order update failed",
                description: "Please contact support with your order number: " + orderNumber,
                variant: "destructive",
              })
              router.push(`/order-confirmation/${order.id}`)
            }
          },
          onClose: () => {
            setIsProcessing(false)
            toast({
              title: "Payment cancelled",
              description: "You can complete your payment anytime from your orders page.",
            })
          },
        })

        handler.openIframe()
      } catch (paystackError) {
        console.error("[v0] Paystack initialization error:", paystackError)
        toast({
          title: "Payment Error",
          description: "Failed to open payment window. Please try again.",
          variant: "destructive",
        })
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("[v0] Error processing checkout:", error)
      toast({
        title: "Error",
        description: "Failed to process checkout. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif text-foreground mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedAddresses.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="saved-address"
                      checked={!isNewAddress}
                      onChange={() => setIsNewAddress(false)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="saved-address">Use saved address</Label>
                  </div>

                  {!isNewAddress && (
                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      <div className="space-y-2">
                        {savedAddresses.map((address) => (
                          <div key={address.id} className="flex items-start gap-2">
                            <RadioGroupItem value={address.id} id={`addr-${address.id}`} />
                            <Label htmlFor={`addr-${address.id}`} className="flex-1 cursor-pointer">
                              <div className="text-sm">
                                <p className="font-medium">{address.full_name}</p>
                                <p className="text-muted-foreground">
                                  {address.street_address}, {address.city}, {address.province} {address.postal_code}
                                </p>
                                <p className="text-muted-foreground">{address.phone}</p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="new-address"
                      checked={isNewAddress}
                      onChange={() => setIsNewAddress(true)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="new-address">Add new address</Label>
                  </div>
                </div>
              )}

              {isNewAddress && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={newAddress.full_name}
                        onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street_address">Street Address</Label>
                    <Input
                      id="street_address"
                      value={newAddress.street_address}
                      onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        value={newAddress.province}
                        onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        value={newAddress.postal_code}
                        onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={deliveryMethod} onValueChange={(value: any) => setDeliveryMethod(value)}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="courier_guy" id="courier_guy" />
                      <Label htmlFor="courier_guy" className="cursor-pointer">
                        <div>
                          <p className="font-medium">Courier Guy</p>
                          <p className="text-sm text-muted-foreground">Door-to-door delivery (3-5 business days)</p>
                        </div>
                      </Label>
                    </div>
                    <span className="font-medium">R {DELIVERY_FEES.courier_guy.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="pudo" id="pudo" />
                      <Label htmlFor="pudo" className="cursor-pointer">
                        <div>
                          <p className="font-medium">Pudo Locker</p>
                          <p className="text-sm text-muted-foreground">
                            Collect from nearest Pudo point (2-4 business days)
                          </p>
                        </div>
                      </Label>
                    </div>
                    <span className="font-medium">R {DELIVERY_FEES.pudo.toFixed(2)}</span>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                      <Image
                        src={item.product.image_url || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      {item.size && <p className="text-muted-foreground">Size: {item.size}</p>}
                      {item.color && <p className="text-muted-foreground">Color: {item.color}</p>}
                      <p className="font-medium mt-1">R {(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">R {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">R {deliveryFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-medium text-foreground">R {total.toFixed(2)}</span>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={handlePayment} disabled={isProcessing || !isPaystackLoaded}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : !isPaystackLoaded ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading payment...
                  </>
                ) : (
                  "Pay with Paystack"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">Secure payment powered by Paystack</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
