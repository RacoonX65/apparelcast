"use client"

import Link from "next/link"
import { ShoppingBag, User, Menu, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect, lazy, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Lazy load non-critical components
const SearchBar = lazy(() => import("@/components/search-bar").then(module => ({ default: module.SearchBar })))
const PromotionalBanner = lazy(() => import("@/components/promotional-banner").then(module => ({ default: module.PromotionalBanner })))

export function Header() {
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get user and cart count with optimized queries
    const fetchUserAndCart = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Batch queries for better performance
        const [profileResult, cartResult, wishlistResult] = await Promise.all([
          supabase.from("profiles").select("is_admin").eq("id", user.id).single(),
          supabase.from("cart_items").select("quantity").eq("user_id", user.id),
          supabase.from("wishlist").select("id").eq("user_id", user.id)
        ])

        setIsAdmin(profileResult.data?.is_admin || false)
        
        const cartTotal = cartResult.data?.reduce((sum, item) => sum + item.quantity, 0) || 0
        setCartCount(cartTotal)
        
        setWishlistCount(wishlistResult.data?.length || 0)
      }
    }

    fetchUserAndCart()

    // Debounced subscription to reduce unnecessary updates
    let timeoutId: NodeJS.Timeout
    const debouncedFetch = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(fetchUserAndCart, 300)
    }

    // Subscribe to cart changes
    const channel = supabase
      .channel("cart-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items" }, debouncedFetch)
      .subscribe()

    const wishlistChannel = supabase
      .channel("wishlist-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "wishlist" }, debouncedFetch)
      .subscribe()

    return () => {
      clearTimeout(timeoutId)
      supabase.removeChannel(channel)
      supabase.removeChannel(wishlistChannel)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    router.push("/")
    router.refresh()
  }

  const navigation = [
    { name: "New Arrivals", href: "/products?filter=new" },
    { name: "Clothing", href: "/products?category=clothing" },
    { name: "Sneakers", href: "/products?category=sneakers" },
    { name: "Perfumes", href: "/products?category=perfumes" },
  ]

  return (
    <>
      <Suspense fallback={<div className="h-8 bg-primary/10" />}>
        <PromotionalBanner />
      </Suspense>
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-2xl font-serif font-semibold">Caarl</span>
          </Link>

          {/* Search bar in center */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <Suspense fallback={<div className="w-full h-10 bg-muted rounded-md animate-pulse" />}>
              <SearchBar />
            </Suspense>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon" className="relative">
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders">Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist">Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/addresses">Addresses</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="md:hidden pb-3">
          <Suspense fallback={<div className="w-full h-10 bg-muted rounded-md animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
    </>
  )
}
