"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Gift, Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if email already exists
      const { data: existingSubscriber } = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("email", email)
        .single()

      if (existingSubscriber) {
        toast({
          title: "Already subscribed",
          description: "This email is already subscribed to our newsletter",
        })
        setIsLoading(false)
        return
      }

      // Add to newsletter subscribers
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([
          {
            email: email,
            subscribed_at: new Date().toISOString(),
            is_active: true,
          }
        ])

      if (error) {
        throw error
      }

      setIsSubscribed(true)
      toast({
        title: "Successfully subscribed!",
        description: "You'll be the first to know about new discount codes",
      })
      
      setEmail("")
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      toast({
        title: "Subscription failed",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">You're all set!</h3>
          <p className="text-muted-foreground text-sm">
            We'll notify you whenever new discount codes are available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl">Stay Updated</CardTitle>
        <p className="text-muted-foreground text-sm">
          Get notified about new discount codes and exclusive offers
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Subscribe for Offers
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default NewsletterSignup