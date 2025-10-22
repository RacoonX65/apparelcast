"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface BackInStockSubscribeProps {
  productId: string
  productName: string
}

export function BackInStockSubscribe({ productId, productName }: BackInStockSubscribeProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
        // If logged in, check existing subscription
        const { data: existing } = await supabase
          .from("back_in_stock_subscriptions")
          .select("id, notified_at")
          .eq("product_id", productId)
          .eq("email", user.email)
          .maybeSingle()
        if (existing) {
          setIsSubscribed(true)
        }
      }
    })()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email address", variant: "destructive" })
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from("back_in_stock_subscriptions").insert({
        product_id: productId,
        email,
        user_id: user?.id || null,
      })
      if (error) {
        if ((error as any).code === "23505") {
          // unique violation
          setIsSubscribed(true)
          toast({ title: "Already subscribed", description: "We will notify you when this item is back." })
        } else {
          throw error
        }
      } else {
        setIsSubscribed(true)
        toast({
          title: "Subscribed",
          description: `You'll be emailed when ${productName} is back in stock.`,
        })
      }
    } catch (err) {
      console.error("Back in stock subscribe error:", err)
      toast({ title: "Subscription failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/50">
      <h3 className="font-medium mb-2">Out of stock — get notified</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Enter your email and we'll let you know when it's back.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubscribed}
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting || isSubscribed} className="bg-primary hover:bg-accent">
          {isSubscribed ? "Subscribed" : isSubmitting ? "Subscribing…" : "Notify me"}
        </Button>
      </form>
    </div>
  )
}