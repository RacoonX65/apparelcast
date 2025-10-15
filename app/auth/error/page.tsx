import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <>
      <Header />
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#FFF9F5]">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-3xl font-serif text-[#1a1a1a]">ApparelCast</h1>
            </div>
          <Card className="border-[#E8D5D0]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1a1a1a]">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {params?.error ? (
                <p className="text-sm text-[#666]">Error: {params.error}</p>
              ) : (
                <p className="text-sm text-[#666]">An authentication error occurred.</p>
              )}
              <Button asChild className="w-full bg-[#FADADD] hover:bg-[#F7C8D7] text-[#1a1a1a]">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      <Footer />
    </>
  )
}
