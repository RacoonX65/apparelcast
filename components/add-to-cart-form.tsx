"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { SizeGuideDialog } from "@/components/size-guide"

interface AddToCartFormProps {
  productId: string
  sizes: string[]
  colors: string[]
  stockQuantity: number
}

export function AddToCartForm({ productId, sizes, colors, stockQuantity }: AddToCartFormProps) {
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "")
  const [selectedColor, setSelectedColor] = useState(colors[0] || "")
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleAddToCart = async () => {
    setIsLoading(true)

    try {
      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to your cart.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("size", selectedSize)
        .eq("color", selectedColor)
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity, updated_at: new Date().toISOString() })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Insert new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          quantity,
          size: selectedSize,
          color: selectedColor,
        })

        if (error) throw error
      }

      toast({
        title: "Added to cart",
        description: "Item has been added to your shopping cart.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const incrementQuantity = () => {
    if (quantity < stockQuantity) setQuantity(quantity + 1)
  }

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base">Size</Label>
            {/* Size Guide modal trigger */}
            <SizeGuideDialog />
          </div>
          <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <div key={size}>
                <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                <Label
                  htmlFor={`size-${size}`}
                  className="flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:border-primary/50 transition-colors"
                >
                  {size}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base">Color</Label>
          <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <div key={color}>
                <RadioGroupItem value={color} id={`color-${color}`} className="peer sr-only" />
                <Label
                  htmlFor={`color-${color}`}
                  className="flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:border-primary/50 transition-colors"
                >
                  {color}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-3">
        <Label className="text-base">Quantity</Label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-md">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={incrementQuantity}
              disabled={quantity >= stockQuantity}
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">{stockQuantity} available</span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isLoading || stockQuantity === 0}
        className="w-full h-12 text-base bg-primary hover:bg-accent"
        size="lg"
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {isLoading ? "Adding..." : stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  )
}
