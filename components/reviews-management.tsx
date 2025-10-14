"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Star } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  is_verified_purchase: boolean
  products: {
    name: string
    image_url: string | null
  }
  profiles: {
    full_name: string | null
    email: string
  }
}

interface ReviewsManagementProps {
  reviews: Review[]
}

export function ReviewsManagement({ reviews }: ReviewsManagementProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    setDeletingId(reviewId)
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId)

      if (error) throw error

      toast({
        title: "Review deleted",
        description: "Review has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
    console.error("Delete review error:", error)
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No reviews yet.</p>
          </CardContent>
        </Card>
      ) : (
        reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="w-20 h-20 relative flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={
                      review.products.image_url ||
                      `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(review.products.name) || "/placeholder.svg"}`
                    }
                    alt={review.products.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{review.products.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        {review.is_verified_purchase && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm">{review.comment}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>By: {review.profiles.full_name || review.profiles.email.split("@")[0]}</span>
                    <span>•</span>
                    <span>{format(new Date(review.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
