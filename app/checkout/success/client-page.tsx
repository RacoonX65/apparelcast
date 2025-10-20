'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import OrderStatusChecker to prevent SSR issues
const OrderStatusChecker = dynamic(
  () => import("@/components/order-status-checker").then(mod => ({ default: mod.OrderStatusChecker })),
  { ssr: false }
)

interface ClientPageProps {
  initialOrder: any
  verificationError: string | null
  clearGuestCart?: boolean
}

export function ClientPage({ initialOrder, verificationError, clearGuestCart }: ClientPageProps) {
  const [order, setOrder] = useState(initialOrder)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Clear guest cart if requested
    if (clearGuestCart && typeof window !== 'undefined') {
      localStorage.removeItem('guest_cart')
    }
  }, [clearGuestCart])

  const handleOrderUpdate = (updatedOrder: any) => {
    console.log('Updating order in ClientPage:', updatedOrder)
    setOrder(updatedOrder)
  }

  return (
    <>
      {mounted && (
        <OrderStatusChecker 
          orderId={order?.id} 
          initialOrder={initialOrder}
          onOrderUpdate={handleOrderUpdate}
        />
      )}
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-serif">Order Confirmed!</CardTitle>
            {verificationError && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Payment Verification Warning:</strong> {verificationError}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Your order has been placed, but we couldn't verify the payment status. Please contact support if needed.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Thank you for your order</p>
              <p className="text-2xl font-semibold">Order #{order?.order_number}</p>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Total</span>
                <span className="font-semibold">R {order?.total_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span className={`font-semibold capitalize ${
                  order?.payment_status === 'paid' ? 'text-green-600' : 
                  order?.payment_status === 'pending' ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {order?.payment_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Method</span>
                <span className="font-semibold capitalize">{order?.delivery_method?.replace("-", " ")}</span>
              </div>
            </div>

            {order?.addresses && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{order.addresses.full_name}</p>
                  <p>{order.addresses.street_address}</p>
                  <p>
                    {order.addresses.city}, {order.addresses.province} {order.addresses.postal_code}
                  </p>
                </div>
              </div>
            )}

            <div className="border-t pt-6 space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                We've sent a confirmation email with your order details. You can track your order from your account
                page.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <Link href="/account/orders">View Orders</Link>
                </Button>
                <Button asChild className="flex-1 bg-primary hover:bg-accent">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}