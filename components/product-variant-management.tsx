"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2, Plus, Package, AlertTriangle } from "lucide-react"

interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  stock_quantity: number
  price_adjustment: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Product {
  id: string
  name: string
  category: string
  price: number
}

interface ProductVariantManagementProps {
  productId: string
  productName: string
}

export function ProductVariantManagement({ productId, productName }: ProductVariantManagementProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newVariant, setNewVariant] = useState({
    size: "",
    color: "",
    stock_quantity: 0,
    price_adjustment: 0,
    is_active: true
  })
  
  const { toast } = useToast()

  useEffect(() => {
    fetchVariants()
  }, [productId])

  const fetchVariants = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('size', { ascending: true })
        .order('color', { ascending: true })

      if (error) throw error
      setVariants(data || [])
    } catch (error) {
      console.error('Error fetching variants:', error)
      toast({
        title: "Error",
        description: "Failed to fetch product variants",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddVariant = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert([{
          product_id: productId,
          ...newVariant
        }])
        .select()
        .single()

      if (error) throw error

      setVariants([...variants, data])
      setNewVariant({
        size: "",
        color: "",
        stock_quantity: 0,
        price_adjustment: 0,
        is_active: true
      })
      setIsAddDialogOpen(false)
      
      toast({
        title: "Success",
        description: "Product variant added successfully"
      })
    } catch (error) {
      console.error('Error adding variant:', error)
      toast({
        title: "Error",
        description: "Failed to add product variant",
        variant: "destructive"
      })
    }
  }

  const handleUpdateVariant = async () => {
    if (!editingVariant) return

    try {
      const { data, error } = await supabase
        .from('product_variants')
        .update({
          size: editingVariant.size,
          color: editingVariant.color,
          stock_quantity: editingVariant.stock_quantity,
          price_adjustment: editingVariant.price_adjustment,
          is_active: editingVariant.is_active
        })
        .eq('id', editingVariant.id)
        .select()
        .single()

      if (error) throw error

      setVariants(variants.map(v => v.id === editingVariant.id ? data : v))
      setEditingVariant(null)
      setIsEditDialogOpen(false)
      
      toast({
        title: "Success",
        description: "Product variant updated successfully"
      })
    } catch (error) {
      console.error('Error updating variant:', error)
      toast({
        title: "Error",
        description: "Failed to update product variant",
        variant: "destructive"
      })
    }
  }

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId)

      if (error) throw error

      setVariants(variants.filter(v => v.id !== variantId))
      
      toast({
        title: "Success",
        description: "Product variant deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting variant:', error)
      toast({
        title: "Error",
        description: "Failed to delete product variant",
        variant: "destructive"
      })
    }
  }

  const handleBulkStockUpdate = async (adjustment: number) => {
    try {
      const updates = variants.map(variant => ({
        id: variant.id,
        stock_quantity: Math.max(0, variant.stock_quantity + adjustment)
      }))

      for (const update of updates) {
        await supabase
          .from('product_variants')
          .update({ stock_quantity: update.stock_quantity })
          .eq('id', update.id)
      }

      await fetchVariants()
      
      toast({
        title: "Success",
        description: `Bulk stock adjustment of ${adjustment > 0 ? '+' : ''}${adjustment} applied to all variants`
      })
    } catch (error) {
      console.error('Error updating bulk stock:', error)
      toast({
        title: "Error",
        description: "Failed to update bulk stock",
        variant: "destructive"
      })
    }
  }

  const getTotalStock = () => variants.reduce((sum, variant) => sum + variant.stock_quantity, 0)
  const getLowStockCount = () => variants.filter(variant => variant.stock_quantity <= 5).length
  const getOutOfStockCount = () => variants.filter(variant => variant.stock_quantity === 0).length

  if (loading) {
    return <div className="flex justify-center p-8">Loading variants...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Product Variants</h3>
          <p className="text-muted-foreground">{productName}</p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold">{getTotalStock()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-orange-500">{getLowStockCount()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-500">{getOutOfStockCount()}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Variant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  value={newVariant.size}
                  onChange={(e) => setNewVariant({...newVariant, size: e.target.value})}
                  placeholder="e.g., M, L, XL"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={newVariant.color}
                  onChange={(e) => setNewVariant({...newVariant, color: e.target.value})}
                  placeholder="e.g., Red, Blue, Black"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={newVariant.stock_quantity}
                  onChange={(e) => setNewVariant({...newVariant, stock_quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="price-adj">Price Adjustment ($)</Label>
                <Input
                  id="price-adj"
                  type="number"
                  step="0.01"
                  value={newVariant.price_adjustment}
                  onChange={(e) => setNewVariant({...newVariant, price_adjustment: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newVariant.is_active}
                  onCheckedChange={(checked) => setNewVariant({...newVariant, is_active: checked})}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddVariant} className="flex-1">Add Variant</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={() => handleBulkStockUpdate(10)}>
          Bulk +10 Stock
        </Button>
        <Button variant="outline" onClick={() => handleBulkStockUpdate(-10)}>
          Bulk -10 Stock
        </Button>
      </div>

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Variants ({variants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No variants found. Add some variants to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price Adj.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.size}</TableCell>
                    <TableCell>{variant.color}</TableCell>
                    <TableCell>
                      <Badge variant={
                        variant.stock_quantity === 0 ? "destructive" :
                        variant.stock_quantity <= 5 ? "secondary" : "default"
                      }>
                        {variant.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {variant.price_adjustment !== 0 && (
                        <span className={variant.price_adjustment > 0 ? "text-green-600" : "text-red-600"}>
                          {variant.price_adjustment > 0 ? '+' : ''}${variant.price_adjustment.toFixed(2)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant.is_active ? "default" : "secondary"}>
                        {variant.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingVariant(variant)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVariant(variant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
          </DialogHeader>
          {editingVariant && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-size">Size</Label>
                <Input
                  id="edit-size"
                  value={editingVariant.size}
                  onChange={(e) => setEditingVariant({...editingVariant, size: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  value={editingVariant.color}
                  onChange={(e) => setEditingVariant({...editingVariant, color: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock Quantity</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={editingVariant.stock_quantity}
                  onChange={(e) => setEditingVariant({...editingVariant, stock_quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit-price-adj">Price Adjustment ($)</Label>
                <Input
                  id="edit-price-adj"
                  type="number"
                  step="0.01"
                  value={editingVariant.price_adjustment}
                  onChange={(e) => setEditingVariant({...editingVariant, price_adjustment: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editingVariant.is_active}
                  onCheckedChange={(checked) => setEditingVariant({...editingVariant, is_active: checked})}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateVariant} className="flex-1">Update Variant</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}