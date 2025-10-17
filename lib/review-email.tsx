// Email utility to invite customers to review items after delivery

interface ReviewInviteItem {
  product_id: string
  name?: string
  image_url?: string
  product?: {
    slug?: string
  }
}

export async function sendReviewInvitationEmail(
  to: string,
  orderNumber: string,
  items: ReviewInviteItem[],
) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error("Resend API key not configured")
      return { success: false, error: "Email service not configured" }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const productCardsHtml = (items || [])
      .map((item) => {
        const href = `${appUrl}/products/${item.product?.slug || item.product_id}`
        const img = item.image_url || `/placeholder.svg?height=220&width=180&query=${encodeURIComponent(item.name || 'Product')}`
        const name = item.name || "Product"
        return `
          <div style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <a href="${href}" style="text-decoration: none; color: inherit; display: block;">
              <img src="${img}" alt="${name}" style="width: 100%; height: 180px; object-fit: cover; display: block;" />
              <div style="padding: 12px;">
                <div style="font-weight: 600; font-size: 14px; line-height: 1.4;">${name}</div>
                <div style="text-align: center; margin-top: 10px;">
                  <a href="${href}" style="display: inline-block; background-color: #FADADD; color: #1a1a1a; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: 600;">Leave a Review</a>
                </div>
              </div>
            </a>
          </div>
        `
      })
      .join("")

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Apparel Cast <orders@apparelcast.shop>",
        to: [to],
        subject: `Thanks for your purchase — Review your items (Order ${orderNumber})`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Review Your Items</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 680px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #FADADD; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-family: Georgia, serif; font-size: 30px; color: #1a1a1a;">Apparel Cast</h1>
              </div>

              <div style="background-color: #ffffff; padding: 26px; border: 1px solid #E8D5D0; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #1a1a1a; margin-top: 0;">Your order was delivered</h2>
                <p style="color: #666;">We’d love to hear your feedback. Please rate and review your items from order <strong>#${orderNumber}</strong>.</p>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 18px;">
                  ${productCardsHtml}
                </div>

                <div style="text-align: center; margin-top: 24px;">
                  <a href="${appUrl}/account/orders" style="display: inline-block; background-color: #FADADD; color: #1a1a1a; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Order</a>
                </div>
              </div>

              <div style="text-align: center; margin-top: 24px; color: #999; font-size: 12px;">
                <p>© ${new Date().getFullYear()} Apparel Cast. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Resend email error:", data)
      return { success: false, error: data.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Review invitation email send error:", error)
    return { success: false, error: "Failed to send email" }
  }
}