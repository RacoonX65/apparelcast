// Email utility functions using Resend

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  is_bulk_order?: boolean
  bulk_tier_id?: string | null
  original_price?: number | null
  bulk_price?: number | null
  bulk_savings?: number | null
  products?: {
    name: string
    image_url?: string
  }
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  orderTotal: number,
  orderItems: OrderItem[],
  totalBulkSavings?: number,
) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
    console.error("Resend API key not configured")
      return { success: false, error: "Email service not configured" }
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Apparel Cast <orders@apparelcast.shop>",
        to: [to],
        subject: `Order Confirmation - ${orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Order Confirmation</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #FADADD; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-family: Georgia, serif; font-size: 32px; color: #1a1a1a;">Apparel Cast</h1>
              </div>
              
              <div style="background-color: #ffffff; padding: 30px; border: 1px solid #E8D5D0; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #1a1a1a; margin-top: 0;">Thank you for your order from Apparel Cast!</h2>
                <p style="color: #666;">Your order has been confirmed and will be processed shortly.</p>
                
                <div style="background-color: #FFF9F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
                  <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #1a1a1a;">${orderNumber}</p>
                </div>
                
                <h3 style="color: #1a1a1a; margin-top: 30px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  ${orderItems
                    .map(
                      (item) => {
                        const isBulkOrder = item.is_bulk_order && item.bulk_price && item.original_price;
                        const itemPrice = isBulkOrder ? (item.bulk_price || 0) : (item.price || 0);
                        const itemTotal = itemPrice * item.quantity;
                        
                        return `
                    <tr style="border-bottom: 1px solid #E8D5D0;">
                      <td style="padding: 15px 0;">
                        <strong>${item.products?.name || 'Product'}</strong><br>
                        <span style="color: #666; font-size: 14px;">Qty: ${item.quantity}</span>
                        ${isBulkOrder ? `
                        <br><span style="color: #e67e22; font-size: 12px; font-weight: 600;">🎯 BULK ORDER</span>
                        <br><span style="color: #666; font-size: 12px;">Original: R ${(item.original_price || 0).toFixed(2)} each</span>
                        <br><span style="color: #e67e22; font-size: 12px; font-weight: 600;">Bulk Price: R ${(item.bulk_price || 0).toFixed(2)} each</span>
                        <br><span style="color: #27ae60; font-size: 12px; font-weight: 600;">You Save: R ${(((item.original_price || 0) - (item.bulk_price || 0)) * item.quantity).toFixed(2)}</span>
                        ` : ''}
                      </td>
                      <td style="padding: 15px 0; text-align: right;">
                        ${isBulkOrder ? `
                        <div style="text-decoration: line-through; color: #999; font-size: 12px;">R ${((item.original_price || 0) * item.quantity).toFixed(2)}</div>
                        ` : ''}
                        <strong>R ${itemTotal.toFixed(2)}</strong>
                      </td>
                    </tr>
                  `;
                      }
                    )
                    .join("")}
                  ${totalBulkSavings && totalBulkSavings > 0 ? `
                  <tr style="border-bottom: 1px solid #E8D5D0;">
                    <td style="padding: 15px 0; color: #27ae60; font-weight: 600;">
                      🎉 Total Bulk Order Savings
                    </td>
                    <td style="padding: 15px 0; text-align: right; color: #27ae60; font-weight: 600;">
                      -R ${totalBulkSavings.toFixed(2)}
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 15px 0;"><strong>Total</strong></td>
                    <td style="padding: 15px 0; text-align: right;"><strong>R ${orderTotal.toFixed(2)}</strong></td>
                  </tr>
                </table>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  You can track your order status from your account page. We'll send you another email when your order ships.
                </p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" style="display: inline-block; background-color: #FADADD; color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Order</a>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
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
    console.error("Email send error:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendShippingNotificationEmail(
  to: string,
  orderNumber: string,
  trackingCode: string,
  trackingUrl?: string,
) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
    console.error("Resend API key not configured")
      return { success: false, error: "Email service not configured" }
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Apparel Cast <orders@apparelcast.shop>",
        to: [to],
        subject: `Your Order is on the Way! - ${orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Order Shipped</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #FADADD; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-family: Georgia, serif; font-size: 32px; color: #1a1a1a;">Apparel Cast</h1>
              </div>
              
              <div style="background-color: #ffffff; padding: 30px; border: 1px solid #E8D5D0; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #1a1a1a; margin-top: 0;">🚚 Your Order is on the Way!</h2>
                <p style="color: #666; font-size: 16px;">Great news! Your order has been shipped and is making its way to you.</p>
                
                <div style="background-color: #FFF9F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
                  <p style="margin: 5px 0 15px 0; font-size: 20px; font-weight: bold; color: #1a1a1a;">${orderNumber}</p>
                  
                  <p style="margin: 0; color: #666; font-size: 14px;">Tracking Code</p>
                  <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #1a1a1a; font-family: monospace; background-color: #f5f5f5; padding: 8px; border-radius: 4px; display: inline-block;">${trackingCode}</p>
                </div>
                
                <p style="color: #666;">You can use this tracking code to monitor your package's progress. Most deliveries arrive within 3-5 business days.</p>
                
                ${
                  trackingUrl
                    ? `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${trackingUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-right: 10px;">Track Your Package</a>
                  </div>
                `
                    : ""
                }
                
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" style="display: inline-block; background-color: #FADADD; color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Order Details</a>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 16px;">What's Next?</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #666;">
                    <li>Keep an eye out for delivery notifications</li>
                    <li>Make sure someone is available to receive the package</li>
                    <li>Contact us if you have any questions about your delivery</li>
                  </ul>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                <p>© ${new Date().getFullYear()} Apparel Cast. All rights reserved.</p>
                <p>Questions? Reply to this email or contact our support team.</p>
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
    console.error("Email send error:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendOrderStatusUpdateEmail(
  to: string,
  orderNumber: string,
  newStatus: string,
  trackingNumber?: string,
) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
    console.error("Resend API key not configured")
      return { success: false, error: "Email service not configured" }
    }

    const statusMessages: Record<string, string> = {
      confirmed: "Your order has been confirmed and is being prepared.",
      processing: "Your order is currently being processed.",
      shipped: "Your order has been shipped and is on its way to you.",
      delivered: "Your order has been successfully delivered. If you have any questions, please contact us.",
      cancelled: "Your order has been cancelled. If you have any questions, please contact us.",
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Apparel Cast <orders@apparelcast.shop>",
        to: [to],
        subject: `Order Update - ${orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Order Update</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #FADADD; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-family: Georgia, serif; font-size: 32px; color: #1a1a1a;">Apparel Cast</h1>
              </div>
              
              <div style="background-color: #ffffff; padding: 30px; border: 1px solid #E8D5D0; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #1a1a1a; margin-top: 0;">Order Status Update</h2>
                
                <div style="background-color: #FFF9F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
                  <p style="margin: 5px 0 15px 0; font-size: 20px; font-weight: bold; color: #1a1a1a;">${orderNumber}</p>
                  
                  <p style="margin: 0; color: #666; font-size: 14px;">Status</p>
                  <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #1a1a1a; text-transform: capitalize;">${newStatus}</p>
                </div>
                
                <p style="color: #666;">${statusMessages[newStatus] || "Your order status has been updated."}</p>
                
                ${
                  trackingNumber
                    ? `
                  <div style="background-color: #FFF9F5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #666; font-size: 14px;">Tracking Number</p>
                    <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #1a1a1a;">${trackingNumber}</p>
                  </div>
                `
                    : ""
                }
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" style="display: inline-block; background-color: #FADADD; color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Order Details</a>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
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
    console.error("Email send error:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendBackInStockEmail(to: string, productName: string, productUrl: string) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error("Resend API key not configured")
      return { success: false, error: "Email service not configured" }
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Apparel Cast <alerts@apparelcast.shop>",
        to: [to],
        subject: `${productName} is back in stock!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Back in Stock</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #FADADD; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-family: Georgia, serif; font-size: 32px; color: #1a1a1a;">Apparel Cast</h1>
              </div>
              <div style="background: #fff; padding: 24px; border: 1px solid #eee; border-top: none;">
                <h2 style="margin-top: 0;">Good news!</h2>
                <p><strong>${productName}</strong> is now back in stock.</p>
                <p>
                  Hurry while it lasts — click below to grab yours:
                </p>
                <p style="text-align: center; margin: 28px 0;">
                  <a href="${productUrl}" style="background: #FADADD; color: #1a1a1a; text-decoration: none; padding: 12px 18px; border-radius: 6px; display: inline-block; font-weight: 600;">
                    View Product
                  </a>
                </p>
                <p style="color: #666; font-size: 14px;">If you no longer want alerts, ignore this email.</p>
              </div>
              <div style="text-align: center; color: #999; font-size: 12px; padding: 16px;">
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
    console.error("Back-in-stock email send error:", error)
    return { success: false, error: "Failed to send email" }
  }
}

// Send a "New Arrivals" newsletter featuring a list of products
export async function sendNewArrivalsEmail(
  to: string,
  products: Array<{ id: string; name: string; price: number; image_url?: string; slug?: string }>,
) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error("Resend API key not configured")
      return { success: false, error: "Email service not configured" }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const productCardsHtml = products
      .map((p) => {
        const href = `${appUrl}/products/${p.slug || p.id}`
        const img = p.image_url || 
          `/placeholder.svg?height=300&width=220&query=${encodeURIComponent(p.name)}`
        return `
          <div style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <a href="${href}" style="text-decoration: none; color: inherit;">
              <img src="${img}" alt="${p.name}" style="width: 100%; height: 220px; object-fit: cover; display: block;" />
              <div style="padding: 12px;">
                <div style="font-weight: 600; font-size: 14px; line-height: 1.4;">${p.name}</div>
                <div style="margin-top: 6px; font-size: 13px; color: #1a1a1a; font-weight: 600;">R ${p.price.toFixed(2)}</div>
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
        from: "Apparel Cast <news@apparelcast.shop>",
        to: [to],
        subject: "New Arrivals at Apparel Cast ✨",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Arrivals</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 680px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #FADADD; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-family: Georgia, serif; font-size: 30px; color: #1a1a1a;">Apparel Cast</h1>
              </div>
              
              <div style="background-color: #ffffff; padding: 26px; border: 1px solid #E8D5D0; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #1a1a1a; margin-top: 0;">Fresh Drops — Just Arrived</h2>
                <p style="color: #666;">We’ve added new products to the store. Tap to explore and shop the latest styles.</p>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 18px;">
                  ${productCardsHtml}
                </div>
                
                <div style="text-align: center; margin-top: 24px;">
                  <a href="${appUrl}/products?filter=new" style="display: inline-block; background-color: #FADADD; color: #1a1a1a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Shop New Arrivals</a>
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
    console.error("New arrivals email send error:", error)
    return { success: false, error: "Failed to send email" }
  }
}
