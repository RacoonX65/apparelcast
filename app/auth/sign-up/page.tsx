"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}`,
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#FFF9F5]">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-3xl font-serif text-[#1a1a1a]">ApparelCast</h1>
              <p className="text-sm text-[#666]">Create your account</p>
            </div>
          <Card className="border-[#E8D5D0]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1a1a1a]">Sign up</CardTitle>
              <CardDescription className="text-[#666]">Join Caarl and start shopping</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-[#E8D5D0] hover:bg-[#FFF9F5] bg-transparent"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#E8D5D0]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-[#666]">Or continue with email</span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-[#1a1a1a]">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Jane Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-[#E8D5D0] focus:border-[#FADADD]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-[#1a1a1a]">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+27 XX XXX XXXX"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border-[#E8D5D0] focus:border-[#FADADD]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-[#1a1a1a]">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-[#E8D5D0] focus:border-[#FADADD]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-[#1a1a1a]">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-[#E8D5D0] focus:border-[#FADADD]"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-[#FADADD] hover:bg-[#F7C8D7] text-[#1a1a1a]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Sign up"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-[#666]">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-[#1a1a1a] underline underline-offset-4 hover:text-[#FADADD]">
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      <Footer />
    </>
  )
}
