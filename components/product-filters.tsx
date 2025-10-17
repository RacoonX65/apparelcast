"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Filter } from "lucide-react"

interface ProductFiltersProps {
  categories: string[]
  subcategories: string[]
  brands?: string[]
  materials?: string[]
  sizes?: string[]
  colors?: string[]
  currentCategory?: string
  currentSubcategory?: string
  currentBrand?: string
  currentMaterial?: string
  currentSizes?: string[]
  currentColors?: string[]
  currentStockStatus?: string
  minPrice: number
  maxPrice: number
  currentMinPrice?: number
  currentMaxPrice?: number
  currentSort?: string
}

export function ProductFilters({
  categories,
  subcategories,
  brands = [],
  materials = [],
  sizes = [],
  colors = [],
  currentCategory,
  currentSubcategory,
  currentBrand,
  currentMaterial,
  currentSizes = [],
  currentColors = [],
  currentStockStatus,
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
  const [selectedSizes, setSelectedSizes] = useState<string[]>(currentSizes)
  const [selectedColors, setSelectedColors] = useState<string[]>(currentColors)

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Clear subcategory when category changes
    if (key === "category" && value !== currentCategory) {
      params.delete("subcategory")
    }

    router.push(`/products?${params.toString()}`)
  }

  const updateMultiSelectFilter = (key: string, values: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (values.length > 0) {
      params.set(key, values.join(','))
    } else {
      params.delete(key)
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

  const hasActiveFilters = currentCategory || currentBrand || currentMaterial || 
    currentSizes.length > 0 || currentColors.length > 0 || currentStockStatus ||
    currentMinPrice || currentMaxPrice || currentSort

  const toggleSizeFilter = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size]
    setSelectedSizes(newSizes)
    updateMultiSelectFilter('sizes', newSizes)
  }

  const toggleColorFilter = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color]
    setSelectedColors(newColors)
    updateMultiSelectFilter('colors', newColors)
  }

  const FilterContent = () => (
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

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className="space-y-2">
          <Label>Brand</Label>
          <Select value={currentBrand || "all"} onValueChange={(value) => updateFilters("brand", value === "all" ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Material Filter */}
      {materials.length > 0 && (
        <div className="space-y-2">
          <Label>Material</Label>
          <Select value={currentMaterial || "all"} onValueChange={(value) => updateFilters("material", value === "all" ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Materials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Materials</SelectItem>
              {materials.map((material) => (
                <SelectItem key={material} value={material}>
                  {material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Stock Status Filter */}
      <div className="space-y-2">
        <Label>Availability</Label>
        <Select value={currentStockStatus || "all"} onValueChange={(value) => updateFilters("stockStatus", value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Size Filter */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <Label>Size</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {sizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={() => toggleSizeFilter(size)}
                />
                <Label htmlFor={`size-${size}`} className="text-sm font-normal">
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Filter */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {[...new Set(colors)].map((color, index) => (
              <div key={`color-${color}-${index}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}-${index}`}
                  checked={selectedColors.includes(color)}
                  onCheckedChange={() => toggleColorFilter(color)}
                />
                <Label htmlFor={`color-${color}-${index}`} className="text-sm font-normal">
                  {color}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

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

  return (
    <>
      {/* Mobile Filter Button - visible on small screens */}
      <div className="md:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  Active
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Product Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters - hidden on small screens */}
      <div className="hidden md:block">
        <FilterContent />
      </div>
    </>
  )
}
