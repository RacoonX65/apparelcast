"use client"

import { useState } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

interface WishlistItemsProps {
  items: any[]
}

export function WishlistItems({ items: initialItems }: WishlistItemsProps) {
  const [items, setItems] = useState(initialItems)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleRemove = async (wishlistId: string) => {
    const { error } = await supabase.from("wishlist").delete().eq("id", wishlistId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      })
    } else {
      setItems(items.filter((item) => item.id !== wishlistId))
      toast({
        title: "Removed",
        description: "Item has been removed from your wishlist.",
      })
      router.refresh()
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
        <Button onClick={() => router.push("/products")}>Browse Products</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => {
        const product = item.products as any
        return (
          <div key={item.id} className="relative group">
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              image_url={product.image_url}
              category={product.category}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemove(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
