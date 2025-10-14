"use client"

import { ShoppingBag, Sparkles, Heart } from "lucide-react"

interface StoreLoadingProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function StoreLoading({ message = "Loading your fashion finds...", size = "md" }: StoreLoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }

  const containerClasses = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6"
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      {/* Animated Logo/Brand Section */}
      <div className={`flex items-center ${containerClasses[size]} mb-6`}>
        {/* Pulsing Shopping Bag */}
        <div className="relative">
          <ShoppingBag 
            className={`${sizeClasses[size]} text-primary animate-pulse`}
          />
          {/* Floating sparkles */}
          <Sparkles 
            className="w-4 h-4 text-pink-400 absolute -top-1 -right-1 animate-bounce" 
            style={{ animationDelay: "0.5s" }}
          />
        </div>
        
        {/* Brand Name with Gradient */}
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-pink-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
            Caarl
          </h2>
          <p className="text-xs text-muted-foreground tracking-wider uppercase">
            Fashion & Lifestyle
          </p>
        </div>
      </div>

      {/* Loading Animation */}
      <div className="flex items-center gap-2 mb-4">
        {/* Animated dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ 
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s"
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading Message */}
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {message}
      </p>

      {/* Decorative Elements */}
      <div className="flex items-center gap-4 mt-6 opacity-30">
        <Heart className="w-4 h-4 text-pink-400 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <Heart className="w-4 h-4 text-pink-400 animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Progress Bar */}
      <div className="w-32 h-1 bg-muted rounded-full overflow-hidden mt-4">
        <div className="h-full bg-gradient-to-r from-primary to-pink-500 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

// Fullscreen loading variant
export function FullScreenStoreLoading({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg shadow-lg p-8">
        <StoreLoading message={message} size="lg" />
      </div>
    </div>
  )
}

// Page loading variant
export function PageStoreLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <StoreLoading message={message} size="md" />
    </div>
  )
}