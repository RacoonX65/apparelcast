import Script from 'next/script'

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
  name = "CAARL Fashion Store",
  description = "Premium women's fashion, designer sneakers, and luxury perfumes in South Africa",
  url = "https://caarl.co.za",
  telephone = ["+27634009626", "+27728003053"],
  address = {
    streetAddress: "Online Store",
    addressLocality: "Johannesburg",
    addressRegion: "Gauteng",
    postalCode: "2000",
    addressCountry: "ZA"
  }
}: BusinessStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
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
    "paymentAccepted": ["Credit Card", "Debit Card", "PayStack"],
    "priceRange": "$$",
    "areaServed": {
      "@type": "Country",
      "name": "South Africa"
    },
    "sameAs": [
      "https://www.instagram.com/_c.a.a.r.l",
      "https://www.tiktok.com/@_c.a.a.r.l"
    ]
  }

  return (
    <Script
      id="business-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
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
      "name": product.brand || "CAARL"
    },
    "category": product.category || "Fashion",
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "ZAR",
      "availability": `https://schema.org/${product.availability || 'InStock'}`,
      "seller": {
        "@type": "Organization",
        "name": "CAARL Fashion Store"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "10"
    }
  }

  return (
    <Script
      id={`product-structured-data-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CAARL Fashion Store",
    "url": "https://caarl.co.za",
    "description": "Premium women's fashion, designer sneakers, and luxury perfumes in South Africa",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://caarl.co.za/products?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CAARL Fashion Store",
      "logo": {
        "@type": "ImageObject",
        "url": "https://caarl.co.za/placeholder.jpg"
      }
    }
  }

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}