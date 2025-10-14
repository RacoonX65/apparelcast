// WhatsApp message templates for manual sending
export function formatOrderConfirmationMessage(orderNumber: string, orderTotal: number, customerName: string): string {
  return `Hi ${customerName}! 🎉

Thank you for your order at Caarl!

*Order Number:* ${orderNumber}
*Total:* R ${orderTotal.toFixed(2)}

Your order has been confirmed and will be processed shortly. We'll keep you updated on its progress.

Track your order: ${process.env.NEXT_PUBLIC_APP_URL}/account/orders

Thank you for shopping with us! 💕

- Caarl Team`
}

export function formatOrderUpdateMessage(orderNumber: string, newStatus: string, customerName: string): string {
  const statusEmojis: Record<string, string> = {
    confirmed: "✅",
    processing: "⚙️",
    shipped: "🚚",
    delivered: "📦",
    cancelled: "❌",
  }

  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed!",
    processing: "Your order is being prepared.",
    shipped: "Your order is on its way!",
    delivered: "Your order has been delivered!",
    cancelled: "Your order has been cancelled.",
  }

  return `Hi ${customerName}! ${statusEmojis[newStatus] || "📢"}

*Order Update*

*Order Number:* ${orderNumber}
*Status:* ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}

${statusMessages[newStatus] || "Your order status has been updated."}

View details: ${process.env.NEXT_PUBLIC_APP_URL}/account/orders

- Caarl Team`
}
