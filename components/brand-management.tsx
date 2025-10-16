"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type BrandStat = {
  name: string | null
  count: number
}

export function BrandManagement() {
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()
  const [brandStats, setBrandStats] = useState<BrandStat[]>([])
  const [filter, setFilter] = useState("")
  const [renameInputs, setRenameInputs] = useState<Record<string, string>>({})
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isNormalizing, setIsNormalizing] = useState(false)
  const [canonicalBrands, setCanonicalBrands] = useState<string[]>([])
  const [newCanonicalBrand, setNewCanonicalBrand] = useState("")
  const [isCreatingCanonical, setIsCreatingCanonical] = useState(false)

  const loadBrands = async () => {
    const { data, error } = await supabase.from("products").select("brand")
    if (error) {
      console.error("Fetch brands error:", error)
      toast({ title: "Error", description: "Failed to load brands.", variant: "destructive" })
      return
    }

    const countsMap = new Map<string | null, number>()
    ;(data || []).forEach((row: any) => {
      const key = (row.brand ?? null) as string | null
      countsMap.set(key, (countsMap.get(key) || 0) + 1)
    })

    const stats: BrandStat[] = Array.from(countsMap.entries()).map(([name, count]) => ({ name, count }))
    // Sort by count desc, then name
    stats.sort((a, b) => (b.count - a.count) || ((a.name || "").localeCompare(b.name || "")))
    setBrandStats(stats)
  }

  useEffect(() => {
    loadBrands()
    // Load canonical brands
    ;(async () => {
      const { data, error } = await supabase.from("brands").select("name").order("name")
      if (error) {
        console.error("Fetch canonical brands error:", error)
        // Graceful: leave list empty; page still usable for Remove/Normalize
        return
      }
      setCanonicalBrands((data || []).map((b: any) => b.name))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredStats = brandStats.filter((b) => {
    if (!filter.trim()) return true
    const name = b.name ?? "(no brand)"
    return name.toLowerCase().includes(filter.toLowerCase())
  })

  const setRenameValue = (key: string, value: string) => {
    setRenameInputs((prev) => ({ ...prev, [key]: value }))
  }

  const uniqueBrandNames: string[] = brandStats
    .map((b) => b.name)
    .filter((n): n is string => typeof n === "string")

  const normalizeBrandName = (name: string) => {
    const cleaned = name.trim().replace(/\s+/g, " ")
    // Title-case words and hyphenated segments
    return cleaned
      .split(" ")
      .map((word) =>
        word
          .split("-")
          .map((seg) => (seg ? seg[0].toUpperCase() + seg.slice(1).toLowerCase() : ""))
          .join("-")
      )
      .join(" ")
  }

  const validateBrandName = (name: string): string | null => {
    const trimmed = name.trim()
    if (!trimmed) return "Brand name is required"
    if (trimmed.length < 2) return "Brand name must be at least 2 characters"
    if (trimmed.length > 64) return "Brand name must be 64 characters or fewer"
    const allowed = /^[A-Za-z0-9 &\-'/\.]+$/
    if (!allowed.test(trimmed)) return "Only letters, numbers, spaces, - & ' . are allowed"
    return null
  }

  const handleRename = async (oldName: string | null) => {
    const key = oldName ?? "__null__"
    const newName = (renameInputs[key] || "").trim()
    if (!newName) {
      toast({ title: "Brand name required", description: "Enter a new brand name.", variant: "destructive" })
      return
    }
    setIsUpdating(key)
    try {
      const { error } = await supabase
        .from("products")
        .update({ brand: newName })
        .is("brand", null)
        .eq("brand", oldName as any)

      // The above combining .is and .eq isn't valid; we need conditional based on null
    } catch {}
  }

  const handleRenameSafe = async (oldName: string | null) => {
    const key = oldName ?? "__null__"
    const selectedCanonical = (renameInputs[key] || "").trim()
    if (!selectedCanonical) {
      toast({ title: "Select brand", description: "Choose a canonical brand to merge into.", variant: "destructive" })
      return
    }
    // Enforce canonical set: must exist in canonicalBrands
    if (!canonicalBrands.includes(selectedCanonical)) {
      toast({ title: "Not allowed", description: "Brand must be selected from canonical list.", variant: "destructive" })
      return
    }
    const newName = selectedCanonical
    setIsUpdating(key)
    try {
      let res
      if (oldName === null) {
        res = await supabase.from("products").update({ brand: newName }).is("brand", null)
      } else {
        res = await supabase.from("products").update({ brand: newName }).eq("brand", oldName)
      }
      if (res.error) throw res.error
      toast({ title: "Merged", description: `Merged into canonical brand "${newName}"` })
      await loadBrands()
      setRenameValue(key, "")
      router.refresh()
    } catch (error) {
      console.error("Merge brand error:", error)
      toast({ title: "Error", description: "Failed to merge brand.", variant: "destructive" })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleRemove = async (name: string | null) => {
    const label = name ?? "(no brand)"
    if (!confirm(`Remove brand "${label}" from all products?`)) return
    const key = name ?? "__null__"
    setIsUpdating(key)
    try {
      const res = name === null
        ? await supabase.from("products").update({ brand: null }).is("brand", null)
        : await supabase.from("products").update({ brand: null }).eq("brand", name)
      if (res.error) throw res.error
      toast({ title: "Removed", description: `Cleared brand "${label}" from products.` })
      await loadBrands()
      router.refresh()
    } catch (error) {
      console.error("Remove brand error:", error)
      toast({ title: "Error", description: "Failed to remove brand.", variant: "destructive" })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleNormalizeAll = async () => {
    if (!confirm("Normalize all brands to trimmed, title-case values?")) return
    setIsNormalizing(true)
    try {
      // For each distinct brand, compute normalized name and update in bulk if changed
      const work = brandStats
        .map((b) => b.name)
        .filter((n): n is string => typeof n === "string")
        .map(async (oldName) => {
          const normalized = normalizeBrandName(oldName)
          if (normalized !== oldName) {
            const res = await supabase.from("products").update({ brand: normalized }).eq("brand", oldName)
            if (res.error) throw res.error
          }
        })
      await Promise.all(work)
      toast({ title: "Normalized", description: "All brand names are normalized." })
      await loadBrands()
      router.refresh()
    } catch (error) {
      console.error("Normalize brands error:", error)
      toast({ title: "Error", description: "Failed to normalize brands.", variant: "destructive" })
    } finally {
      setIsNormalizing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Brand Management</h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="brand-filter" className="text-sm">Search</Label>
          <Input id="brand-filter" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter brands" className="w-56" />
          <Button variant="outline" size="sm" onClick={handleNormalizeAll} disabled={isNormalizing}>
            {isNormalizing ? "Normalizing..." : "Normalize All"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="new-canonical-brand" className="text-sm">New Canonical Brand</Label>
        <Input
          id="new-canonical-brand"
          value={newCanonicalBrand}
          onChange={(e) => setNewCanonicalBrand(e.target.value)}
          placeholder="Enter brand name"
          className="w-64"
        />
        <Button
          size="sm"
          onClick={async () => {
            const message = validateBrandName(newCanonicalBrand)
            if (message) {
              toast({ title: "Invalid brand", description: message, variant: "destructive" })
              return
            }
            const normalized = normalizeBrandName(newCanonicalBrand)
            const exists = canonicalBrands.some((b) => b.trim().toLowerCase() === normalized.trim().toLowerCase())
            if (exists) {
              toast({ title: "Already exists", description: "Brand is already in canonical list." })
              return
            }
            setIsCreatingCanonical(true)
            try {
              const res = await supabase.from("brands").insert({ name: normalized })
              if (res.error) throw res.error
              setCanonicalBrands((prev) => [...prev, normalized].sort((a, b) => a.localeCompare(b)))
              setNewCanonicalBrand("")
              toast({ title: "Brand added", description: `Added "${normalized}" to canonical brands.` })
              router.refresh()
            } catch (error: any) {
              console.error("Add canonical brand error:", error)
              const desc = typeof error?.message === "string" ? error.message : "Failed to add brand."
              toast({ title: "Error", description: desc, variant: "destructive" })
            } finally {
              setIsCreatingCanonical(false)
            }
          }}
          disabled={isCreatingCanonical}
        >
          {isCreatingCanonical ? "Adding..." : "Add"}
        </Button>
      </div>

      <Card>
        <CardContent className="py-6">
          {filteredStats.length === 0 ? (
            <p className="text-muted-foreground">No brands found.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStats.map((b) => {
                  const key = b.name ?? "__null__"
                  const label = b.name ?? "(no brand)"
                  const inputValue = renameInputs[key] ?? ""
                  const disabled = isUpdating === key
                  return (
                    <div key={key} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate">
                          {label}
                        </div>
                        <Badge variant="outline">{b.count}</Badge>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Merge Into (Canonical)</Label>
                        <Select
                          value={inputValue}
                          onValueChange={(val) => setRenameValue(key, val)}
                          disabled={disabled || canonicalBrands.length === 0}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={canonicalBrands.length ? "Select a brand" : "No canonical brands available"} />
                          </SelectTrigger>
                          <SelectContent>
                            {canonicalBrands.map((name) => (
                              <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleRenameSafe(b.name)} disabled={disabled}>
                            {disabled ? "Updating..." : "Merge"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRemove(b.name)} disabled={disabled}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Use Merge to consolidate duplicates into the canonical list. Remove clears the brand from matching products.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}