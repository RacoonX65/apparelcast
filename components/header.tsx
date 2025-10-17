"use client"

import Link from "next/link"
import { ShoppingBag, User, Menu, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useState, useEffect, lazy, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CartDropdown } from "@/components/cart-dropdown"
import { WishlistDropdown } from "@/components/wishlist-dropdown"

// Lazy load non-critical components
const SearchBar = lazy(() => import("@/components/search-bar").then(module => ({ default: module.SearchBar })))
const PromotionalBanner = lazy(() => import("@/components/promotional-banner").then(module => ({ default: module.PromotionalBanner })))

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Get user and admin status
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single()

        setIsAdmin(profile?.is_admin || false)
      }
    }

    fetchUser()
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
    { name: "Home", href: "/products?category=home" },
  ]

  return (
    <>
      <Suspense fallback={<div className="h-8 bg-primary/10" />}>
        <PromotionalBanner />
      </Suspense>
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 md:h-16 items-center justify-between gap-2 md:gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[68vw] max-w-[240px] gap-2 p-4">
              <SheetHeader className="p-0">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-3 mt-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-base font-medium hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-2xl font-serif font-semibold">ApparelCast</span>
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
                <WishlistDropdown />
                <CartDropdown />
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
                <Link href={`/auth/login?redirect=${encodeURIComponent(pathname + (searchParams.toString() ? '?' + searchParams.toString() : ''))}`}>Sign In</Link>
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
