// Using a plain script tag to embed structured data for compatibility in Server Components

interface BusinessStructuredDataProps {
  name?: string
  description?: string
  url?: string
  telephone?: string[]
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
}

export function BusinessStructuredData({
  name = "ApparelCast",
  description = "South Africa's premier fashion destination offering curated designer clothing, statement sneakers, and luxury fragrances for style-conscious individuals",
  url = "https://apparelcast.shop",
  telephone = ["+27603910551"],
  address = {
      streetAddress: "Coming Soon",
      addressLocality: "Coming Soon",
      addressRegion: "Coming Soon",
      postalCode: "Coming Soon",
      addressCountry: "ZA"
    }
}: BusinessStructuredDataProps) {
  // Ensure all required data is available
  if (!name || !description || !url) {
    return null
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["ClothingStore", "OnlineStore", "FashionStore"],
    "name": name,
    "description": description,
    "url": url,
    "telephone": telephone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressRegion": address.addressRegion,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-26.2041",
      "longitude": "28.0473"
    },
    "openingHours": "Mo-Su 00:00-23:59",
    "paymentAccepted": ["Credit Card", "Debit Card", "Yoco"],
    "priceRange": "$$",
    "areaServed": {
      "@type": "Country",
      "name": "South Africa"
    },
    "sameAs": [
      "https://www.instagram.com/_c.a.a.r.l",
      "https://www.tiktok.com/@_c.a.a.r.l"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Fashion Collections",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Designer Clothing",
          "description": "Curated collection of premium designer clothing"
        },
        {
          "@type": "OfferCatalog", 
          "name": "Statement Sneakers",
          "description": "Exclusive designer and luxury sneakers"
        },
        {
          "@type": "OfferCatalog",
          "name": "Luxury Fragrances", 
          "description": "Premium perfumes and luxury fragrances"
        }
      ]
    }
  }

  return (
    <script
      id="business-structured-data"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface ProductStructuredDataProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    image_url?: string
    category?: string
    brand?: string
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  }
}

export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image_url || "/placeholder.jpg",
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Apparel Cast"
    },
    "category": product.category || "Fashion",
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "ZAR",
      "availability": `https://schema.org/${product.availability || 'InStock'}`,
      "seller": {
        "@type": "Organization",
        "name": "Apparel Cast Fashion Store"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "10"
    }
  }

  return (
    <script
      id={`product-structured-data-${product.id}`}
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Apparel Cast Fashion Store",
      "url": "https://apparelcast.shop",
    "description": "Premium women's fashion, designer sneakers, and luxury perfumes in South Africa",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://apparelcast.shop/products?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Apparel Cast Fashion Store",
      "logo": {
        "@type": "ImageObject",
        "url": "https://apparelcast.shop/apparelcast.png"
      }
    }
  }

  return (
    <script
      id="website-structured-data"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface ItemListStructuredDataProps {
  items: Array<{
    name: string
    url: string
    image?: string
  }>
}

export function ItemListStructuredData({ items }: ItemListStructuredDataProps) {
  if (!items || items.length === 0) return null

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": item.name,
        "url": item.url,
        ...(item.image ? { "image": item.image } : {})
      }
    }))
  }

  return (
    <script
      id="itemlist-structured-data"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}