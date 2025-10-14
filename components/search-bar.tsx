"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category: string
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      const { data } = await supabase
        .from("products")
        .select("id, name, price, image_url, category")
        .ilike("name", `%${query}%`)
        .limit(5)

      setResults(data || [])
      setIsLoading(false)
    }

    const debounce = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounce)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`)
      setIsOpen(false)
      setQuery("")
    }
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          ) : results.length > 0 ? (
            <>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => {
                    setIsOpen(false)
                    setQuery("")
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-accent transition-colors border-b last:border-b-0"
                >
                  <div className="relative w-12 h-12 flex-shrink-0 bg-muted rounded">
                    <Image
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                  </div>
                  <p className="font-semibold text-sm">R{product.price.toFixed(2)}</p>
                </Link>
              ))}
              <button
                onClick={handleSearch}
                className="w-full p-3 text-sm text-center text-primary hover:bg-accent transition-colors font-medium"
              >
                View all results for "{query}"
              </button>
            </>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No products found</div>
          )}
        </div>
      )}
    </div>
  )
}
