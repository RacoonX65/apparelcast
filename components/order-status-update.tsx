"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
  trackingCode?: string
  trackingUrl?: string
}

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"]

export function OrderStatusUpdate({ orderId, currentStatus, trackingCode, trackingUrl }: OrderStatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus)
  const [newTrackingCode, setNewTrackingCode] = useState(trackingCode || "")
  const [newTrackingUrl, setNewTrackingUrl] = useState(trackingUrl || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleUpdate = async () => {
    setIsLoading(true)

    try {
      // Prepare update data
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      }

      // If status is being set to shipped, include tracking information and timestamp
      if (status === "shipped") {
        updateData.tracking_code = newTrackingCode || null
        updateData.tracking_url = newTrackingUrl || null
        updateData.shipped_at = new Date().toISOString()
      }

      // Update order status
      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId)

      if (error) throw error

      // Send notification via API route
      console.log("Sending notification for order:", orderId, "status:", status)
      const notifyResponse = await fetch("/api/orders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          newStatus: status,
          trackingCode: status === "shipped" ? newTrackingCode : undefined,
          trackingUrl: status === "shipped" ? newTrackingUrl : undefined,
        }),
      })

      const notifyResult = await notifyResponse.json()
      console.log("Notification API response:", notifyResult)

      if (!notifyResponse.ok) {
        console.error("Notification API error:", notifyResult)
        throw new Error(`Notification failed: ${notifyResult.error || 'Unknown error'}`)
      }

      toast({
        title: "Status updated",
        description: status === "shipped" && newTrackingCode 
          ? "Order marked as shipped and tracking information sent to customer."
          : "Order status has been updated and customer notified.",
      })

      router.refresh()
    } catch (error) {
    console.error("Status update error:", error)
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Order Status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Show tracking fields when status is shipped */}
      {status === "shipped" && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium text-sm">Shipping Information</h4>
          
          <div className="space-y-2">
            <Label htmlFor="tracking-code">Tracking Code</Label>
            <Input
              id="tracking-code"
              value={newTrackingCode}
              onChange={(e) => setNewTrackingCode(e.target.value)}
              placeholder="Enter tracking number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking-url">Tracking URL (Optional)</Label>
            <Input
              id="tracking-url"
              value={newTrackingUrl}
              onChange={(e) => setNewTrackingUrl(e.target.value)}
              placeholder="https://tracking.courier.com/track?id="
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleUpdate}
        disabled={isLoading || (status === currentStatus && newTrackingCode === (trackingCode || ""))}
        className="w-full bg-primary hover:bg-accent"
      >
        {isLoading ? "Updating..." : "Update & Notify Customer"}
      </Button>
    </div>
  )
}
