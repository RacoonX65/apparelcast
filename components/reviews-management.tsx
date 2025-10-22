"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Star } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  is_verified_purchase: boolean
  is_hidden?: boolean
  media?: { url: string; type: "image" | "video" }[] | null
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
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

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

  const handleToggleVisibility = async (review: Review) => {
    setTogglingId(review.id)
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ is_hidden: !review.is_hidden })
        .eq("id", review.id)

      if (error) throw error

      toast({
        title: !review.is_hidden ? "Review hidden" : "Review visible",
        description: !review.is_hidden
          ? "The review is now hidden from the store."
          : "The review is now visible to customers.",
      })
      router.refresh()
    } catch (error) {
      console.error("Toggle visibility error:", error)
      toast({ title: "Error", description: "Failed to toggle visibility.", variant: "destructive" })
    } finally {
      setTogglingId(null)
    }
  }

  const handleToggleVerified = async (review: Review) => {
    setTogglingId(review.id)
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ is_verified_purchase: !review.is_verified_purchase })
        .eq("id", review.id)

      if (error) throw error

      toast({
        title: !review.is_verified_purchase ? "Marked verified" : "Marked unverified",
        description: !review.is_verified_purchase
          ? "Verified purchase badge enabled."
          : "Verified purchase badge removed.",
      })
      router.refresh()
    } catch (error) {
      console.error("Toggle verified error:", error)
      toast({ title: "Error", description: "Failed to toggle verified state.", variant: "destructive" })
    } finally {
      setTogglingId(null)
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

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVisibility(review)}
                        disabled={togglingId === review.id}
                      >
                        {review.is_hidden ? "Show" : "Hide"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVerified(review)}
                        disabled={togglingId === review.id}
                      >
                        {review.is_verified_purchase ? "Unverify" : "Verify"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="text-destructive hover:text-destructive"
                        aria-label="Delete review"
                        title="Delete review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm">{review.comment}</p>

                  {review.media && review.media.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                      {review.media.map((m, idx) => (
                        <div key={idx} className="relative rounded-md overflow-hidden border aspect-video">
                          {m.type === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.url} alt="review media" className="w-full h-full object-cover" />
                          ) : (
                            <video src={m.url} controls className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

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
