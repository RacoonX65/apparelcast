import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch product data for metadata
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (!product) {
    return {
      title: "Product Not Found | ApparelCast",
      description: "The requested product could not be found.",
    }
  }

  const productUrl = `https://apparelcast.shop/products/${id}`
  const productImage = product.image_url || "https://apparelcast.shop/og-image.jpg"
  const productTitle = `${product.name} - R ${product.price.toFixed(2)} | ApparelCast`
  const productDescription = product.description 
    ? `${product.description.substring(0, 155)}...`
    : `Shop ${product.name} for R ${product.price.toFixed(2)} at ApparelCast. Secure online fashion shopping with CIPC registration protection.`

  return {
    title: productTitle,
    description: productDescription,
    keywords: `${product.name}, ${product.category}, ApparelCast, fashion, clothing, online shopping, secure shopping, CIPC registered`,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: productUrl,
      siteName: "ApparelCast",
      title: productTitle,
      description: productDescription,
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: product.name,
          type: "image/jpeg",
        },
        ...(product.additional_images || []).slice(0, 3).map((img: string) => ({
          url: img,
          width: 800,
          height: 600,
          alt: `${product.name} - Additional Image`,
          type: "image/jpeg",
        }))
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@ApparelCast",
      creator: "@ApparelCast",
      title: productTitle,
      description: productDescription,
      images: [productImage],
    },
    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": "ZAR",
      "product:availability": product.stock_quantity > 0 ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:retailer_item_id": product.id,
      "product:brand": "ApparelCast",
      "product:category": product.category,
    },
  }
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}