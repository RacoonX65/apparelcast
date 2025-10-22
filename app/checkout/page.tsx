"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { CheckoutForm } from "@/components/checkout-form"
import { getGuestCartItems } from "@/lib/guest-cart"
import { useEffect, useState } from "react"
import { useCartWishlist } from "@/contexts/cart-wishlist-context"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
}

interface CartItem {
  id: string
  product_id: string
  quantity: number
  size: string
  color: string
  is_bulk_order: boolean
  bulk_tier_id: string | null
  original_price: number
  bulk_price: number | null
  bulk_savings: number
  products: Product
}

interface GuestCartItem {
  productId: string
  quantity: number
  size?: string
  color?: string
  isBulkOrder?: boolean
  bulkTierId?: string
  originalPrice?: number
  bulkPrice?: number
  bulkSavings?: number
  specialOfferId?: string
  specialOfferPrice?: number
  addedAt: string
  updatedAt?: string
  id: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems } = useCartWishlist()
  const [user, setUser] = useState<any>(null)
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

        let items: CartItem[] = []
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
            items = guestCartItems.map((item: GuestCartItem) => {
              const product = products?.find((p: Product) => p.id === item.productId)
              return {
                id: `guest-${item.productId}-${item.size || 'default'}-${item.color || 'default'}`,
                product_id: item.productId,
                quantity: item.quantity,
                size: item.size || 'default',
                color: item.color || 'default',
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

        // Update local state instead of trying to modify context
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
  const subtotal = cartItems.reduce((sum: number, item: CartItem) => {
    const product = item.products
    const pricePerUnit = item.is_bulk_order && item.bulk_price ? item.bulk_price : (product?.price || item.original_price)
    return sum + pricePerUnit * item.quantity
  }, 0)

  // Calculate total bulk savings
  const totalBulkSavings = cartItems.reduce((sum: number, item: CartItem) => {
    const product = item.products
    if (item.is_bulk_order && item.bulk_price) {
      const regularPrice = product?.price || item.original_price
      return sum + (regularPrice - item.bulk_price) * item.quantity
    }
    return sum
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
