"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

interface ProductFiltersProps {
  categories: string[]
  subcategories: string[]
  currentCategory?: string
  currentSubcategory?: string
  minPrice: number
  maxPrice: number
  currentMinPrice?: number
  currentMaxPrice?: number
  currentSort?: string
}

export function ProductFilters({
  categories,
  subcategories,
  currentCategory,
  currentSubcategory,
  minPrice,
  maxPrice,
  currentMinPrice,
  currentMaxPrice,
  currentSort,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState<[number, number]>([
    currentMinPrice || minPrice,
    currentMaxPrice || maxPrice,
  ])

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset subcategory if category changes
    if (key === "category" && value !== currentCategory) {
      params.delete("subcategory")
    }

    router.push(`/products?${params.toString()}`)
  }

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/products")
  }

  const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice || currentSort

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select value={currentSort || "newest"} onValueChange={(value) => updateFilters("sort", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="space-y-1">
          <Button
            variant={!currentCategory ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => updateFilters("category", null)}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={currentCategory === category ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => updateFilters("category", category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      {subcategories.length > 0 && (
        <div className="space-y-2">
          <Label>Subcategory</Label>
          <div className="space-y-1">
            {subcategories.map((subcategory) => (
              <Button
                key={subcategory}
                variant={currentSubcategory === subcategory ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => updateFilters("subcategory", subcategory)}
              >
                {subcategory}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-4">
        <Label>Price Range</Label>
        <div className="px-2">
          <Slider
            min={minPrice}
            max={maxPrice}
            step={10}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>R{priceRange[0]}</span>
            <span>R{priceRange[1]}</span>
          </div>
          <Button size="sm" className="w-full" onClick={applyPriceFilter}>
            Apply Price Filter
          </Button>
        </div>
      </div>
    </div>
  )
}
