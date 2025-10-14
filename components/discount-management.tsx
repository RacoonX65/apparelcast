"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2 } from "lucide-react"
import { DiscountDialog } from "@/components/discount-dialog"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface DiscountCode {
  id: string
  code: string
  description: string | null
  discount_type: string
  discount_value: number
  minimum_order_amount: number
  usage_limit: number | null
  usage_count: number
  is_active: boolean
  valid_from: string
  valid_until: string | null
  created_at: string
}

export function DiscountManagement() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    const { data } = await supabase.from("discount_codes").select("*").order("created_at", { ascending: false })

    if (data) {
      setDiscounts(data)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount code?")) return

    const { error } = await supabase.from("discount_codes").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete discount code.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Deleted",
        description: "Discount code has been deleted.",
      })
      fetchDiscounts()
    }
  }

  const handleEdit = (discount: DiscountCode) => {
    setSelectedDiscount(discount)
    setShowDialog(true)
  }

  const handleDialogClose = () => {
    setShowDialog(false)
    setSelectedDiscount(null)
    fetchDiscounts()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Discount Code
        </Button>
      </div>

      <div className="grid gap-4">
        {discounts.map((discount) => (
          <Card key={discount.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold font-mono">{discount.code}</h3>
                    <Badge variant={discount.is_active ? "default" : "secondary"}>
                      {discount.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {discount.description && <p className="text-sm text-muted-foreground">{discount.description}</p>}

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Discount: </span>
                      <span className="font-medium">
                        {discount.discount_type === "percentage"
                          ? `${discount.discount_value}%`
                          : `R${discount.discount_value}`}
                      </span>
                    </div>

                    {discount.minimum_order_amount > 0 && (
                      <div>
                        <span className="text-muted-foreground">Min Purchase: </span>
                        <span className="font-medium">R{discount.minimum_order_amount}</span>
                      </div>
                    )}

                    {discount.usage_limit && (
                      <div>
                        <span className="text-muted-foreground">Uses: </span>
                        <span className="font-medium">
                          {discount.usage_count} / {discount.usage_limit}
                        </span>
                      </div>
                    )}

                    {discount.valid_until && (
                      <div>
                        <span className="text-muted-foreground">Expires: </span>
                        <span className="font-medium">{format(new Date(discount.valid_until), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(discount)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(discount.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {discounts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No discount codes yet. Create your first one!</p>
            </CardContent>
          </Card>
        )}
      </div>

      <DiscountDialog open={showDialog} onOpenChange={handleDialogClose} discount={selectedDiscount} />
    </div>
  )
}
