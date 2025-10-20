"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams: Record<string, string>
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    return `${baseUrl}?${params.toString()}`
  }

  const showDots = (page: number) => {
    return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages
  }

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (showDots(i)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1) // -1 represents dots
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={currentPage <= 1}
      >
        <Link href={createPageUrl(currentPage - 1)}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Link>
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === -1) {
            return (
              <span key={`dots-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            )
          }

          return (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={createPageUrl(page)}>
                {page}
              </Link>
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={currentPage >= totalPages}
      >
        <Link href={createPageUrl(currentPage + 1)}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}