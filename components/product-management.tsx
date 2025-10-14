"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { ProductDialog } from "@/components/product-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ProductManagementProps {
  products: any[]
}

export function ProductManagement({ products }: ProductManagementProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setShowDialog(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setShowDialog(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    setDeletingId(productId)
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Delete product error:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="mb-6">
        <Button onClick={handleAdd} className="bg-primary hover:bg-accent">
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-muted mb-4">
                <Image
                  src={
                    product.image_url ||
                    `/placeholder.svg?height=400&width=300&query=${encodeURIComponent(product.name)}`
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-2">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">R {product.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</p>
                </div>
                {product.is_featured && (
                  <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded">Featured</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProductDialog open={showDialog} onOpenChange={setShowDialog} product={editingProduct} />
    </>
  )
}
