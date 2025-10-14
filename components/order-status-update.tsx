"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
}

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleUpdate = async () => {
    setIsLoading(true)

    try {
      // Update order status
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId)

      if (error) throw error

      // Send notification via API route
      await fetch("/api/orders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          newStatus: status,
        }),
      })

      toast({
        title: "Status updated",
        description: "Order status has been updated and customer notified.",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Status update error:", error)
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

      <Button
        onClick={handleUpdate}
        disabled={isLoading || status === currentStatus}
        className="w-full bg-primary hover:bg-accent"
      >
        {isLoading ? "Updating..." : "Update & Notify Customer"}
      </Button>
    </div>
  )
}
