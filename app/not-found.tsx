import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <h1 className="text-6xl font-serif font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">The page you're looking for doesn't exist or has been moved.</p>
          <Button asChild size="lg" className="bg-primary hover:bg-accent">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
