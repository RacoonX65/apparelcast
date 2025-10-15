import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params
  return {
    alternates: {
      canonical: `https://apparelcast.shop/products/${id}`,
    },
  }
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}