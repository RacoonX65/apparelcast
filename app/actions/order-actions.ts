"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function verifyPaymentAndUpdateOrder(orderId: string, paymentReference: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    console.log("[v0] Verifying payment for order:", orderId, "reference:", paymentReference)

    // Update order with payment reference and status
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        payment_reference: paymentReference,
        payment_status: "paid",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("user_id", user.id) // Ensure user owns this order
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Error updating order:", updateError)
      return { success: false, error: updateError.message }
    }

    console.log("[v0] Order updated successfully:", order)

    // Clear user's cart
    const { error: cartError } = await supabase.from("cart_items").delete().eq("user_id", user.id)

    if (cartError) {
      console.error("[v0] Error clearing cart:", cartError)
    }

    // Revalidate relevant paths
    revalidatePath("/cart")
    revalidatePath("/account/orders")
    revalidatePath("/admin/orders")

    return { success: true, order }
  } catch (error) {
    console.error("[v0] Exception in verifyPaymentAndUpdateOrder:", error)
    return { success: false, error: "Failed to verify payment" }
  }
}

export async function getOrderDetails(orderId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items(
          *,
          product:products(*)
        ),
        address:addresses(*)
      `,
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("[v0] Error fetching order:", error)
      return { success: false, error: error.message }
    }

    return { success: true, order }
  } catch (error) {
    console.error("[v0] Exception in getOrderDetails:", error)
    return { success: false, error: "Failed to fetch order" }
  }
}