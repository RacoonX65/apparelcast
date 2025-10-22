"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase/client"
import { ReviewForm } from "@/components/review-form"
import { formatDistanceToNow } from "date-fns"

interface User {
  id: string
  email?: string
}

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  is_verified_purchase: boolean
  created_at: string
  media?: { url: string; type: "image" | "video" }[] | null
  profiles: {
    full_name: string | null
  }
}

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({})
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetchReviews()
    checkUserAuth()
  }, [productId])

  const checkUserAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      // Check if user has already reviewed this product
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .single()

      setUserReview(data)
    }
  }

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select(
        `
        *,
        profiles (
          full_name
        )
      `,
      )
      .eq("product_id", productId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })

    if (data) {
      setReviews(data)

      // Calculate average rating
      const avg = data.reduce((sum: number, review: Review) => sum + review.rating, 0) / data.length
      setAverageRating(avg || 0)

      // Calculate rating distribution
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      data.forEach((review: Review) => {
        distribution[review.rating]++
      })
      setRatingDistribution(distribution)
    }
  }

  const handleReviewSubmitted = () => {
    fetchReviews()
    checkUserAuth()
    setShowReviewForm(false)
  }

  const totalReviews = reviews.length

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {totalReviews > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Average Rating */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating)
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating} ★</span>
                    <Progress value={(ratingDistribution[rating] / totalReviews) * 100} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-8">{ratingDistribution[rating]}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review!</p>
          )}

          {/* Write Review Button */}
          {user && !userReview && (
            <div className="mt-6 text-center">
              <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                {showReviewForm ? "Cancel" : "Write a Review"}
              </Button>
            </div>
          )}

          {!user && <p className="text-center text-sm text-muted-foreground mt-6">Please sign in to write a review</p>}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && user && <ReviewForm productId={productId} onSuccess={handleReviewSubmitted} />}

      {/* User's Existing Review */}
      {userReview && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= userReview.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              {userReview.title && <h4 className="font-semibold">{userReview.title}</h4>}
              {userReview.comment && <p className="text-sm">{userReview.comment}</p>}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(userReview.created_at), { addSuffix: true })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.filter((r) => r.id !== userReview?.id).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">All Reviews</h3>
          {reviews
            .filter((r) => r.id !== userReview?.id)
            .map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        {review.is_verified_purchase && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="font-medium">{review.profiles?.full_name || "Anonymous"}</p>
                    {review.title && <h4 className="font-semibold">{review.title}</h4>}
                    {review.comment && <p className="text-sm">{review.comment}</p>}
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
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
