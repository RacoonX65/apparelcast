"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteOrderButtonProps {
  orderId: string
  orderNumber: string
}

export function DeleteOrderButton({ orderId, orderNumber }: DeleteOrderButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Delete order items first (foreign key constraint)
      const { error: itemsError } = await supabase.from("order_items").delete().eq("order_id", orderId)

      if (itemsError) throw itemsError

      // Delete the order
      const { error: orderError } = await supabase.from("orders").delete().eq("id", orderId)

      if (orderError) throw orderError

      toast({
        title: "Order deleted",
        description: `Order #${orderNumber} has been deleted successfully.`,
      })

      router.push("/admin/orders")
      router.refresh()
    } catch (error) {
      console.error("[v0] Delete order error:", error)
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full" disabled={isDeleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete order #{orderNumber} and all associated order
            items from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
            {isDeleting ? "Deleting..." : "Delete Order"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
