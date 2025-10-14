import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#FFF9F5]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-serif text-[#1a1a1a]">Caarl</h1>
          </div>
          <Card className="border-[#E8D5D0]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1a1a1a]">Check your email</CardTitle>
              <CardDescription className="text-[#666]">We&apos;ve sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[#666]">
                Please check your email and click the confirmation link to activate your account. Once confirmed, you
                can start shopping!
              </p>
              <Button asChild className="w-full bg-[#FADADD] hover:bg-[#F7C8D7] text-[#1a1a1a]">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
