"use client"

import Link from "next/link"
import { ShoppingBag, User, Menu, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react"
import { supabase } from "@/lib/supabase/client"
import { authStateManager } from "@/lib/supabase/auth-state"

interface User {
  id: string
  email?: string
}
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
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const userRef = useRef<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get user and admin status
    const fetchUser = async () => {
      try {
        console.log('Header: Fetching user...')
        
        // First check the session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('Header: Session data:', sessionData, 'Error:', sessionError)
        
        // Then get the user
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Header: Error fetching user:', error)
          return
        }
        
        console.log('Header: User fetched:', user)
        setUser(user)
        userRef.current = user

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single()

          if (profileError) {
            console.error('Header: Error fetching profile:', profileError)
          } else {
            console.log('Header: Admin profile:', profile)
            setIsAdmin(profile?.is_admin || false)
          }
        }
      } catch (error) {
        console.error('Header: Error in fetchUser:', error)
      }
    }

    // Set up auth state manager subscription FIRST, before fetching user
    console.log('Header: Setting up auth state manager subscription...')
    
    // Wait for auth state manager to initialize
    const setupAuth = async () => {
      let attempts = 0
      while (!authStateManager.isInitialized() && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      
      console.log('Header: Auth state manager initialized:', authStateManager.isInitialized())
      
      // Subscribe to shared auth state
      const unsubscribe = authStateManager.subscribe(async (currentUser) => {
        console.log('Header: Auth state changed, user:', currentUser?.id)
        setUser(currentUser)
        userRef.current = currentUser
        
        if (currentUser) {
          // Fetch admin status for the authenticated user
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", currentUser.id)
            .single()

          if (profileError) {
            console.error('Header: Error fetching profile after auth event:', profileError)
          } else {
            console.log('Header: Admin profile after auth event:', profile)
            setIsAdmin(profile?.is_admin || false)
          }
        } else {
          setIsAdmin(false)
        }
      })
      
      // Set initial user state from authStateManager
      const initialUser = authStateManager.getCurrentUser()
      console.log('Header: Initial user from authStateManager:', initialUser?.id)
      setUser(initialUser)
      userRef.current = initialUser

      // Also fetch user directly to ensure we have the latest state
      fetchUser()

      return () => {
        unsubscribe()
      }
    }
    
    setupAuth()
  }, [])

  // Additional effect to handle potential auth state issues after redirect
  useEffect(() => {
    const checkAuthAfterRedirect = async () => {
      console.log('Header: Checking for auth redirect...')
      
      // Check if we're coming from an auth redirect
      const isAuthRedirect = window.location.search.includes('code=') || window.location.search.includes('redirect=')
      console.log('Header: Is auth redirect?', isAuthRedirect)
      
      if (isAuthRedirect) {
        console.log('Header: Detected auth redirect, checking auth state...')
        
        // Try multiple times with increasing delays
        for (let attempt = 1; attempt <= 3; attempt++) {
          console.log(`Header: Auth redirect check attempt ${attempt}`)
          
          const { data: { user } } = await supabase.auth.getUser()
          console.log(`Header: Auth check attempt ${attempt} - user:`, user)
          
          if (user) {
            console.log('Header: User found in redirect check, updating state...')
            setUser(user)
            userRef.current = user
            
            // Fetch admin status
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("is_admin")
              .eq("id", user.id)
              .single()

            if (!profileError && profile) {
              setIsAdmin(profile.is_admin || false)
            }
            
            // Force a router refresh to update any cached data
            router.refresh()
            break
          }
          
          // Wait longer between attempts
          await new Promise(resolve => setTimeout(resolve, attempt * 200))
        }
      }
    }

    checkAuthAfterRedirect()
  }, [])

  // Update userRef whenever user state changes
  useEffect(() => {
    userRef.current = user
    console.log('Header: userRef updated to:', user)
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    userRef.current = null
    setIsAdmin(false)
    router.push("/")
    router.refresh()
  }

  const navigation = [
    { name: "New Arrivals", href: "/products?filter=new" },
    { name: "Clothing", href: "/products?category=clothing" },
    { name: "Shoes", href: "/products?category=shoes" },
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
            {/* Wishlist only for authenticated users */}
            {user && <WishlistDropdown />}
            {/* Cart for both authenticated and guest users */}
            <CartDropdown />
            {/* User menu or sign in */}
            {console.log('Header: Rendering user section, user:', user)}
            {user ? (
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
