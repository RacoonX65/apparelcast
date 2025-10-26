import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch all products with their variants
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (
          id,
          size,
          color,
          stock_quantity,
          price_adjustment,
          is_active
        )
      `)
      .order("created_at", { ascending: false })

    if (productsError) {
      console.error("Error fetching products:", productsError)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    // Get the format from query params (default to csv)
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"

    if (format === "csv") {
      // Generate CSV content
      const csvHeaders = [
        "Product ID",
        "Product Name",
        "Category",
        "Subcategory",
        "Brand",
        "Base Price (R)",
        "Stock Quantity",
        "Material",
        "Sizes",
        "Colors",
        "Is Featured",
        "Bulk Pricing Enabled",
        "Min Bulk Quantity",
        "Bulk Discount Note",
        "Created Date",
        "Variant ID",
        "Variant Size",
        "Variant Color",
        "Variant Stock",
        "Variant Price Adjustment",
        "Variant Active",
        "Final Variant Price (R)"
      ]

      const csvRows = []
      csvRows.push(csvHeaders.join(","))

      products?.forEach((product) => {
        if (product.product_variants && product.product_variants.length > 0) {
          // If product has variants, create a row for each variant
          product.product_variants.forEach((variant: any) => {
            const finalPrice = product.price + (variant.price_adjustment || 0)
            const row = [
              `"${product.id}"`,
              `"${product.name || ''}"`,
              `"${product.category || ''}"`,
              `"${product.subcategory || ''}"`,
              `"${product.brand || ''}"`,
              `"${product.price || 0}"`,
              `"${product.stock_quantity || 0}"`,
              `"${product.material || ''}"`,
              `"${Array.isArray(product.sizes) ? product.sizes.join('; ') : (product.sizes || '')}"`,
              `"${Array.isArray(product.colors) ? product.colors.join('; ') : (product.colors || '')}"`,
              `"${product.is_featured ? 'Yes' : 'No'}"`,
              `"${product.enable_bulk_pricing ? 'Yes' : 'No'}"`,
              `"${product.min_bulk_quantity || ''}"`,
              `"${product.bulk_discount_note || ''}"`,
              `"${new Date(product.created_at).toLocaleDateString()}"`,
              `"${variant.id}"`,
              `"${variant.size || ''}"`,
              `"${variant.color || ''}"`,
              `"${variant.stock_quantity || 0}"`,
              `"${variant.price_adjustment || 0}"`,
              `"${variant.is_active ? 'Yes' : 'No'}"`,
              `"${finalPrice.toFixed(2)}"`
            ]
            csvRows.push(row.join(","))
          })
        } else {
          // If product has no variants, create a single row
          const row = [
            `"${product.id}"`,
            `"${product.name || ''}"`,
            `"${product.category || ''}"`,
            `"${product.subcategory || ''}"`,
            `"${product.brand || ''}"`,
            `"${product.price || 0}"`,
            `"${product.stock_quantity || 0}"`,
            `"${product.material || ''}"`,
            `"${Array.isArray(product.sizes) ? product.sizes.join('; ') : (product.sizes || '')}"`,
            `"${Array.isArray(product.colors) ? product.colors.join('; ') : (product.colors || '')}"`,
            `"${product.is_featured ? 'Yes' : 'No'}"`,
            `"${product.enable_bulk_pricing ? 'Yes' : 'No'}"`,
            `"${product.min_bulk_quantity || ''}"`,
            `"${product.bulk_discount_note || ''}"`,
            `"${new Date(product.created_at).toLocaleDateString()}"`,
            `""`, // Variant ID
            `""`, // Variant Size
            `""`, // Variant Color
            `""`, // Variant Stock
            `""`, // Variant Price Adjustment
            `""`, // Variant Active
            `"${product.price.toFixed(2)}"` // Final Price (same as base price)
          ]
          csvRows.push(row.join(","))
        }
      })

      const csvContent = csvRows.join("\n")
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `products-export-${timestamp}.csv`

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    } else if (format === "json") {
      // Return JSON format
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `products-export-${timestamp}.json`

      return new NextResponse(JSON.stringify(products, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    } else {
      return NextResponse.json({ error: "Unsupported format. Use 'csv' or 'json'" }, { status: 400 })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}