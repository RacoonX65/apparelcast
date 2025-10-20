"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { CheckoutForm } from "@/components/checkout-form"
import { getGuestCartItems } from "@/lib/guest-cart"
import { useEffect, useState } from "react"

export default function CheckoutPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [userEmail, setUserEmail] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        // Get current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        setUser(currentUser)

        let items: any[] = []
        let userAddrs: any[] = []
        let email = ""
        let phone = ""

        if (currentUser) {
          // Fetch cart items with product details and bulk pricing information for authenticated user
          const { data: userCartItems } = await supabase
            .from("cart_items")
            .select(
              `
              *,
              is_bulk_order,
              bulk_tier_id,
              original_price,
              bulk_price,
              bulk_savings,
              products (
                id,
                name,
                price,
                image_url
              )
            `,
            )
            .eq("user_id", currentUser.id)

          items = userCartItems || []

          // Fetch user addresses
          const { data: userAddresses } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("is_default", { ascending: false })

          userAddrs = userAddresses || []

          // Fetch user profile
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()
          
          email = currentUser.email || ""
          phone = profile?.phone || ""
        } else {
          // Handle guest user - get cart items from localStorage
          const guestCartItems = getGuestCartItems()
          
          if (guestCartItems.length > 0) {
            // Fetch product details for guest cart items
            const productIds = guestCartItems.map(item => item.productId)
            const { data: products } = await supabase
              .from("products")
              .select("id, name, price, image_url")
              .in("id", productIds)

            // Map guest cart items to match the format expected by CheckoutForm
            items = guestCartItems.map((item: any) => {
              const product = products?.find(p => p.id === item.productId)
              return {
                id: `guest-${item.productId}-${item.size}-${item.color}`,
                product_id: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                is_bulk_order: false,
                bulk_tier_id: null,
                original_price: product?.price || 0,
                bulk_price: null,
                bulk_savings: 0,
                products: product
              }
            })
          }

          // Guest users have no addresses
          userAddrs = []
        }

        if (!items || items.length === 0) {
          router.push("/cart")
          return
        }

        setCartItems(items)
        setAddresses(userAddrs)
        setUserEmail(email)
        setUserPhone(phone)
      } catch (error) {
        console.error('Error loading checkout data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCheckoutData()
  }, [supabase, router])

  // Calculate subtotal using bulk prices when applicable
  const subtotal = cartItems.reduce((sum, item) => {
    const product = item.products as any
    const pricePerUnit = item.is_bulk_order && item.bulk_price ? item.bulk_price : (product?.price || item.original_price)
    return sum + pricePerUnit * item.quantity
  }, 0)

  // Calculate total bulk savings
  const totalBulkSavings = cartItems.reduce((sum, item) => {
    return sum + (item.bulk_savings || 0)
  }, 0)

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-serif font-semibold mb-8">Checkout</h1>

          <CheckoutForm
            cartItems={cartItems}
            addresses={addresses || []}
            subtotal={subtotal}
            totalBulkSavings={totalBulkSavings}
            userEmail={userEmail}
            userPhone={userPhone}
            isGuest={!user}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
