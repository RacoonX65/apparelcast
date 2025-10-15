import { createClient } from "@/lib/supabase/server"

interface DiscountCode {
  id: string
  code: string
  description: string | null
  discount_type: string
  discount_value: number
  minimum_order_amount: number
  valid_until: string | null
}

interface NewsletterSubscriber {
  id: string
  email: string
  is_active: boolean
}

export class EmailService {
  private async getSupabaseClient() {
    return await createClient()
  }

  /**
   * Send discount code notification to all active newsletter subscribers
   */
  async notifySubscribersOfNewDiscount(discountCode: DiscountCode) {
    try {
      const supabase = await this.getSupabaseClient()
      
      // Get all active newsletter subscribers
      const { data: subscribers, error: subscribersError } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .eq("is_active", true)

      if (subscribersError) {
        console.error("Error fetching subscribers:", subscribersError)
        return { success: false, error: subscribersError.message }
      }

      if (!subscribers || subscribers.length === 0) {
        console.log("No active subscribers found")
        return { success: true, message: "No subscribers to notify" }
      }

      // Format discount information
      const discountValue = discountCode.discount_type === "percentage" 
        ? `${discountCode.discount_value}%` 
        : `R${discountCode.discount_value}`

      const subject = `🎉 New Discount Code: Save ${discountValue}!`
      
      const emailContent = this.generateDiscountEmailHTML(discountCode, discountValue)

      // In a real application, you would integrate with an email service like:
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Resend
      // - Nodemailer with SMTP
      
      // For now, we'll log the email details and store them in a notifications table
      const notifications = subscribers.map(subscriber => ({
        email: subscriber.email,
        subject: subject,
        content: emailContent,
        discount_code_id: discountCode.id,
        sent_at: new Date().toISOString(),
        status: 'pending' // In real implementation, this would be 'sent' after successful delivery
      }))

      // Store notifications in database (you would need to create this table)
      const { error: notificationError } = await supabase
        .from("email_notifications")
        .insert(notifications)

      if (notificationError) {
        console.error("Error storing notifications:", notificationError)
        // Continue anyway as this is just for tracking
      }

      console.log(`Discount notification prepared for ${subscribers.length} subscribers`)
      console.log("Email Subject:", subject)
      console.log("Discount Code:", discountCode.code)
      
      // In a real implementation, you would send actual emails here
      // Example with a hypothetical email service:
      /*
      for (const subscriber of subscribers) {
        await this.sendEmail({
          to: subscriber.email,
          subject: subject,
          html: emailContent
        })
      }
      */

      return { 
        success: true, 
        message: `Notification prepared for ${subscribers.length} subscribers`,
        subscriberCount: subscribers.length
      }

    } catch (error) {
      console.error("Error in notifySubscribersOfNewDiscount:", error)
      return { success: false, error: "Failed to send notifications" }
    }
  }

  /**
   * Generate HTML email content for discount notifications
   */
  private generateDiscountEmailHTML(discountCode: DiscountCode, discountValue: string): string {
    const expiryText = discountCode.valid_until 
      ? `Valid until ${new Date(discountCode.valid_until).toLocaleDateString('en-ZA', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}`
      : "No expiry date"

    const minPurchaseText = discountCode.minimum_order_amount > 0
      ? `Minimum purchase: R${discountCode.minimum_order_amount}`
      : "No minimum purchase required"

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Discount Code Available!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .discount-code { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .code { font-size: 24px; font-weight: bold; color: #667eea; font-family: monospace; letter-spacing: 2px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Special Offer Just for You!</h1>
            <p>Save ${discountValue} on your next purchase</p>
          </div>
          
          <div class="content">
            <h2>Hello!</h2>
            <p>We're excited to share a new discount code with you:</p>
            
            ${discountCode.description ? `<p><strong>${discountCode.description}</strong></p>` : ''}
            
            <div class="discount-code">
              <p>Use code:</p>
              <div class="code">${discountCode.code}</div>
              <p>Save ${discountValue} on your order</p>
            </div>
            
            <p><strong>Details:</strong></p>
            <ul>
              <li>${minPurchaseText}</li>
              <li>${expiryText}</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products" class="cta-button">
                Shop Now
              </a>
            </div>
            
            <p>Don't miss out on this amazing deal!</p>
          </div>
          
          <div class="footer">
            <p>You received this email because you subscribed to our newsletter.</p>
            <p>© ${new Date().getFullYear()} Apparel Cast. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Get newsletter subscriber statistics
   */
  async getSubscriberStats() {
    try {
      const supabase = await this.getSupabaseClient()
      
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("is_active")

      if (error) {
        throw error
      }

      const total = data?.length || 0
      const active = data?.filter(sub => sub.is_active).length || 0

      return {
        total,
        active,
        inactive: total - active
      }
    } catch (error) {
      console.error("Error getting subscriber stats:", error)
      return { total: 0, active: 0, inactive: 0 }
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService()