"use client"

import { useState, useEffect, useRef, Suspense, lazy } from "react"
import { Header } from "./header"

const PromotionalBanner = lazy(() => import("@/components/promotional-banner").then(module => ({ default: module.PromotionalBanner })))

export function AutoHideHeader() {
  const [isVisible, setIsVisible] = useState(true)
  const [showDiscount, setShowDiscount] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show discount banner only when at the very top
      setShowDiscount(currentScrollY < 50)

      // Hide header immediately when scrolling down
      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        setIsVisible(false)
      } 
      // Show header when scrolling up or at the very top
      else if (currentScrollY < lastScrollY.current || currentScrollY <= 10) {
        setIsVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    // Throttle scroll events for better performance
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", throttledHandleScroll, { passive: true })
    
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll)
    }
  }, [])

  return (
    <>
      {/* Fixed header */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-150 ease-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className={`transition-opacity duration-300 ${showDiscount ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
          <Suspense fallback={<div className="h-8 bg-primary/10" />}>
            <PromotionalBanner />
          </Suspense>
        </div>
        <Header />
      </div>
      
      {/* Spacer to prevent content from being hidden behind fixed header */}
      <div className="h-[72px] md:h-[80px]">
        {/* Promotional banner spacer - only when visible */}
        {showDiscount && (
          <div className="h-8">
            <Suspense fallback={<div className="h-8" />}>
              <div className="h-8" />
            </Suspense>
          </div>
        )}
      </div>
    </>
  )
}