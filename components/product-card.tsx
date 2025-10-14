import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { WishlistButton } from "@/components/wishlist-button"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image_url: string
  category: string
}

export function ProductCard({ id, name, price, image_url, category }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-shadow duration-300 relative">
      <CardContent className="p-0">
        <Link href={`/products/${id}`}>
          <div className="aspect-[3/4] relative overflow-hidden bg-muted">
            <Image
              src={image_url || `/placeholder.svg?height=600&width=450&query=${encodeURIComponent(name)}`}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{category}</p>
            <h3 className="font-medium text-sm line-clamp-2">{name}</h3>
            <p className="text-lg font-semibold">R {price.toFixed(2)}</p>
          </div>
        </Link>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton productId={id} />
        </div>
      </CardContent>
    </Card>
  )
}
