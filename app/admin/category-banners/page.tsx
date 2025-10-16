import { CategoryBannerManagement } from '@/components/category-banner-management'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CategoryBannersPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Category Banner Management</h1>
          <p className="text-muted-foreground">Manage category banners and badges for the store</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">Back to Dashboard</Link>
        </Button>
      </div>
      <CategoryBannerManagement />
    </div>
  )
}

export const metadata = {
  title: 'Category Banner Management - Admin',
  description: 'Manage category banners and badges for the store'
}