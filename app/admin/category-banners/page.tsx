import { CategoryBannerManagement } from '@/components/category-banner-management'

export default function CategoryBannersPage() {
  return (
    <div className="container mx-auto py-8">
      <CategoryBannerManagement />
    </div>
  )
}

export const metadata = {
  title: 'Category Banner Management - Admin',
  description: 'Manage category banners and badges for the store'
}