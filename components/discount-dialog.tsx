"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface DiscountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  discount?: any
}

export function DiscountDialog({ open, onOpenChange, discount }: DiscountDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase_amount: "",
    max_uses: "",
    is_active: true,
    valid_from: new Date().toISOString().split("T")[0],
    valid_until: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code,
        description: discount.description || "",
        discount_type: discount.discount_type,
        discount_value: discount.discount_value.toString(),
        min_purchase_amount: discount.min_purchase_amount?.toString() || "",
        max_uses: discount.max_uses?.toString() || "",
        is_active: discount.is_active,
        valid_from: discount.valid_from ? new Date(discount.valid_from).toISOString().split("T")[0] : "",
        valid_until: discount.valid_until ? new Date(discount.valid_until).toISOString().split("T")[0] : "",
      })
    } else {
      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        min_purchase_amount: "",
        max_uses: "",
        is_active: true,
        valid_from: new Date().toISOString().split("T")[0],
        valid_until: "",
      })
    }
  }, [discount, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data: any = {
      code: formData.code.toUpperCase(),
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: Number.parseFloat(formData.discount_value),
      min_purchase_amount: formData.min_purchase_amount ? Number.parseFloat(formData.min_purchase_amount) : 0,
      max_uses: formData.max_uses ? Number.parseInt(formData.max_uses) : null,
      is_active: formData.is_active,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
    }

    let error
    if (discount) {
      const result = await supabase.from("discount_codes").update(data).eq("id", discount.id)
      error = result.error
    } else {
      const result = await supabase.from("discount_codes").insert(data)
      error = result.error
    }

    setIsSubmitting(false)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: discount ? "Updated" : "Created",
        description: `Discount code has been ${discount ? "updated" : "created"}.`,
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{discount ? "Edit Discount Code" : "Create Discount Code"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_type">Discount Type *</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summer sale discount"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_value">
                Discount Value * {formData.discount_type === "percentage" ? "(%)" : "(R)"}
              </Label>
              <Input
                id="discount_value"
                type="number"
                step="0.01"
                min="0"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_purchase_amount">Min Purchase Amount (R)</Label>
              <Input
                id="min_purchase_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_purchase_amount}
                onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid_from">Valid From</Label>
              <Input
                id="valid_from"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_uses">Max Uses (leave empty for unlimited)</Label>
            <Input
              id="max_uses"
              type="number"
              min="1"
              value={formData.max_uses}
              onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : discount ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
