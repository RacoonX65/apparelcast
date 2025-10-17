import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params

  try {
    const supabase = await createClient()
    
    // First try to find by slug, then fallback to UUID
    let { data: product } = await supabase
      .from("products")
      .select("name, description, image_url, slug")
      .eq("slug", id)
      .single()

    // If not found by slug, try by UUID (for backward compatibility)
    if (!product) {
      const { data: productById } = await supabase
        .from("products")
        .select("name, description, image_url, slug")
        .eq("id", id)
        .single()
      
      product = productById
    }

    const title = product?.name ? `${product.name} – ApparelCast` : undefined
    const description = product?.description || undefined
    const imageUrl = product?.image_url || "/apparelcast.png"
    // Use slug for canonical URL if available, otherwise fallback to id
    const urlSlug = product?.slug || id
    const pageUrl = `https://apparelcast.shop/products/${urlSlug}`

    return {
      alternates: { canonical: pageUrl },
      title,
      description,
      openGraph: {
        type: "website",
        url: pageUrl,
        title: title || "Product – ApparelCast",
        description: description || "Discover fashion products at ApparelCast.",
        images: [{ url: imageUrl, width: 1200, height: 1200, alt: product?.name || "Product" }],
      },
      twitter: {
        card: "summary_large_image",
        title: title || "Product – ApparelCast",
        description: description || "Discover fashion products at ApparelCast.",
        images: [imageUrl],
      },
    }
  } catch {
    return {
      alternates: {
        canonical: `https://apparelcast.shop/products/${id}`,
      },
    }
  }
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}